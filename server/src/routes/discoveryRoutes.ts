import express from "express";
import { pool } from "../config/database";

const router = express.Router();

// ============================================
// DISCOVER STUDENTS
// ============================================

router.get("/", async (req, res) => {
  try {
    const {
      search,
      college,
      department,
      interest,
      year,
      location,
      userId,
    } = req.query;

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
      WHERE 1 = 1
    `;

    const values: any[] = [];
    let index = 1;

    // ==========================================
    // EXCLUDE CURRENT USER
    // ==========================================

    if (userId) {
      query += ` AND id != $${index}`;
      values.push(Number(userId));
      index++;
    }

    // ==========================================
    // SEARCH
    // ==========================================

    if (search) {
      query += `
        AND (
          name ILIKE $${index}
          OR college ILIKE $${index}
          OR department ILIKE $${index}
          OR location ILIKE $${index}
        )
      `;

      values.push(`%${search}%`);
      index++;
    }

    // ==========================================
    // COLLEGE FILTER
    // ==========================================

    if (college) {
      query += ` AND college ILIKE $${index}`;
      values.push(`%${college}%`);
      index++;
    }

    // ==========================================
    // DEPARTMENT FILTER
    // ==========================================

    if (department) {
      query += ` AND department ILIKE $${index}`;
      values.push(`%${department}%`);
      index++;
    }

    // ==========================================
    // INTEREST FILTER
    // ==========================================

    if (interest) {
      query += ` AND interest = $${index}`;
      values.push(interest);
      index++;
    }

    // ==========================================
    // YEAR FILTER
    // ==========================================

    if (year) {
      query += ` AND year ILIKE $${index}`;
      values.push(`%${year}%`);
      index++;
    }

    // ==========================================
    // LOCATION FILTER
    // ==========================================

    if (location) {
      query += ` AND location ILIKE $${index}`;
      values.push(`%${location}%`);
      index++;
    }

    // ==========================================
    // ORDER
    // ==========================================

    query += `
      ORDER BY created_at DESC
      LIMIT 50
    `;

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