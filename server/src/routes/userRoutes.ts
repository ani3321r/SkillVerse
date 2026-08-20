import express from "express";
import { pool } from "../config/database";

const router = express.Router();

router.post("/profile", async (req, res) => {
  try {
    console.log("PROFILE ROUTE HIT");
    console.log("Received:", req.body);

    const {
      googleId,
      name,
      email,
      college,
      department,
      year,
      location,
      interest,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      avatarUrl,
    } = req.body;

    if (
      !name ||
      !email ||
      !college ||
      !department ||
      !year ||
      !location ||
      !interest
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      const userId = existingUser.rows[0].id;

      const result = await pool.query(
        `
        UPDATE users
        SET
          google_id = $1,
          name = $2,
          college = $3,
          department = $4,
          year = $5,
          location = $6,
          interest = $7,
          github_url = $8,
          linkedin_url = $9,
          portfolio_url = $10,
          avatar_url = $11,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
        RETURNING *
        `,
        [
          googleId || null,
          name,
          college,
          department,
          year,
          location,
          interest,
          githubUrl || null,
          linkedinUrl || null,
          portfolioUrl || null,
          avatarUrl || null,
          userId,
        ]
      );

      return res.json({
        success: true,
        message: "Profile updated successfully",
        user: result.rows[0],
      });
    }

    const result = await pool.query(
      `
      INSERT INTO users (
        google_id,
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
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12
      )
      RETURNING *
      `,
      [
        googleId || null,
        name,
        email,
        college,
        department,
        year,
        location,
        interest,
        githubUrl || null,
        linkedinUrl || null,
        portfolioUrl || null,
        avatarUrl || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Profile created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Create profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save profile",
    });
  }
});
// ============================================
// GET USER PROFILE
// ============================================

router.get("/profile", async (req, res) => {
  try {
    const email = req.query.email as string;

    console.log("GET PROFILE:", email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const result = await pool.query(
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
        avatar_url,
        created_at,
        updated_at
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Get profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
});

export default router;