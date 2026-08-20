import express from "express";
import { GoogleGenAI } from "@google/genai";
import { pool } from "../config/database";
import { requireAuth } from "../middleware/auth";

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Use a stable, available Gemini model name
const GEMINI_MODEL = "gemini-2.0-flash";

// ============================================
// GENERATE ASSIGNMENT  (protected)
// ============================================

router.post("/generate-assignment", requireAuth, async (req, res) => {
  try {
    const {
      userId,
      skillId,
      difficulty = "Beginner",
    } = req.body;

    if (!userId || !skillId) {
      return res.status(400).json({
        success: false,
        message: "userId and skillId are required",
      });
    }

    // Caller can only generate for themselves
    if (req.user!.userId !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only generate assignments for yourself",
      });
    }

    // ------------------------------------------
    // GET SKILL
    // ------------------------------------------

    const skillResult = await pool.query(
      `
      SELECT id, name, category, description
      FROM skills
      WHERE id = $1
      `,
      [skillId]
    );

    if (skillResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found",
      });
    }

    const skill = skillResult.rows[0];

    // ------------------------------------------
    // BUILD PROMPT
    // ------------------------------------------

    const prompt = `
You are an educational AI for SkillVerse, a student learning platform.

Create one practical assignment for a college student.

Skill: ${skill.name}
Category: ${skill.category}
Difficulty: ${difficulty}

Return ONLY valid JSON with no markdown fences.

Format:
{
  "title": "assignment title",
  "description": "brief explanation of what the student should do",
  "question": "the specific question or task for the student",
  "expectedConcepts": ["concept 1", "concept 2"]
}

Rules:
- Suitable for a college student.
- Practical and educational.
- Difficulty must match: Beginner = simple, Intermediate = moderate, Advanced = challenging.
- No markdown in the output.
`;

    // ------------------------------------------
    // CALL GEMINI
    // ------------------------------------------

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const rawText = response.text || "";

    const cleanText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let assignment: {
      title: string;
      description: string;
      question: string;
      expectedConcepts: string[];
    };

    try {
      assignment = JSON.parse(cleanText);
    } catch {
      console.error("Gemini returned invalid JSON:", cleanText);
      return res.status(502).json({
        success: false,
        message: "AI returned an invalid response. Please try again.",
      });
    }

    // ------------------------------------------
    // SAVE TO DB
    // ------------------------------------------

    const result = await pool.query(
      `
      INSERT INTO assignments (
        skill_id,
        title,
        description,
        difficulty,
        questions
      )
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
// ============================================

router.get("/assignment/:id", requireAuth, async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);

    if (!assignmentId || isNaN(assignmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assignment ID",
      });
    }

    const result = await pool.query(
      `
      SELECT
        a.id,
        a.title,
        a.description,
        a.difficulty,
        a.questions,
        a.created_at,
        s.id       AS skill_id,
        s.name     AS skill_name,
        s.category AS skill_category
      FROM assignments a
      INNER JOIN skills s ON s.id = a.skill_id
      WHERE a.id = $1
      `,
      [assignmentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    return res.json({
      success: true,
      assignment: result.rows[0],
    });

  } catch (error) {
    console.error("Get assignment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get assignment",
    });
  }
});

// ============================================
// EVALUATE ANSWER  (protected)
// ============================================

router.post("/evaluate-answer", requireAuth, async (req, res) => {
  try {
    const {
      userId,
      assignmentId,
      answer,
    } = req.body;

    if (!userId || !assignmentId || !answer?.trim()) {
      return res.status(400).json({
        success: false,
        message: "userId, assignmentId and answer are required",
      });
    }

    // Caller can only submit for themselves
    if (req.user!.userId !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "You can only submit answers for yourself",
      });
    }

    // ------------------------------------------
    // GET ASSIGNMENT
    // ------------------------------------------

    const assignmentResult = await pool.query(
      `
      SELECT
        a.id,
        a.skill_id,
        a.title,
        a.description,
        a.questions,
        s.name AS skill_name
      FROM assignments a
      INNER JOIN skills s ON s.id = a.skill_id
      WHERE a.id = $1
      `,
      [assignmentId]
    );

    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      });
    }

    const assignment = assignmentResult.rows[0];

    const question = assignment.questions?.question || "";
    const expectedConcepts = assignment.questions?.expectedConcepts || [];

    // ------------------------------------------
    // BUILD EVALUATION PROMPT
    // ------------------------------------------

    const prompt = `
You are an AI evaluator for SkillVerse, a student learning platform.

Evaluate the student's answer fairly and constructively.

Assignment: ${assignment.title}
Skill: ${assignment.skill_name}
Question: ${question}
Expected concepts: ${JSON.stringify(expectedConcepts)}

Student's answer:
${answer}

Return ONLY valid JSON with no markdown fences in this exact format:
{
  "score": 0,
  "feedback": "short, useful feedback in 1-3 sentences",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1"],
  "passed": false
}

Rules:
- score is an integer from 0 to 100.
- Judge based on understanding and correctness, not exact wording.
- Give partial credit when appropriate.
- Be encouraging but honest.
- passed = true if score >= 60.
- No markdown in the output.
`;

    // ------------------------------------------
    // CALL GEMINI
    // ------------------------------------------

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const rawText = response.text || "";

    const cleanText = rawText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    let evaluation: {
      score: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
      passed: boolean;
    };

    try {
      evaluation = JSON.parse(cleanText);
    } catch {
      console.error("Gemini returned invalid JSON:", cleanText);
      return res.status(502).json({
        success: false,
        message: "AI returned an invalid response. Please try again.",
      });
    }

    const score = Math.max(0, Math.min(100, Number(evaluation.score)));
    const passed = score >= 60;

    // ------------------------------------------
    // SAVE SUBMISSION
    // ------------------------------------------

    const submissionResult = await pool.query(
      `
      INSERT INTO assignment_submissions (
        user_id,
        assignment_id,
        answer,
        ai_score,
        ai_feedback,
        completed
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [userId, assignmentId, answer, score, evaluation.feedback, passed]
    );

    // ------------------------------------------
    // RECALCULATE SKILL PROGRESS
    // ------------------------------------------

    const skillId = assignment.skill_id;

    const progressResult = await pool.query(
      `
      SELECT
        COUNT(*)::INTEGER          AS total,
        COALESCE(AVG(s.ai_score), 0)::INTEGER AS average_score
      FROM assignment_submissions s
      INNER JOIN assignments a ON a.id = s.assignment_id
      WHERE s.user_id = $1
        AND a.skill_id = $2
      `,
      [userId, skillId]
    );

    const total = progressResult.rows[0].total;
    const averageScore = progressResult.rows[0].average_score;

    // Determine level based on average score and attempt count
    let level = "Beginner";
    if (averageScore >= 80 && total >= 3) {
      level = "Advanced";
    } else if (averageScore >= 60 && total >= 2) {
      level = "Intermediate";
    }

    // ------------------------------------------
    // UPDATE USER SKILL RECORD
    // ------------------------------------------

    await pool.query(
      `
      UPDATE user_skills
      SET
        progress              = $1,
        score                 = $2,
        level                 = $3,
        assignments_completed = $4,
        updated_at            = CURRENT_TIMESTAMP
      WHERE user_id = $5
        AND skill_id = $6
      `,
      [averageScore, averageScore, level, total, userId, skillId]
    );

    return res.json({
      success: true,

      evaluation: {
        score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths || [],
        improvements: evaluation.improvements || [],
        passed,
      },

      progress: {
        progress: averageScore,
        score: averageScore,
        level,
        assignmentsCompleted: total,
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

export default router;
