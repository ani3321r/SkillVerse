import express from "express";
import { pool } from "../config/database";

const router = express.Router();


// ==========================================
// GET DASHBOARD
// ==========================================

router.get("/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }


    // ==========================================
    // GET USER
    // ==========================================

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
        interest
      FROM users
      WHERE id = $1
      `,
      [userId]
    );


    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    // ==========================================
    // GET USER SKILLS
    // ==========================================

    const skillsResult = await pool.query(
      `
      SELECT
        us.id,
        us.skill_id,
        s.name,
        s.category,
        us.progress,
        us.score,
        us.level,
        us.assignments_completed
      FROM user_skills us
      JOIN skills s
        ON s.id = us.skill_id
      WHERE us.user_id = $1
      ORDER BY us.progress DESC
      `,
      [userId]
    );


    // ==========================================
    // TOTAL ASSIGNMENTS
    // ==========================================

    const assignmentsResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total
      FROM assignment_submissions
      WHERE user_id = $1
      `,
      [userId]
    );


    // ==========================================
    // OVERALL PROGRESS
    // ==========================================

    let overallProgress = 0;

    if (skillsResult.rows.length > 0) {

      const totalProgress =
        skillsResult.rows.reduce(
          (sum, skill) =>
            sum + Number(skill.progress || 0),
          0
        );

      overallProgress = Math.round(
        totalProgress / skillsResult.rows.length
      );
    }


    return res.json({
      success: true,

      user: userResult.rows[0],

      stats: {
        verifiedSkills: skillsResult.rows.length,
        overallProgress,
        assignments: Number(
          assignmentsResult.rows[0].total
        ),
      },

      skills: skillsResult.rows,
    });

  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
});


export default router;