import express from "express";
import { pool } from "../config/database";
import { requireAuth } from "../middleware/auth";
import { crawlAllHackathons } from "../crawler/hackathonCrawler";

const router = express.Router();

// ============================================
// GET HACKATHONS  (public)
// ============================================

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        organizer,
        description,
        registration_url,
        event_url,
        start_date,
        end_date,
        registration_deadline,
        location,
        is_online,
        technologies,
        source,
        created_at
      FROM hackathons
      ORDER BY
        registration_deadline ASC NULLS LAST,
        created_at DESC
    `);

    return res.json({
      success: true,
      hackathons: result.rows,
    });

  } catch (error) {
    console.error("Get hackathons error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get hackathons",
    });
  }
});

// ============================================
// GET SINGLE HACKATHON  (public)
// ============================================

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hackathon ID",
      });
    }

    const result = await pool.query(
      `SELECT * FROM hackathons WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Hackathon not found",
      });
    }

    return res.json({
      success: true,
      hackathon: result.rows[0],
    });

  } catch (error) {
    console.error("Get hackathon error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get hackathon",
    });
  }
});

// ============================================
// RUN CRAWLER  (protected — any logged-in user)
// ============================================

router.post("/crawl", requireAuth, async (req, res) => {
  try {
    console.log("Starting hackathon crawler...");

    const hackathons = await crawlAllHackathons();

    let saved = 0;

    for (const hackathon of hackathons) {
      await pool.query(
        `
        INSERT INTO hackathons (
          title, organizer, description,
          registration_url, event_url,
          start_date, end_date, registration_deadline,
          location, is_online, technologies, source
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (event_url)
        DO UPDATE SET
          title                 = EXCLUDED.title,
          organizer             = EXCLUDED.organizer,
          description           = EXCLUDED.description,
          registration_url      = EXCLUDED.registration_url,
          start_date            = EXCLUDED.start_date,
          end_date              = EXCLUDED.end_date,
          registration_deadline = EXCLUDED.registration_deadline,
          location              = EXCLUDED.location,
          is_online             = EXCLUDED.is_online,
          technologies          = EXCLUDED.technologies,
          source                = EXCLUDED.source,
          updated_at            = CURRENT_TIMESTAMP
        `,
        [
          hackathon.title,
          hackathon.organizer,
          hackathon.description,
          hackathon.registrationUrl,
          hackathon.eventUrl,
          hackathon.startDate,
          hackathon.endDate,
          hackathon.registrationDeadline,
          hackathon.location,
          hackathon.isOnline,
          hackathon.technologies,
          hackathon.source,
        ]
      );

      saved++;
    }

    return res.json({
      success: true,
      message: "Hackathon crawling completed",
      found: hackathons.length,
      saved,
    });

  } catch (error) {
    console.error("Crawler error:", error);

    return res.status(500).json({
      success: false,
      message: "Hackathon crawler failed",
    });
  }
});

export default router;
