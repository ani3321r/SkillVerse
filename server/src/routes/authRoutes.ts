import express from "express";
import { pool } from "../config/database";
import { signToken } from "../middleware/auth";
import { sendWelcomeEmail } from "../services/emailService";

const router = express.Router();

// ============================================
// GOOGLE LOGIN / REGISTER
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
    // LOOK UP BY google_id OR email
    // (handles the case where a user registered
    // by email first, then tries Google login)
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
      WHERE google_id = $1
        OR email = $2
      LIMIT 1
      `,
      [googleId, email]
    );

    // ==========================================
    // EXISTING USER
    // ==========================================

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];

      // Backfill google_id if the account was
      // created before Google login existed.
      if (!user.google_id) {
        await pool.query(
          `
          UPDATE users
          SET
            google_id = $1,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          `,
          [googleId, user.id]
        );

        user.google_id = googleId;
      }

      const token = signToken({
        userId: user.id,
        email: user.email,
      });

      return res.json({
        success: true,
        isNewUser: false,
        message: "Login successful",
        token,
        user,
      });
    }

    // ==========================================
    // CREATE NEW USER
    // Placeholder values for required fields —
    // the client will send the user to
    // /setup-profile to fill these in.
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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

    const user = newUser.rows[0];

    const token = signToken({
      userId: user.id,
      email: user.email,
    });

    // Send welcome email (fire-and-forget — never blocks the response)
    sendWelcomeEmail({ to: user.email, name: user.name });

    return res.status(201).json({
      success: true,
      isNewUser: true,
      message: "Account created successfully",
      token,
      user,
    });

  } catch (error: any) {
    console.error("Google authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
      error: error?.message,
    });
  }
});

export default router;
