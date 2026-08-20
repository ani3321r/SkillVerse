import express from "express";
import { pool } from "../config/database";

const router = express.Router();


// =====================================================
// CREATE OR GET ONE-TO-ONE CONVERSATION
// =====================================================

router.post("/conversations", async (req, res) => {
  try {
    const { userId, otherUserId } = req.body;

    const currentUserId = Number(userId);
    const targetUserId = Number(otherUserId);

    if (!currentUserId || !targetUserId) {
      return res.status(400).json({
        success: false,
        message: "userId and otherUserId are required",
      });
    }

    if (currentUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with yourself",
      });
    }


    // -------------------------------------------------
    // Check that both users exist
    // -------------------------------------------------

    const usersResult = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = ANY($1::integer[])
      `,
      [[currentUserId, targetUserId]]
    );

    if (usersResult.rows.length !== 2) {
      return res.status(404).json({
        success: false,
        message: "One or both users do not exist",
      });
    }


    // -------------------------------------------------
    // Check existing conversation
    // -------------------------------------------------

    const existingConversation = await pool.query(
      `
      SELECT c.id

      FROM conversations c

      INNER JOIN conversation_members cm1
        ON cm1.conversation_id = c.id

      INNER JOIN conversation_members cm2
        ON cm2.conversation_id = c.id

      WHERE cm1.user_id = $1
        AND cm2.user_id = $2

      LIMIT 1
      `,
      [currentUserId, targetUserId]
    );


    if (existingConversation.rows.length > 0) {
      return res.json({
        success: true,
        conversationId:
          existingConversation.rows[0].id,
      });
    }


    // -------------------------------------------------
    // Create new conversation
    // -------------------------------------------------

    const conversationResult = await pool.query(
      `
      INSERT INTO conversations
      DEFAULT VALUES
      RETURNING id
      `
    );

    const conversationId =
      conversationResult.rows[0].id;


    // -------------------------------------------------
    // Add both users
    // -------------------------------------------------

    await pool.query(
      `
      INSERT INTO conversation_members
      (
        conversation_id,
        user_id
      )

      VALUES
      ($1, $2),
      ($1, $3)
      `,
      [
        conversationId,
        currentUserId,
        targetUserId,
      ]
    );


    return res.status(201).json({
      success: true,
      conversationId,
    });

  } catch (error) {

    console.error(
      "Create conversation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
});


// =====================================================
// GET USER CONVERSATIONS
// =====================================================

router.get("/conversations", async (req, res) => {
  try {

    const userId =
      Number(req.query.userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }


    const result = await pool.query(
      `
      SELECT
        c.id AS conversation_id,

        other.id AS other_user_id,

        other.name AS other_user_name,

        other.email AS other_user_email,

        other.avatar_url AS other_user_avatar,

        last_message.message AS last_message,

        last_message.created_at AS last_message_time

      FROM conversations c

      INNER JOIN conversation_members current_member
        ON current_member.conversation_id = c.id

      INNER JOIN conversation_members other_member
        ON other_member.conversation_id = c.id

      INNER JOIN users other
        ON other.id = other_member.user_id

      LEFT JOIN LATERAL (
        SELECT
          message,
          created_at

        FROM messages

        WHERE conversation_id = c.id

        ORDER BY created_at DESC

        LIMIT 1
      ) last_message
        ON true

      WHERE current_member.user_id = $1
        AND other_member.user_id != $1

      ORDER BY
        COALESCE(
          last_message.created_at,
          c.created_at
        ) DESC
      `,
      [userId]
    );


    return res.json({
      success: true,
      conversations: result.rows,
    });

  } catch (error) {

    console.error(
      "Get conversations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get conversations",
    });
  }
});


// =====================================================
// GET MESSAGES
// =====================================================

router.get(
  "/conversations/:conversationId/messages",
  async (req, res) => {

    try {

      const conversationId =
        Number(req.params.conversationId);

      const userId =
        Number(req.query.userId);


      if (!conversationId || !userId) {
        return res.status(400).json({
          success: false,
          message:
            "conversationId and userId are required",
        });
      }


      // ------------------------------------------------
      // Verify user belongs to conversation
      // ------------------------------------------------

      const memberCheck =
        await pool.query(
          `
          SELECT id

          FROM conversation_members

          WHERE conversation_id = $1
            AND user_id = $2

          LIMIT 1
          `,
          [
            conversationId,
            userId,
          ]
        );


      if (memberCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message:
            "You are not a member of this conversation",
        });
      }


      // ------------------------------------------------
      // Get messages
      // ------------------------------------------------

      const result = await pool.query(
        `
        SELECT
          m.id,
          m.conversation_id,
          m.sender_id,
          m.message,
          m.created_at,

          u.name AS sender_name,

          u.avatar_url AS sender_avatar

        FROM messages m

        INNER JOIN users u
          ON u.id = m.sender_id

        WHERE m.conversation_id = $1

        ORDER BY
          m.created_at ASC
        `,
        [conversationId]
      );


      return res.json({
        success: true,
        messages: result.rows,
      });

    } catch (error) {

      console.error(
        "Get messages error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Failed to get messages",
      });
    }
  }
);


export default router;