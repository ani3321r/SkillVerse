// dotenv MUST be first so every module sees the env vars
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import { pool } from "./config/database";
import { registerSocketHandlers } from "./socket/index";

import authRoutes      from "./routes/authRoutes";
import userRoutes      from "./routes/userRoutes";
import skillRoutes     from "./routes/skillRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import aiRoutes        from "./routes/aiRoutes";
import hackathonRoutes from "./routes/hackathonRoutes";
import studentRoutes   from "./routes/studentRoutes";
import feedRoutes      from "./routes/feedRoutes";
import discoveryRoutes from "./routes/discoveryRoutes";
import chatRoutes      from "./routes/chatRoutes";

// ============================================
// APP + HTTP SERVER
// ============================================

const app = express();

const httpServer = createServer(app);

const PORT = Number(process.env.PORT) || 5000;

// ============================================
// SOCKET.IO
// ============================================

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

registerSocketHandlers(io);

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());

// ============================================
// PUBLIC ROUTES  (no auth required)
// ============================================

app.use("/api/auth", authRoutes);
app.use("/api/hackathons", hackathonRoutes); // GET is public, POST /crawl is protected inside

// ============================================
// PROTECTED ROUTES  (JWT required)
// ============================================

app.use("/api/users",     userRoutes);
app.use("/api/skills",    skillRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai",        aiRoutes);
app.use("/api/students",  studentRoutes);
app.use("/api/feed",      feedRoutes);
app.use("/api/discover",  discoveryRoutes);
app.use("/api/chat",      chatRoutes);

// ============================================
// HEALTH CHECK
// ============================================

app.get("/", (req, res) => {
  res.json({ message: "SkillVerse API is running 🚀" });
});

// ============================================
// DATABASE CONNECTIVITY TEST
// ============================================

app.get("/api/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW() AS current_time");

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

// ============================================
// START SERVER
// ============================================

httpServer.listen(PORT, () => {
  console.log(`SkillVerse server running on http://localhost:${PORT}`);
});
