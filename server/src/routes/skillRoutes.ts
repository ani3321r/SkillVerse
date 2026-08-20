import express from "express";
import { pool } from "../config/database";

const router = express.Router();

// ============================================
// GET ALL SKILLS
// ============================================

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        category,
        description
      FROM skills
      ORDER BY name ASC
      `
    );

    return res.json({
      success: true,
      skills: result.rows,
    });

  } catch (error) {
    console.error("Get skills error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get skills",
    });
  }
});


// ============================================
// ADD SKILL TO USER
// ============================================

router.post("/user", async (req, res) => {
  try {
    const { userId, skillId } = req.body;

    if (!userId || !skillId) {
      return res.status(400).json({
        success: false,
        message: "userId and skillId are required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO user_skills (
        user_id,
        skill_id
      )
      VALUES ($1, $2)

      ON CONFLICT (user_id, skill_id)
      DO UPDATE SET
        updated_at = CURRENT_TIMESTAMP

      RETURNING *
      `,
      [userId, skillId]
    );

    return res.status(201).json({
      success: true,
      message: "Skill added successfully",
      userSkill: result.rows[0],
    });

  } catch (error) {
    console.error("Add user skill error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add skill",
    });
  }
});


// ============================================
// GET USER SKILLS
// ============================================

router.get("/user/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const result = await pool.query(
      `
      SELECT
        us.id,
        us.progress,
        us.score,
        us.level,
        us.assignments_completed,
        us.tests_completed,

        s.id AS skill_id,
        s.name,
        s.category,
        s.description

      FROM user_skills us

      INNER JOIN skills s
        ON s.id = us.skill_id

      WHERE us.user_id = $1

      ORDER BY us.progress DESC
      `,
      [userId]
    );

    return res.json({
      success: true,
      skills: result.rows,
    });

  } catch (error) {
    console.error("Get user skills error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get user skills",
    });
  }
});


export default router;