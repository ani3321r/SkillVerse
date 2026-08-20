import express from "express";
import { pool } from "../config/database";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

// ============================================
// GET ALL STUDENTS  (protected)
// ============================================

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.college,
        u.department,
        u.year,
        u.location,
        u.interest,
        u.avatar_url,
        COALESCE(
          ARRAY_AGG(DISTINCT s.name)
          FILTER (WHERE s.name IS NOT NULL),
          '{}'
        ) AS skills
      FROM users u
      LEFT JOIN user_skills us ON us.user_id = u.id
      LEFT JOIN skills s ON s.id = us.skill_id
      GROUP BY
        u.id, u.name, u.email, u.college,
        u.department, u.year, u.location,
        u.interest, u.avatar_url
      ORDER BY u.name ASC
    `);

    return res.json({
      success: true,
      students: result.rows,
    });

  } catch (error) {
    console.error("Get students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get students",
    });
  }
});

// ============================================
// SEARCH STUDENTS  (protected)
// ============================================

router.get("/search", requireAuth, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();

    if (!q) {
      return res.json({ success: true, students: [] });
    }

    const search = `%${q}%`;

    const result = await pool.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.college,
        u.department,
        u.year,
        u.location,
        u.interest,
        u.avatar_url,
        COALESCE(
          ARRAY_AGG(DISTINCT s.name)
          FILTER (WHERE s.name IS NOT NULL),
          '{}'
        ) AS skills
      FROM users u
      LEFT JOIN user_skills us ON us.user_id = u.id
      LEFT JOIN skills s ON s.id = us.skill_id
      WHERE
        u.name       ILIKE $1
        OR u.college    ILIKE $1
        OR u.department ILIKE $1
        OR u.location   ILIKE $1
        OR u.interest   ILIKE $1
        OR s.name       ILIKE $1
      GROUP BY
        u.id, u.name, u.email, u.college,
        u.department, u.year, u.location,
        u.interest, u.avatar_url
      ORDER BY u.name ASC
      `,
      [search]
    );

    return res.json({
      success: true,
      students: result.rows,
    });

  } catch (error) {
    console.error("Search students error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search students",
    });
  }
});

// ============================================
// GET SINGLE STUDENT  (protected)
// ============================================

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const studentId = Number(req.params.id);

    if (!studentId || isNaN(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }

    const userResult = await pool.query(
      `
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
      WHERE id = $1
      `,
      [studentId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const skillsResult = await pool.query(
      `
      SELECT
        s.id,
        s.name,
        s.category,
        s.description,
        us.progress,
        us.score,
        us.level,
        us.assignments_completed,
        us.tests_completed
      FROM user_skills us
      INNER JOIN skills s ON s.id = us.skill_id
      WHERE us.user_id = $1
      ORDER BY us.progress DESC
      `,
      [studentId]
    );

    return res.json({
      success: true,
      student: userResult.rows[0],
      skills: skillsResult.rows,
    });

  } catch (error) {
    console.error("Get student error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get student",
    });
  }
});

export default router;
