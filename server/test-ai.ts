/**
 * AI Progression Test
 *
 * Simulates a student going through the full progression system:
 *
 *   Round 1 → Beginner assignment  (should be generated at Beginner)
 *   Round 2 → Beginner assignment  (still Beginner — only 1 pass so far)
 *   Round 3 → STILL Beginner       (2nd pass → should unlock Intermediate)
 *   Round 4 → Intermediate         (first Intermediate assignment)
 *   ...
 *
 * Checks:
 *   ✔ Server controls difficulty (client never passes it)
 *   ✔ Difficulty stays Beginner until PASSES_TO_INTERMEDIATE passes
 *   ✔ Intermediate unlocked exactly after the qualifying pass
 *   ✔ Level-up flag and message returned in evaluate-answer response
 *   ✔ skill-status endpoint returns correct state at every step
 *
 * Run with:
 *   npx tsx test-ai.ts
 */

import dotenv from "dotenv";
dotenv.config();

import { pool } from "./src/config/database";

const API  = "http://localhost:5000";

// ============================================
// COLOURS
// ============================================
const C = {
  reset:  "\x1b[0m", bold: "\x1b[1m",
  green:  "\x1b[32m", red: "\x1b[31m",
  yellow: "\x1b[33m", cyan: "\x1b[36m",
  blue:   "\x1b[34m", dim:  "\x1b[2m",
};
const ok   = (t: string) => console.log(`${C.green}  ✔ ${t}${C.reset}`);
const fail = (t: string) => console.log(`${C.red}  ✘ ${t}${C.reset}`);
const info = (t: string) => console.log(`${C.dim}    ${t}${C.reset}`);
const head = (t: string) => {
  console.log(`\n${C.bold}${C.cyan}${"─".repeat(62)}`);
  console.log(`  ${t}`);
  console.log(`${"─".repeat(62)}${C.reset}`);
};

// ============================================
// API HELPERS  (calls the live server)
// ============================================

async function getToken(userId: number): Promise<string> {
  // Use the user's stored google_id to get a token via auth/google
  const userRow = await pool.query(
    `SELECT google_id, email, name, avatar_url FROM users WHERE id = $1`,
    [userId]
  );
  const u = userRow.rows[0];
  const res = await fetch(`${API}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      googleId: u.google_id ?? `test-${userId}`,
      email:    u.email,
      name:     u.name,
      picture:  u.avatar_url,
    }),
  });
  const data = await res.json() as any;
  return data.token;
}

async function getSkillStatus(token: string, userId: number, skillId: number) {
  const res = await fetch(`${API}/api/ai/skill-status/${userId}/${skillId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as any;
}

async function generateAssignment(token: string, userId: number, skillId: number) {
  const res = await fetch(`${API}/api/ai/generate-assignment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId, skillId }),
  });
  return res.json() as any;
}

async function evaluateAnswer(
  token: string,
  userId: number,
  assignmentId: number,
  answer: string
) {
  const res = await fetch(`${API}/api/ai/evaluate-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId, assignmentId, answer }),
  });
  return res.json() as any;
}

async function nextAssignment(token: string, userId: number, skillId: number) {
  const res = await fetch(`${API}/api/ai/next-assignment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ userId, skillId }),
  });
  return res.json() as any;
}

// ============================================
// ASSERTION HELPER
// ============================================
let passed = 0;
let failed = 0;

function assert(label: string, condition: boolean, detail?: string) {
  if (condition) {
    ok(label);
    passed++;
  } else {
    fail(`${label}${detail ? " — " + detail : ""}`);
    failed++;
  }
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log(`\n${C.bold}${C.blue}${"═".repeat(62)}`);
  console.log("  SKILLVERSE — AI PROGRESSION TEST");
  console.log(`${"═".repeat(62)}${C.reset}`);

  // ── Setup: get a real user + skill ──────────────────────────
  const userRow = await pool.query(
    `SELECT id, name FROM users ORDER BY id LIMIT 1`
  );
  if (userRow.rows.length === 0) {
    fail("No users in DB. Register via the app first.");
    await pool.end(); return;
  }
  const userId   = userRow.rows[0].id as number;
  const userName = userRow.rows[0].name as string;

  const skillRow = await pool.query(
    `SELECT id, name FROM skills ORDER BY id LIMIT 1`
  );
  const skillId   = skillRow.rows[0].id as number;
  const skillName = skillRow.rows[0].name as string;

  console.log(`\n  ${C.bold}User :${C.reset} ${userName} (id=${userId})`);
  console.log(`  ${C.bold}Skill:${C.reset} ${skillName} (id=${skillId})`);

  // ── Clean up previous test submissions for this skill ───────
  await pool.query(
    `
    DELETE FROM assignment_submissions
    WHERE user_id = $1
      AND assignment_id IN (
        SELECT id FROM assignments WHERE skill_id = $2
      )
    `,
    [userId, skillId]
  );
  await pool.query(
    `UPDATE user_skills SET level='Beginner', progress=0, score=0,
     assignments_completed=0 WHERE user_id=$1 AND skill_id=$2`,
    [userId, skillId]
  );
  info("Cleaned previous submissions for a fresh test");

  // ── Get JWT ─────────────────────────────────────────────────
  let token: string;
  try {
    token = await getToken(userId);
    assert("Got JWT token from /api/auth/google", !!token);
  } catch (e: any) {
    fail(`Could not get token: ${e.message}`);
    fail("Make sure the server is running: npm run dev");
    await pool.end(); return;
  }

  // ──────────────────────────────────────────────────────────
  // CHECK INITIAL STATUS
  // ──────────────────────────────────────────────────────────
  head("INITIAL STATUS (fresh student, no submissions)");
  const s0 = await getSkillStatus(token, userId, skillId);
  info(`Status: ${JSON.stringify(s0.status, null, 2).split("\n").join("\n    ")}`);
  assert("Initial level is Beginner",      s0.status.currentLevel === "Beginner");
  assert("0 passes at current level",      s0.status.passesAtCurrentLevel === 0);
  assert("Cannot level up yet",            s0.status.canLevelUp === false);
  assert("Next level is Intermediate",     s0.status.nextLevel === "Intermediate");

  // ──────────────────────────────────────────────────────────
  // ROUND 1 — Generate Beginner, submit GOOD answer (pass 1)
  // ──────────────────────────────────────────────────────────
  head("ROUND 1 — Beginner  (1st pass, no level-up yet)");

  const gen1 = await generateAssignment(token, userId, skillId);
  if (!gen1.success) {
    fail(`Generate failed: ${gen1.message}`);
    if (gen1.message?.includes("quota") || gen1.error?.includes("429")) {
      console.log(`\n${C.yellow}  Gemini daily quota exhausted. Run again tomorrow.${C.reset}\n`);
    }
    await pool.end(); return;
  }

  info(`Difficulty assigned by server: ${gen1.assignment.difficulty}`);
  info(`Title: ${gen1.assignment.title}`);
  assert("Server assigned Beginner",       gen1.assignment.difficulty === "Beginner");
  assert("Progression returned",           !!gen1.progression);

  const a1  = gen1.assignment;
  const q1  = a1.questions?.question ?? "";
  const ec1 = (a1.questions?.expectedConcepts ?? []) as string[];

  const goodAnswer1 = `${ec1.map((c: string) => `${c}: This concept is central to ${skillName}. It ensures correctness by applying ${c} principles throughout the solution.`).join(" ")} Overall this demonstrates a solid understanding of the topic.`;

  const eval1 = await evaluateAnswer(token, userId, a1.id, goodAnswer1);
  info(`Score: ${eval1.evaluation?.score}  |  Passed: ${eval1.evaluation?.passed}`);
  info(`Feedback: ${eval1.evaluation?.feedback}`);
  info(`Level-up: ${eval1.progression?.leveledUp}  |  Msg: ${eval1.progression?.levelUpMessage}`);

  assert("Round 1 passed (score ≥60)",     eval1.evaluation?.score >= 60);
  assert("No level-up yet (need 2 passes)", eval1.progression?.leveledUp === false);
  assert("Still Beginner after 1 pass",    eval1.progression?.currentLevel === "Beginner");

  // ──────────────────────────────────────────────────────────
  // ROUND 2 — Still Beginner, submit GOOD answer (pass 2 → level-up!)
  // ──────────────────────────────────────────────────────────
  head("ROUND 2 — Beginner  (2nd pass → should unlock Intermediate)");

  const gen2 = await generateAssignment(token, userId, skillId);
  if (!gen2.success) {
    fail(`Generate failed: ${gen2.message}`); await pool.end(); return;
  }

  info(`Difficulty assigned by server: ${gen2.assignment.difficulty}`);
  assert("Server still assigns Beginner (not leveled up yet)", gen2.assignment.difficulty === "Beginner");

  const a2  = gen2.assignment;
  const ec2 = (a2.questions?.expectedConcepts ?? []) as string[];
  const goodAnswer2 = `${ec2.map((c: string) => `${c}: A key part of ${skillName}. Applying ${c} correctly makes the solution reliable and efficient.`).join(" ")} This answer covers all the required concepts thoroughly.`;

  const eval2 = await evaluateAnswer(token, userId, a2.id, goodAnswer2);
  info(`Score: ${eval2.evaluation?.score}  |  Passed: ${eval2.evaluation?.passed}`);
  info(`Level-up: ${eval2.progression?.leveledUp}  |  Msg: ${eval2.progression?.levelUpMessage}`);
  info(`Current level now: ${eval2.progression?.currentLevel}`);

  assert("Round 2 passed (score ≥60)",      eval2.evaluation?.score >= 60);
  assert("Level-up triggered",              eval2.progression?.leveledUp === true);
  assert("Level-up message present",        !!eval2.progression?.levelUpMessage);
  assert("Level is now Intermediate",       eval2.progression?.currentLevel === "Intermediate");

  // ──────────────────────────────────────────────────────────
  // ROUND 3 — First Intermediate assignment (earned it!)
  // ──────────────────────────────────────────────────────────
  head("ROUND 3 — Intermediate  (first assignment at new level)");

  const gen3 = await generateAssignment(token, userId, skillId);
  if (!gen3.success) {
    fail(`Generate failed: ${gen3.message}`); await pool.end(); return;
  }

  info(`Difficulty assigned by server: ${gen3.assignment.difficulty}`);
  assert("Server now assigns Intermediate", gen3.assignment.difficulty === "Intermediate");

  // BAD answer — should fail, no level-up
  const eval3 = await evaluateAnswer(token, userId, gen3.assignment.id, "I have no idea how to answer this.");
  info(`Score: ${eval3.evaluation?.score}  |  Passed: ${eval3.evaluation?.passed}`);
  info(`Level-up: ${eval3.progression?.leveledUp}  |  Msg: ${eval3.progression?.levelUpMessage}`);

  assert("Round 3 failed (bad answer)",     eval3.evaluation?.score < 60);
  assert("No level-up on failed answer",    eval3.progression?.leveledUp === false);
  assert("Still Intermediate after fail",   eval3.progression?.currentLevel === "Intermediate");

  // ──────────────────────────────────────────────────────────
  // ROUND 4 — Next-assignment endpoint test
  // ──────────────────────────────────────────────────────────
  head("ROUND 4 — /next-assignment endpoint");

  const next1 = await nextAssignment(token, userId, skillId);
  if (!next1.success) {
    fail(`Next-assignment failed: ${next1.message}`); await pool.end(); return;
  }

  info(`Difficulty: ${next1.assignment.difficulty}`);
  info(`Hint: ${next1.progression?.hint}`);
  assert("next-assignment returns Intermediate", next1.assignment.difficulty === "Intermediate");
  assert("Hint shown to student",               !!next1.progression?.hint);

  // ──────────────────────────────────────────────────────────
  // FINAL STATUS CHECK
  // ──────────────────────────────────────────────────────────
  head("FINAL SKILL STATUS");
  const sf = await getSkillStatus(token, userId, skillId);
  info(`Level       : ${sf.status.currentLevel}`);
  info(`Passes at level: ${sf.status.passesAtCurrentLevel}`);
  info(`Next level  : ${sf.status.nextLevel}`);
  info(`By level    : ${JSON.stringify(sf.status.byLevel)}`);

  assert("Final level is Intermediate", sf.status.currentLevel === "Intermediate");

  // ──────────────────────────────────────────────────────────
  // SUMMARY
  // ──────────────────────────────────────────────────────────
  console.log(`\n${C.bold}${C.blue}${"═".repeat(62)}`);
  console.log("  TEST RESULTS");
  console.log(`${"═".repeat(62)}${C.reset}`);
  console.log(`  ${C.green}Passed: ${passed}${C.reset}`);
  if (failed > 0) console.log(`  ${C.red}Failed: ${failed}${C.reset}`);
  console.log();

  if (failed === 0) {
    console.log(`  ${C.green}${C.bold}All assertions passed ✔${C.reset}`);
  } else {
    console.log(`  ${C.red}${C.bold}${failed} assertion(s) failed ✘${C.reset}`);
    console.log(`  ${C.dim}Check the output above for details.${C.reset}`);
  }
  console.log(`\n${C.blue}${"═".repeat(62)}${C.reset}\n`);

  await pool.end();
}

main().catch(async (e) => {
  console.error(`\n${C.red}FATAL:${C.reset}`, e.message);
  await pool.end();
  process.exit(1);
});
