import express from "express";
import { pool } from "../config/database";

const router = express.Router();

// ============================================
// GOOGLE LOGIN
// ============================================

router.post("/google", async (req, res) => {
  try {
    const {
      googleId,
      email,
      name,
      picture,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!googleId || !email) {
      return res.status(400).json({
        success: false,
        message: "Google ID and email are required",
      });
    }

    // ==========================================
    // CHECK EXISTING USER
    // ==========================================

    const existingUser = await pool.query(
      `
      SELECT
        id,
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
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    // ==========================================
    // EXISTING USER
    // ==========================================

    if (existingUser.rows.length > 0) {
      return res.json({
        success: true,
        isNewUser: false,
        message: "Login successful",
        user: existingUser.rows[0],
      });
    }

    // ==========================================
    // CREATE NEW USER
    // ==========================================

    const newUser = await pool.query(
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
        avatar_url
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      RETURNING
        id,
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
      `,
      [
        googleId,
        name || "Google User",
        email,
        "Not Set",
        "Not Set",
        "Not Set",
        "Not Set",
        "software",
        picture || null,
      ]
    );

    return res.status(201).json({
      success: true,
      isNewUser: true,
      message: "Account created successfully",
      user: newUser.rows[0],
    });

  } catch (error: any) {

    console.error(
      "Google authentication error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
      error: error?.message,
    });
  }
});

export default router;