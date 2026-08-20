import express from "express";
import { GoogleGenAI } from "@google/genai";
import { pool } from "../config/database";

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/generate-assignment", async (req, res) => {
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

    // Get skill
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

    // Ask Gemini
    const prompt = `
You are an educational AI for SkillVerse.

Create one practical assignment for a college student.

Skill: ${skill.name}
Category: ${skill.category}
Difficulty: ${difficulty}

Return ONLY valid JSON.

Format:

{
  "title": "assignment title",
  "description": "assignment explanation",
  "question": "question for the student",
  "expectedConcepts": [
    "concept 1",
    "concept 2"
  ]
}

Rules:
- Suitable for a college student.
- Practical and educational.
- Not extremely difficult.
- No markdown.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const text = response.text || "";

    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const assignment = JSON.parse(cleanText);

    // Save assignment
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
  console.error("================================");
  console.error("GENERATE ASSIGNMENT ERROR");
  console.error(error);
  console.error("================================");

  return res.status(500).json({
    success: false,
    message: "Failed to generate assignment",
    error: error instanceof Error ? error.message : String(error),
  });
}
});
// ============================================
// GET ASSIGNMENT
// ============================================

router.get("/assignment/:id", async (req, res) => {
  try {
    const assignmentId = Number(req.params.id);

    if (!assignmentId) {
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

        s.id AS skill_id,
        s.name AS skill_name,
        s.category AS skill_category

      FROM assignments a

      INNER JOIN skills s
        ON s.id = a.skill_id

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
// EVALUATE ASSIGNMENT ANSWER
// ============================================

router.post("/evaluate-answer", async (req, res) => {
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

      INNER JOIN skills s
        ON s.id = a.skill_id

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

    // ------------------------------------------
    // GET QUESTION
    // ------------------------------------------

    const question =
      assignment.questions?.question || "";

    const expectedConcepts =
      assignment.questions?.expectedConcepts || [];

    // ------------------------------------------
    // ASK GEMINI TO EVALUATE
    // ------------------------------------------

    const prompt = `
You are an AI evaluator for a student learning platform called SkillVerse.

Evaluate the student's answer fairly.

Assignment:
${assignment.title}

Skill:
${assignment.skill_name}

Question:
${question}

Expected concepts:
${JSON.stringify(expectedConcepts)}

Student answer:
${answer}

Return ONLY valid JSON in this exact format:

{
  "score": 0,
  "feedback": "short useful feedback",
  "strengths": [
    "strength 1"
  ],
  "improvements": [
    "improvement 1"
  ],
  "passed": false
}

Rules:

- Score must be an integer from 0 to 100.
- Judge based on correctness and understanding.
- Do not require exact wording.
- Give partial credit when appropriate.
- Be encouraging but honest.
- passed should be true if score >= 60.
- No markdown.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const text = response.text || "";

    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const evaluation = JSON.parse(cleanText);

    const score = Math.max(
      0,
      Math.min(100, Number(evaluation.score))
    );

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
      [
        userId,
        assignmentId,
        answer,
        score,
        evaluation.feedback,
        passed,
      ]
    );

    // ------------------------------------------
    // CALCULATE USER SKILL PROGRESS
    // ------------------------------------------

    const skillId = assignment.skill_id;

    const progressResult = await pool.query(
      `
      SELECT
        COUNT(*)::INTEGER AS total,
        COALESCE(AVG(ai_score), 0)::INTEGER AS average_score

      FROM assignment_submissions s

      INNER JOIN assignments a
        ON a.id = s.assignment_id

      WHERE s.user_id = $1
      AND a.skill_id = $2
      `,
      [userId, skillId]
    );

    const total =
      progressResult.rows[0].total;

    const averageScore =
      progressResult.rows[0].average_score;

    // ------------------------------------------
    // DETERMINE LEVEL
    // ------------------------------------------

    let level = "Beginner";

    if (averageScore >= 80 && total >= 3) {
      level = "Advanced";
    } else if (averageScore >= 60 && total >= 2) {
      level = "Intermediate";
    }

    // ------------------------------------------
    // UPDATE USER SKILL
    // ------------------------------------------

    await pool.query(
      `
      UPDATE user_skills

      SET
        progress = $1,
        score = $2,
        level = $3,
        assignments_completed = $4,
        updated_at = CURRENT_TIMESTAMP

      WHERE user_id = $5
      AND skill_id = $6
      `,
      [
        averageScore,
        averageScore,
        level,
        total,
        userId,
        skillId,
      ]
    );

    // ------------------------------------------
    // RETURN RESULT
    // ------------------------------------------

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
    console.error(
      "Evaluate answer error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to evaluate answer",
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });
  }
});
export default router;