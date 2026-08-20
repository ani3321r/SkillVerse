import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import { pool } from "./config/database";
import userRoutes from "./routes/userRoutes";
import skillRoutes from "./routes/skillRoutes";
import aiRoutes from "./routes/aiRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import hackathonRoutes from "./routes/hackathonRoutes";
import studentRoutes from "./routes/studentRoutes";
import authRoutes from "./routes/authRoutes";
import feedRoutes from "./routes/feedRoutes";
import discoveryRoutes from "./routes/discoveryRoutes";
import chatRoutes from "./routes/chatRoutes";

dotenv.config();

const app = express();

const httpServer = createServer(app);

const PORT =
  Number(process.env.PORT) || 5000;
  // ============================================
// SOCKET.IO
// ============================================

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());

app.use(express.json());


// ============================================
// API ROUTES
// ============================================

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/skills", skillRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);
app.use(
  "/api/hackathons",
  hackathonRoutes
);
app.use("/api/students", studentRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/discover", discoveryRoutes);
app.use("/api/chat", chatRoutes);

// ============================================
// HOME
// ============================================

app.get("/", (req, res) => {
  res.json({
    message: "SkillVerse API is running 🚀",
  });
});


// ============================================
// DATABASE TEST
// ============================================

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS current_time"
    );

    return res.json({
      success: true,
      message: "PostgreSQL connected successfully 🎉",
      databaseTime: result.rows[0].current_time,
    });

  } catch (error) {

    console.error("Database error:", error);

    return res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// =====================================================
// SOCKET.IO CHAT
// =====================================================

io.on("connection", (socket) => {

  console.log(
    "Socket connected:",
    socket.id
  );


  // ===================================================
  // USER ROOM
  // ===================================================

  socket.on(
    "join-user",
    (userId: number) => {

      if (!userId) {
        return;
      }

      const room =
        `user-${userId}`;

      socket.join(room);

      console.log(
        `User ${userId} joined ${room}`
      );
    }
  );


  // ===================================================
  // CONVERSATION ROOM
  // ===================================================

  socket.on(
    "join-conversation",
    async (data) => {

      try {

        const {
          conversationId,
          userId,
        } = data;

        if (
          !conversationId ||
          !userId
        ) {
          return;
        }


        // ---------------------------------------------
        // Verify membership
        // ---------------------------------------------

        const member =
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


        if (member.rows.length === 0) {

          console.log(
            `User ${userId} attempted to join unauthorized conversation`
          );

          return;
        }


        const room =
          `conversation-${conversationId}`;

        socket.join(room);

        console.log(
          `User ${userId} joined ${room}`
        );

      } catch (error) {

        console.error(
          "Join conversation error:",
          error
        );
      }
    }
  );


  // ===================================================
  // SEND MESSAGE
  // ===================================================

  socket.on(
    "send-message",
    async (data) => {

      try {

        const {
          conversationId,
          senderId,
          message,
        } = data;


        if (
          !conversationId ||
          !senderId ||
          !message?.trim()
        ) {
          return;
        }


        // ---------------------------------------------
        // Verify sender belongs to conversation
        // ---------------------------------------------

        const member =
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
              senderId,
            ]
          );


        if (member.rows.length === 0) {

          console.log(
            "Unauthorized message attempt"
          );

          return;
        }


        // ---------------------------------------------
        // Save message
        // ---------------------------------------------

        const result =
          await pool.query(
            `
            INSERT INTO messages
            (
              conversation_id,
              sender_id,
              message
            )

            VALUES
            ($1, $2, $3)

            RETURNING
              id,
              conversation_id,
              sender_id,
              message,
              created_at
            `,
            [
              conversationId,
              senderId,
              message.trim(),
            ]
          );


        const savedMessage =
          result.rows[0];


        // ---------------------------------------------
        // Update conversation
        // ---------------------------------------------

        await pool.query(
          `
          UPDATE conversations

          SET updated_at =
            CURRENT_TIMESTAMP

          WHERE id = $1
          `,
          [conversationId]
        );


        // ---------------------------------------------
        // Broadcast message
        // ---------------------------------------------

        io
          .to(
            `conversation-${conversationId}`
          )
          .emit(
            "new-message",
            savedMessage
          );


      } catch (error) {

        console.error(
          "Send message error:",
          error
        );
      }
    }
  );


  // ===================================================
  // DISCONNECT
  // ===================================================

  socket.on(
    "disconnect",
    () => {

      console.log(
        "Socket disconnected:",
        socket.id
      );

    }
  );

});
// ============================================
// START SERVER
// ============================================

httpServer.listen(PORT, () => {
  console.log(
    `SkillVerse server running on http://localhost:${PORT}`
  );
});