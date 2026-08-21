import express from "express";
import Groq from "groq-sdk";
import { GoogleGenAI } from "@google/genai";
import { pool } from "../config/database";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

// ============================================
// AI CLIENT — Groq primary, Gemini fallback
// Groq free tier: 14,400 req/day, 30 req/min
// Gemini free tier: 20 req/day (backup only)
// ============================================

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GROQ_MODEL   = "openai/gpt-oss-20b";   // clean JSON, no thinking tokens, fast
const GEMINI_MODEL = "gemini-3.6-flash";         // fallback

// ============================================
// PROGRESSION RULES
// A student must PASS (score ≥ PASS_THRESHOLD)
// the required number of assignments at their
// current level before unlocking the next one.
//
// Beginner  → needs PASSES_TO_INTERMEDIATE passes → unlocks Intermediate
// Intermediate → needs PASSES_TO_ADVANCED passes  → unlocks Advanced
// Advanced  → stays Advanced forever
// ============================================

const PASS_THRESHOLD         = 60;   // score ≥ 60 counts as a pass
const PASSES_TO_INTERMEDIATE = 2;    // pass 2 Beginner assignments
const PASSES_TO_ADVANCED     = 3;    // pass 3 Intermediate assignments

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

const DIFFICULTY_ORDER: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

// ============================================
// SHARED HELPER — getSkillStatus
// Single source of truth for a user's current
// progression state for a given skill.
// ============================================

async function getSkillStatus(userId: number, skillId: number) {
  // Current level from user_skills
  const skillRow = await pool.query(
    `
    SELECT level
    FROM user_skills
    WHERE user_id = $1 AND skill_id = $2
    `,
    [userId, skillId]
  );

  // Default to Beginner if the row doesn't exist yet
  const currentLevel: Difficulty =
    (skillRow.rows[0]?.level as Difficulty) ?? "Beginner";

  // Count PASSING submissions at the current difficulty level
  const passRow = await pool.query(
    `
    SELECT COUNT(*)::int AS passes
    FROM assignment_submissions sub
    JOIN assignments a ON a.id = sub.assignment_id
    WHERE sub.user_id  = $1
      AND a.skill_id   = $2
      AND a.difficulty = $3
      AND sub.completed = true
    `,
    [userId, skillId, currentLevel]
  );

  const passesAtCurrentLevel: number = passRow.rows[0].passes;

  // How many passes are needed to move up?
  let passesRequired: number;
  let nextLevel: Difficulty | null;

  if (currentLevel === "Beginner") {
    passesRequired = PASSES_TO_INTERMEDIATE;
    nextLevel      = "Intermediate";
  } else if (currentLevel === "Intermediate") {
    passesRequired = PASSES_TO_ADVANCED;
    nextLevel      = "Advanced";
  } else {
    // Advanced — already at the top
    passesRequired = 0;
    nextLevel      = null;
  }

  const canLevelUp =
    nextLevel !== null && passesAtCurrentLevel >= passesRequired;

  // Effective difficulty for the NEXT assignment:
  // if they qualify, use the next level; otherwise stay at current
  const nextDifficulty: Difficulty = canLevelUp ? nextLevel! : currentLevel;

  return {
    currentLevel,
    passesAtCurrentLevel,
    passesRequired,
    nextLevel,
    canLevelUp,
    nextDifficulty,
    isMaxLevel: currentLevel === "Advanced",
  };
}

// ============================================
// SHARED HELPER — callAI
// Tries Groq first (14,400 req/day free).
// Falls back to Gemini if Groq key is missing
// or Groq returns a rate-limit error.
// ============================================

async function callAI(prompt: string): Promise<string> {
  // ── Try Groq ──────────────────────────────
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "your_groq_api_key_here") {
    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      });
      return (completion.choices[0]?.message?.content ?? "")
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        // Strip <think>...</think> blocks (Qwen3 style) just in case
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .trim();
    } catch (groqError: any) {
      const msg = groqError?.message ?? String(groqError);
      // Only fall through to Gemini on rate-limit; re-throw other errors
      if (!msg.includes("429") && !msg.includes("rate_limit") && !msg.includes("RESOURCE_EXHAUSTED")) {
        throw groqError;
      }
      console.warn("Groq rate limit hit — falling back to Gemini");
    }
  }

  // ── Fallback: Gemini ─────────────────────
  const response = await gemini.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });
  return (response.text ?? "")
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

// ============================================
// SHARED HELPER — buildAssignmentPrompt
// ============================================

function buildAssignmentPrompt(
  skillName: string,
  skillCategory: string,
  difficulty: Difficulty
): string {
  const difficultyGuide = {
    Beginner:     "Very simple. Tests fundamental awareness. Single concept. Short answer expected.",
    Intermediate: "Moderately challenging. Requires applying 2-3 concepts together. Some reasoning needed.",
    Advanced:     "Challenging. Requires deep understanding, edge cases, trade-offs, and real-world application.",
  }[difficulty];

  return `
You are an educational AI for SkillVerse, a student learning platform.

Create one practical assignment for a college student.

Skill: ${skillName}
Category: ${skillCategory}
Difficulty: ${difficulty}
Difficulty guide: ${difficultyGuide}

Return ONLY valid JSON with no markdown fences:
{
  "title": "assignment title",
  "description": "brief explanation of what the student should do",
  "question": "the specific question or task for the student",
  "expectedConcepts": ["concept 1", "concept 2", "concept 3"]
}

Rules:
- Suitable for a college student.
- Practical and educational.
- Strictly match the difficulty level described above.
- No markdown in the output.
`.trim();
}

// ============================================
// GET SKILL STATUS  (protected)
// Returns the student's current progression
// state for a skill — used by the frontend
// to show progress bars and unlock indicators.
//
// GET /api/ai/skill-status/:userId/:skillId
// ============================================

router.get(
  "/skill-status/:userId/:skillId",
  requireAuth,
  async (req, res) => {
    try {
      const userId  = Number(req.params.userId);
      const skillId = Number(req.params.skillId);

      if (isNaN(userId) || isNaN(skillId)) {
        return res.status(400).json({ success: false, message: "Invalid IDs" });
      }

      // Skill must exist
      const skillRow = await pool.query(
        `SELECT id, name FROM skills WHERE id = $1`,
        [skillId]
      );
      if (skillRow.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Skill not found" });
      }

      const status = await getSkillStatus(userId, skillId);

      // Per-level pass breakdown
      const breakdown = await pool.query(
        `
        SELECT a.difficulty,
               COUNT(*)::int                                   AS total,
               COUNT(*) FILTER (WHERE sub.completed = true)::int AS passes,
               COALESCE(AVG(sub.ai_score), 0)::int             AS avg_score
        FROM assignment_submissions sub
        JOIN assignments a ON a.id = sub.assignment_id
        WHERE sub.user_id = $1 AND a.skill_id = $2
        GROUP BY a.difficulty
        `,
        [userId, skillId]
      );

      const byLevel: Record<string, any> = {};
      for (const row of breakdown.rows) {
        byLevel[row.difficulty] = {
          total:    row.total,
          passes:   row.passes,
          avgScore: row.avg_score,
        };
      }

      return res.json({
        success: true,
        skillName: skillRow.rows[0].name,
        status: {
          ...status,
          byLevel,
          passThreshold:       PASS_THRESHOLD,
          passesToIntermediate: PASSES_TO_INTERMEDIATE,
          passesToAdvanced:     PASSES_TO_ADVANCED,
        },
      });
    } catch (error) {
      console.error("Skill status error:", error);
      return res.status(500).json({ success: false, message: "Failed to get skill status" });
    }
  }
);

// ============================================
// GENERATE ASSIGNMENT  (protected)
// The server decides the difficulty based on
// the student's progression — the client does
// NOT control this anymore.
//
// POST /api/ai/generate-assignment
// Body: { userId, skillId }
// ============================================

router.post("/generate-assignment", requireAuth, async (req, res) => {
  try {
    const { userId, skillId } = req.body;

    if (!userId || !skillId) {
      return res.status(400).json({
        success: false,
        message: "userId and skillId are required",
      });
    }

    if (req.user!.userId !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only generate assignments for yourself",
      });
    }

    // -- Get skill --
    const skillResult = await pool.query(
      `SELECT id, name, category, description FROM skills WHERE id = $1`,
      [skillId]
    );
    if (skillResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }
    const skill = skillResult.rows[0];

    // -- Ensure user_skills row exists --
    await pool.query(
      `INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, skillId]
    );

    // -- Determine difficulty from DB (server-controlled) --
    const status = await getSkillStatus(userId, skillId);
    const difficulty = status.nextDifficulty;

    // -- Call Gemini --
    const rawText = await callAI(
      buildAssignmentPrompt(skill.name, skill.category, difficulty)
    );

    let assignment: {
      title: string;
      description: string;
      question: string;
      expectedConcepts: string[];
    };
    try {
      assignment = JSON.parse(rawText);
    } catch {
      console.error("AI returned invalid JSON:", rawText);
      return res.status(502).json({
        success: false,
        message: "AI returned an invalid response. Please try again.",
      });
    }

    // -- Save to DB --
    const result = await pool.query(
      `
      INSERT INTO assignments (skill_id, title, description, difficulty, questions)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        skillId,
        assignment.title,
        assignment.description,
        difficulty,
        JSON.stringify({
          question: assignment.question,
          expectedConcepts: assignment.expectedConcepts,
        }),
      ]
    );

    return res.status(201).json({
      success: true,
      assignment: result.rows[0],
      // Tell the client what level this is and what's needed to progress
      progression: {
        currentLevel:         status.currentLevel,
        difficulty,
        passesAtCurrentLevel: status.passesAtCurrentLevel,
        passesRequired:       status.passesRequired,
        nextLevel:            status.nextLevel,
        passThreshold:        PASS_THRESHOLD,
      },
    });
  } catch (error) {
    console.error("Generate assignment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate assignment",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// GET ASSIGNMENT  (protected)
// GET /api/ai/assignment/:id
// ============================================

router.get("/assignment/:id", requireAuth, async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);

    if (!assignmentId || isNaN(assignmentId)) {
      return res.status(400).json({ success: false, message: "Invalid assignment ID" });
    }

    const result = await pool.query(
      `
      SELECT
        a.id, a.title, a.description, a.difficulty,
        a.questions, a.created_at,
        s.id AS skill_id, s.name AS skill_name, s.category AS skill_category
      FROM assignments a
      INNER JOIN skills s ON s.id = a.skill_id
      WHERE a.id = $1
      `,
      [assignmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    return res.json({ success: true, assignment: result.rows[0] });
  } catch (error) {
    console.error("Get assignment error:", error);
    return res.status(500).json({ success: false, message: "Failed to get assignment" });
  }
});

// ============================================
// EVALUATE ANSWER  (protected)
// After evaluating, detects level-up events
// and returns what the student unlocked.
//
// POST /api/ai/evaluate-answer
// Body: { userId, assignmentId, answer }
// ============================================

router.post("/evaluate-answer", requireAuth, async (req, res) => {
  try {
    const { userId, assignmentId, answer } = req.body;

    if (!userId || !assignmentId || !answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "userId, assignmentId and answer are required",
      });
    }

    if (req.user!.userId !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only submit answers for yourself",
      });
    }

    // -- Get assignment --
    const assignmentResult = await pool.query(
      `
      SELECT a.id, a.skill_id, a.title, a.description, a.difficulty,
             a.questions, s.name AS skill_name
      FROM assignments a
      INNER JOIN skills s ON s.id = a.skill_id
      WHERE a.id = $1
      `,
      [assignmentId]
    );
    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    const assignment = assignmentResult.rows[0];
    const skillId = assignment.skill_id;

    const question         = assignment.questions?.question || "";
    const expectedConcepts = assignment.questions?.expectedConcepts || [];

    // -- Snapshot progression BEFORE this submission --
    const statusBefore = await getSkillStatus(userId, skillId);

    // -- Call Gemini --
    const evalPrompt = `
You are an AI evaluator for SkillVerse, a student learning platform.

Evaluate the student's answer fairly and constructively.

Assignment: ${assignment.title}
Skill: ${assignment.skill_name}
Difficulty: ${assignment.difficulty}
Question: ${question}
Expected concepts: ${JSON.stringify(expectedConcepts)}

Student's answer:
${answer}

Return ONLY valid JSON with no markdown fences:
{
  "score": 0,
  "feedback": "short, useful feedback in 1-3 sentences",
  "strengths": ["strength 1"],
  "improvements": ["improvement 1"],
  "passed": false
}

Rules:
- score is an integer 0–100.
- Difficulty context: ${assignment.difficulty} level — adjust expectations accordingly.
- passed = true if score >= ${PASS_THRESHOLD}.
- Be encouraging but honest.
- No markdown.
`.trim();

    const rawText = await callAI(evalPrompt);

    let evaluation: {
      score: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
      passed: boolean;
    };
    try {
      evaluation = JSON.parse(rawText);
    } catch {
      console.error("Gemini returned invalid JSON:", rawText);
      return res.status(502).json({
        success: false,
        message: "AI returned an invalid response. Please try again.",
      });
    }

    const score  = Math.max(0, Math.min(100, Number(evaluation.score)));
    const passed = score >= PASS_THRESHOLD;

    // -- Save submission --
    const submissionResult = await pool.query(
      `
      INSERT INTO assignment_submissions
        (user_id, assignment_id, answer, ai_score, ai_feedback, completed)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [userId, assignmentId, answer, score, evaluation.feedback, passed]
    );

    // -- Recalculate overall average + total --
    const progressResult = await pool.query(
      `
      SELECT COUNT(*)::int AS total,
             COALESCE(AVG(sub.ai_score), 0)::int AS average_score
      FROM assignment_submissions sub
      JOIN assignments a ON a.id = sub.assignment_id
      WHERE sub.user_id = $1 AND a.skill_id = $2
      `,
      [userId, skillId]
    );
    const total        = progressResult.rows[0].total;
    const averageScore = progressResult.rows[0].average_score;

    // -- Snapshot progression AFTER this submission --
    const statusAfter = await getSkillStatus(userId, skillId);

    // -- Detect a level-up --
    // A level-up happens when the student just earned enough passes
    // at their current level to unlock the next difficulty.
    const leveledUp =
      statusAfter.canLevelUp &&
      !statusBefore.canLevelUp &&
      statusAfter.nextLevel !== null;

    // If they leveled up, promote the user_skills record
    const newLevel: Difficulty = leveledUp
      ? (statusAfter.nextLevel as Difficulty)
      : statusAfter.currentLevel;

    await pool.query(
      `
      UPDATE user_skills
      SET progress              = $1,
          score                 = $2,
          level                 = $3,
          assignments_completed = $4,
          updated_at            = CURRENT_TIMESTAMP
      WHERE user_id = $5 AND skill_id = $6
      `,
      [averageScore, averageScore, newLevel, total, userId, skillId]
    );

    // -- Build level-up message --
    let levelUpMessage: string | null = null;
    if (leveledUp) {
      levelUpMessage =
        `🎉 Congratulations! You've unlocked ${statusAfter.nextLevel} level for ${assignment.skill_name}!`;
    } else if (!passed) {
      const remaining = statusAfter.passesRequired - statusAfter.passesAtCurrentLevel;
      levelUpMessage =
        `Keep going! Pass ${remaining} more ${statusAfter.currentLevel} assignment${remaining !== 1 ? "s" : ""} to unlock ${statusAfter.nextLevel ?? "the next level"}.`;
    } else if (!statusAfter.canLevelUp) {
      const remaining = statusAfter.passesRequired - statusAfter.passesAtCurrentLevel;
      levelUpMessage =
        `Good work! ${remaining} more pass${remaining !== 1 ? "es" : ""} at ${statusAfter.currentLevel} level to unlock ${statusAfter.nextLevel ?? "the next level"}.`;
    }

    return res.json({
      success: true,

      evaluation: {
        score,
        feedback:     evaluation.feedback,
        strengths:    evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        passed,
      },

      progression: {
        leveledUp,
        levelUpMessage,
        previousLevel:        statusBefore.currentLevel,
        currentLevel:         newLevel,
        nextLevel:            statusAfter.nextLevel,
        passesAtCurrentLevel: statusAfter.passesAtCurrentLevel + (passed ? 1 : 0),
        passesRequired:       statusAfter.passesRequired,
        nextDifficulty:       leveledUp ? statusAfter.nextLevel : statusAfter.currentLevel,
        progress:             averageScore,
        assignmentsCompleted: total,
        isMaxLevel:           newLevel === "Advanced",
      },

      submission: submissionResult.rows[0],
    });
  } catch (error) {
    console.error("Evaluate answer error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to evaluate answer",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// ============================================
// NEXT ASSIGNMENT  (protected)
// The single endpoint the client calls after
// finishing an assignment. It automatically
// determines the correct difficulty and
// generates a fresh assignment.
//
// No more passing difficulty from the client.
//
// POST /api/ai/next-assignment
// Body: { userId, skillId }
// ============================================

router.post("/next-assignment", requireAuth, async (req, res) => {
  try {
    const { userId, skillId } = req.body;

    if (!userId || !skillId) {
      return res.status(400).json({
        success: false,
        message: "userId and skillId are required",
      });
    }

    if (req.user!.userId !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only request assignments for yourself",
      });
    }

    // Get skill
    const skillResult = await pool.query(
      `SELECT id, name, category FROM skills WHERE id = $1`,
      [skillId]
    );
    if (skillResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }
    const skill = skillResult.rows[0];

    // Ensure user_skills row exists
    await pool.query(
      `INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, skillId]
    );

    // Determine what difficulty they've earned
    const status = await getSkillStatus(userId, skillId);
    const difficulty = status.nextDifficulty;

    // Generate next assignment
    const rawText = await callAI(
      buildAssignmentPrompt(skill.name, skill.category, difficulty)
    );

    let assignment: {
      title: string;
      description: string;
      question: string;
      expectedConcepts: string[];
    };
    try {
      assignment = JSON.parse(rawText);
    } catch {
      return res.status(502).json({
        success: false,
        message: "AI returned an invalid response. Please try again.",
      });
    }

    // Save
    const result = await pool.query(
      `
      INSERT INTO assignments (skill_id, title, description, difficulty, questions)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        skillId,
        assignment.title,
        assignment.description,
        difficulty,
        JSON.stringify({
          question: assignment.question,
          expectedConcepts: assignment.expectedConcepts,
        }),
      ]
    );

    return res.status(201).json({
      success: true,
      assignment: result.rows[0],
      progression: {
        currentLevel:         status.currentLevel,
        difficulty,
        passesAtCurrentLevel: status.passesAtCurrentLevel,
        passesRequired:       status.passesRequired,
        nextLevel:            status.nextLevel,
        passThreshold:        PASS_THRESHOLD,
        // Friendly hint shown under the assignment
        hint: status.isMaxLevel
          ? "You've reached the highest level — Advanced!"
          : `Pass ${status.passesRequired - status.passesAtCurrentLevel} more ${status.currentLevel} assignment(s) to unlock ${status.nextLevel}.`,
      },
    });
  } catch (error) {
    console.error("Next assignment error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate next assignment",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

export default router;
