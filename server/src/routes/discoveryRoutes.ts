import express from "express";
import { pool } from "../config/database";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

// ============================================
// DISCOVER STUDENTS  (protected)
// ============================================

router.get("/", requireAuth, async (req, res) => {
  try {
    const {
      search,
      college,
      department,
      interest,
      year,
      location,
    } = req.query;

    // Always exclude the requester from results
    const currentUserId = req.user!.userId;

    let query = `
      SELECT
        id,
        name,
        email,
        college,
        department,
        year,
        location,
        interest,
        github_url,
        linkedin_url,
        portfolio_url,
        avatar_url
      FROM users
      WHERE id != $1
    `;

    const values: (string | number)[] = [currentUserId];
    let index = 2;

    if (search) {
      query += `
        AND (
          name       ILIKE $${index}
          OR college    ILIKE $${index}
          OR department ILIKE $${index}
          OR location   ILIKE $${index}
        )
      `;
      values.push(`%${search}%`);
      index++;
    }

    if (college) {
      query += ` AND college ILIKE $${index}`;
      values.push(`%${college}%`);
      index++;
    }

    if (department) {
      query += ` AND department ILIKE $${index}`;
      values.push(`%${department}%`);
      index++;
    }

    if (interest) {
      query += ` AND interest = $${index}`;
      values.push(String(interest));
      index++;
    }

    if (year) {
      query += ` AND year ILIKE $${index}`;
      values.push(`%${year}%`);
      index++;
    }

    if (location) {
      query += ` AND location ILIKE $${index}`;
      values.push(`%${location}%`);
      index++;
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;

    const result = await pool.query(query, values);

    return res.json({
      success: true,
      students: result.rows,
    });

  } catch (error) {
    console.error("Discovery error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to discover students",
    });
  }
});

export default router;
