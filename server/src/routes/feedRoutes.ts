import express from "express";
import { pool } from "../config/database";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

// ============================================
// GET ALL POSTS  (protected)
// ============================================

router.get("/", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.content,
        p.image_url,
        p.created_at,
        p.updated_at,
        u.id          AS user_id,
        u.name        AS user_name,
        u.email       AS user_email,
        u.college,
        u.department,
        u.avatar_url,
        COUNT(DISTINCT pl.id)::int AS like_count,
        COUNT(DISTINCT pc.id)::int AS comment_count
      FROM posts p
      JOIN users u
        ON u.id = p.user_id
      LEFT JOIN post_likes pl
        ON pl.post_id = p.id
      LEFT JOIN post_comments pc
        ON pc.post_id = p.id
      GROUP BY p.id, u.id
      ORDER BY p.created_at DESC
    `);

    return res.json({
      success: true,
      posts: result.rows,
    });

  } catch (error) {
    console.error("Get feed error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get feed",
    });
  }
});

// ============================================
// CREATE POST  (protected)
// ============================================

router.post("/", requireAuth, async (req, res) => {
  try {
    const { userId, content, imageUrl } = req.body;

    if (!userId || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "User ID and content are required",
      });
    }

    if (req.user!.userId !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only create posts as yourself",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO posts (user_id, content, image_url)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [userId, content.trim(), imageUrl || null]
    );

    return res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: result.rows[0],
    });

  } catch (error) {
    console.error("Create post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create post",
    });
  }
});

// ============================================
// DELETE POST  (protected, owner only)
// ============================================

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const postId = Number(req.params.id);

    if (!postId || isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    // The WHERE user_id = req.user.userId ensures
    // only the owner can delete
    const result = await pool.query(
      `
      DELETE FROM posts
      WHERE id = $1
        AND user_id = $2
      RETURNING id
      `,
      [postId, req.user!.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Post not found or you do not have permission to delete it",
      });
    }

    return res.json({
      success: true,
      message: "Post deleted successfully",
    });

  } catch (error) {
    console.error("Delete post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete post",
    });
  }
});

// ============================================
// TOGGLE LIKE  (protected)
// ============================================

router.post("/:id/like", requireAuth, async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const userId = req.user!.userId; // use token, not body

    if (!postId || isNaN(postId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
    }

    const existingLike = await pool.query(
      `
      SELECT id FROM post_likes
      WHERE post_id = $1 AND user_id = $2
      `,
      [postId, userId]
    );

    if (existingLike.rows.length > 0) {
      // Unlike
      await pool.query(
        `DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2`,
        [postId, userId]
      );

      return res.json({ success: true, liked: false, message: "Post unliked" });
    }

    // Like
    await pool.query(
      `INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)`,
      [postId, userId]
    );

    return res.json({ success: true, liked: true, message: "Post liked" });

  } catch (error) {
    console.error("Like post error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to toggle like",
    });
  }
});

// ============================================
// GET COMMENTS  (protected)
// ============================================

router.get("/:id/comments", requireAuth, async (req, res) => {
  try {
    const postId = Number(req.params.id);

    if (!postId || isNaN(postId)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    const result = await pool.query(
      `
      SELECT
        pc.id,
        pc.comment,
        pc.created_at,
        u.id         AS user_id,
        u.name       AS user_name,
        u.avatar_url
      FROM post_comments pc
      JOIN users u ON u.id = pc.user_id
      WHERE pc.post_id = $1
      ORDER BY pc.created_at ASC
      `,
      [postId]
    );

    return res.json({
      success: true,
      comments: result.rows,
    });

  } catch (error) {
    console.error("Get comments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get comments",
    });
  }
});

// ============================================
// ADD COMMENT  (protected)
// ============================================

router.post("/:id/comments", requireAuth, async (req, res) => {
  try {
    const postId = Number(req.params.id);
    const { comment } = req.body;
    const userId = req.user!.userId; // use token

    if (!postId || isNaN(postId)) {
      return res.status(400).json({ success: false, message: "Invalid post ID" });
    }

    if (!comment?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment text is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO post_comments (post_id, user_id, comment)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [postId, userId, comment.trim()]
    );

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: result.rows[0],
    });

  } catch (error) {
    console.error("Add comment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
});

export default router;
