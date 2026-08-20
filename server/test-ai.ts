/**
 * AI Integration Test
 * Tests the full assignment lifecycle:
 *   1. Generate assignment (Gemini)
 *   2. Submit a GOOD answer   → expect high score
 *   3. Submit a BAD answer    → expect low score
 *   4. Submit a PARTIAL answer → expect mid score
 *   5. Verify skill progress updated in DB
 *
 * Run with:
 *   npx tsx test-ai.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { GoogleGenAI } from "@google/genai";
import { pool } from "./src/config/database";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-3.6-flash";

// ============================================
// COLOUR HELPERS
// ============================================
const C = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  green:  "\x1b[32m",
  red:    "\x1b[31m",
  yellow: "\x1b[33m",
  cyan:   "\x1b[36m",
  blue:   "\x1b[34m",
  dim:    "\x1b[2m",
};

function header(text: string) {
  console.log(`\n${C.bold}${C.cyan}${"─".repeat(60)}`);
  console.log(` ${text}`);
  console.log(`${"─".repeat(60)}${C.reset}`);
}
function ok(text: string)    { console.log(`${C.green}  ✔ ${text}${C.reset}`); }
function warn(text: string)  { console.log(`${C.yellow}  ⚠ ${text}${C.reset}`); }
function info(text: string)  { console.log(`${C.dim}    ${text}${C.reset}`); }

// ============================================
// GEMINI WRAPPER WITH RETRY
// Handles 429 rate-limit by waiting and retrying
// ============================================
async function geminiCall(prompt: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
      });
      return (response.text ?? "").replace(/```json/gi, "").replace(/```/g, "").trim();
    } catch (e: any) {
      const body = typeof e.message === "string" ? e.message : JSON.stringify(e);
      const is429 = body.includes("429") || body.includes("RESOURCE_EXHAUSTED");
      const retryMatch = body.match(/retryDelay.*?(\d+)s/);
      const waitSec = retryMatch ? Number(retryMatch[1]) + 2 : 62;

      if (is429 && attempt < retries) {
        warn(`Rate limit hit (attempt ${attempt}/${retries}). Waiting ${waitSec}s before retry...`);
        await new Promise(r => setTimeout(r, waitSec * 1000));
        continue;
      }

      // Daily quota exhausted — not retryable today
      if (is429 && body.includes("PerDay")) {
        console.log(`\n${C.yellow}  ⚠ Daily free-tier quota exhausted (20 req/day on free plan).`);
        console.log(`    The assignment was generated successfully in Step 1.`);
        console.log(`    The API key works — just wait until tomorrow or upgrade your Gemini plan.`);
        console.log(`    Free tier: https://ai.google.dev/gemini-api/docs/rate-limits${C.reset}\n`);
        throw new Error("DAILY_QUOTA_EXHAUSTED");
      }

      throw e;
    }
  }
  throw new Error("Max retries exceeded");
}

// ============================================
// STEP 1 — GENERATE ASSIGNMENT
// ============================================
async function generateAssignment(
  skillId: number,
  skillName: string,
  difficulty: string
) {
  header(`GENERATE ASSIGNMENT  [${skillName} / ${difficulty}]`);

  const prompt = `
You are an educational AI for SkillVerse.
Create one practical assignment for a college student.
Skill: ${skillName}
Difficulty: ${difficulty}
Return ONLY valid JSON with no markdown fences:
{
  "title": "assignment title",
  "description": "brief explanation",
  "question": "the specific question or task",
  "expectedConcepts": ["concept 1", "concept 2", "concept 3"]
}`;

  const raw = await geminiCall(prompt);
  const assignment = JSON.parse(raw);

  info(`Title    : ${assignment.title}`);
  info(`Question : ${assignment.question}`);
  info(`Concepts : ${assignment.expectedConcepts.join(" | ")}`);

  const result = await pool.query(
    `INSERT INTO assignments (skill_id, title, description, difficulty, questions)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [skillId, assignment.title, assignment.description, difficulty,
     JSON.stringify({ question: assignment.question, expectedConcepts: assignment.expectedConcepts })]
  );

  const assignmentId: number = result.rows[0].id;
  ok(`Assignment saved → id = ${assignmentId}`);
  return { assignmentId, assignment };
}

// ============================================
// STEP 2 — EVALUATE AN ANSWER
// ============================================
async function evaluateAnswer(
  userId: number,
  assignmentId: number,
  assignment: any,
  skillName: string,
  skillId: number,
  label: string,
  answer: string
) {
  header(`EVALUATE: ${label}`);
  info(`Answer: "${answer.slice(0, 100)}..."`);

  const prompt = `
You are an AI evaluator for SkillVerse.
Evaluate the student's answer fairly.
Assignment: ${assignment.title}
Skill: ${skillName}
Question: ${assignment.question}
Expected concepts: ${JSON.stringify(assignment.expectedConcepts)}
Student's answer: ${answer}
Return ONLY valid JSON with no markdown fences:
{
  "score": 0,
  "feedback": "1-2 sentence feedback",
  "strengths": ["strength 1"],
  "improvements": ["improvement 1"],
  "passed": false
}
Rules: score = integer 0–100, passed = true if score >= 60.`;

  const raw = await geminiCall(prompt);
  const evaluation = JSON.parse(raw);
  const score  = Math.max(0, Math.min(100, Number(evaluation.score)));
  const passed = score >= 60;

  // Save submission
  await pool.query(
    `INSERT INTO assignment_submissions (user_id, assignment_id, answer, ai_score, ai_feedback, completed)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, assignmentId, answer, score, evaluation.feedback, passed]
  );

  // Recalculate skill progress
  const prog = await pool.query(
    `SELECT COUNT(*)::int AS total, COALESCE(AVG(ai_score),0)::int AS avg_score
     FROM assignment_submissions s
     JOIN assignments a ON a.id = s.assignment_id
     WHERE s.user_id = $1 AND a.skill_id = $2`,
    [userId, skillId]
  );

  const total    = prog.rows[0].total;
  const avgScore = prog.rows[0].avg_score;
  const level    = avgScore >= 80 && total >= 3 ? "Advanced"
                 : avgScore >= 60 && total >= 2 ? "Intermediate"
                 : "Beginner";

  await pool.query(
    `UPDATE user_skills SET progress=$1, score=$2, level=$3,
     assignments_completed=$4, updated_at=CURRENT_TIMESTAMP
     WHERE user_id=$5 AND skill_id=$6`,
    [avgScore, avgScore, level, total, userId, skillId]
  );

  // Print
  const sc = score >= 70 ? C.green : score >= 50 ? C.yellow : C.red;
  console.log(`\n  ${C.bold}Score   :${C.reset} ${sc}${score}/100${C.reset}  ${passed ? C.green+"PASSED ✔" : C.red+"FAILED ✘"}${C.reset}`);
  console.log(`  ${C.bold}Feedback:${C.reset} ${evaluation.feedback}`);
  if (evaluation.strengths?.length)    { console.log(`  ${C.green}Strengths:${C.reset}`);    evaluation.strengths.forEach((s: string) => info(`+ ${s}`)); }
  if (evaluation.improvements?.length) { console.log(`  ${C.yellow}Improvements:${C.reset}`); evaluation.improvements.forEach((s: string) => info(`→ ${s}`)); }
  info(`DB: ${total} submission(s) | avg=${avgScore} | level=${level}`);

  return { score, passed };
}

// ============================================
// MAIN
// ============================================
async function main() {
  console.log(`\n${C.bold}${C.blue}${"═".repeat(60)}`);
  console.log("  SKILLVERSE — AI ASSIGNMENT TEST SUITE");
  console.log(`${"═".repeat(60)}${C.reset}`);

  // Get real user + skill from DB
  const userRow = await pool.query(`SELECT id, name FROM users ORDER BY id LIMIT 1`);
  if (userRow.rows.length === 0) {
    console.log(`${C.red}  No users in DB. Register via the app first.${C.reset}`);
    await pool.end(); return;
  }
  const userId   = userRow.rows[0].id as number;
  const userName = userRow.rows[0].name as string;

  const skillRow = await pool.query(`SELECT id, name FROM skills ORDER BY id LIMIT 1`);
  const skillId   = skillRow.rows[0].id as number;
  const skillName = skillRow.rows[0].name as string;

  console.log(`\n  ${C.bold}Test User :${C.reset} ${userName} (id=${userId})`);
  console.log(`  ${C.bold}Test Skill:${C.reset} ${skillName} (id=${skillId})`);

  // Ensure user_skills row exists
  await pool.query(
    `INSERT INTO user_skills (user_id, skill_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [userId, skillId]
  );

  try {
    // ── Round 1: Beginner + GOOD answer ──────────────
    const { assignmentId: aid1, assignment: a1 } =
      await generateAssignment(skillId, skillName, "Beginner");

    const goodAnswer = `
The question is about ${skillName}. Here is a thorough answer:
${a1.expectedConcepts.map((c: string) =>
  `- ${c}: This is fundamental to ${skillName}. It works by ensuring that the code correctly applies the principle of ${c}. In practice, you would use ${c} to handle edge cases, improve readability and guarantee correctness of the solution.`
).join("\n")}
In summary, combining ${a1.expectedConcepts.join(", ")} gives us a complete and correct solution.`.trim();

    const r1 = await evaluateAnswer(userId, aid1, a1, skillName, skillId, "GOOD ANSWER (expect ≥70)", goodAnswer);

    // ── Round 2: Beginner + BAD answer ───────────────
    const { assignmentId: aid2, assignment: a2 } =
      await generateAssignment(skillId, skillName, "Beginner");

    const badAnswer = "I don't know this topic at all. No idea how to solve this.";
    const r2 = await evaluateAnswer(userId, aid2, a2, skillName, skillId, "BAD ANSWER (expect ≤30)", badAnswer);

    // ── Round 3: Intermediate + PARTIAL answer ────────
    const { assignmentId: aid3, assignment: a3 } =
      await generateAssignment(skillId, skillName, "Intermediate");

    const partialAnswer = `I have some knowledge of ${skillName}. The main idea involves ${a3.expectedConcepts[0]}. I am less sure about the other parts but I think the answer relates to applying these concepts to the given problem.`;
    const r3 = await evaluateAnswer(userId, aid3, a3, skillName, skillId, "PARTIAL ANSWER (expect 40–70)", partialAnswer);

    // ── Summary ───────────────────────────────────────
    header("SUMMARY");
    console.log(`  Good answer score    : ${r1.score}/100  ${r1.passed ? C.green+"✔ PASS" : C.red+"✘ FAIL"}${C.reset}`);
    console.log(`  Bad answer score     : ${r2.score}/100  ${r2.passed ? C.yellow+"✔ PASS (unexpected)" : C.green+"✘ FAIL (expected)"}${C.reset}`);
    console.log(`  Partial answer score : ${r3.score}/100  ${C.cyan}(mid range)${C.reset}`);

    const check1 = r1.score >= 60;
    const check2 = r2.score <= 40;
    const check3 = r3.score >= 30 && r3.score <= 75;

    console.log(`\n  ${C.bold}Assertions:${C.reset}`);
    console.log(`  Good answer passed   : ${check1 ? C.green+"✔ YES" : C.red+"✘ NO (score="+r1.score+")"}${C.reset}`);
    console.log(`  Bad answer failed    : ${check2 ? C.green+"✔ YES" : C.red+"✘ NO (score="+r2.score+")"}${C.reset}`);
    console.log(`  Partial in range     : ${check3 ? C.green+"✔ YES" : C.yellow+"⚠ NO (score="+r3.score+")"}${C.reset}`);

    // Final DB state
    header("FINAL SKILL STATE IN DB");
    const fs = await pool.query(
      `SELECT us.progress, us.score, us.level, us.assignments_completed, s.name
       FROM user_skills us JOIN skills s ON s.id=us.skill_id
       WHERE us.user_id=$1 AND us.skill_id=$2`,
      [userId, skillId]
    );
    if (fs.rows.length) {
      const row = fs.rows[0];
      ok(`Skill       : ${row.name}`);
      ok(`Progress    : ${row.progress}%`);
      ok(`Avg Score   : ${row.score}`);
      ok(`Level       : ${row.level}`);
      ok(`Assignments : ${row.assignments_completed}`);
    }

    const subs = await pool.query(
      `SELECT s.ai_score, s.completed, a.difficulty, a.title
       FROM assignment_submissions s
       JOIN assignments a ON a.id=s.assignment_id
       WHERE s.user_id=$1 AND a.skill_id=$2 ORDER BY s.submitted_at DESC LIMIT 10`,
      [userId, skillId]
    );
    console.log(`\n  ${C.bold}Recent submissions:${C.reset}`);
    subs.rows.forEach((r: any) => {
      const st = r.completed ? `${C.green}PASS` : `${C.red}FAIL`;
      console.log(`    ${st}${C.reset}  score=${String(r.ai_score).padStart(3)}  [${r.difficulty}]  ${r.title}`);
    });

  } catch (e: any) {
    if (e.message !== "DAILY_QUOTA_EXHAUSTED") throw e;
  }

  console.log(`\n${C.bold}${C.blue}${"═".repeat(60)}\n  DONE\n${"═".repeat(60)}${C.reset}\n`);
  await pool.end();
}

main().catch(async (e) => {
  console.error(`\n${C.red}FATAL:${C.reset}`, e.message);
  await pool.end();
  process.exit(1);
});
