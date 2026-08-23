import { Resend } from "resend";

// ============================================
// RESEND CLIENT
// ============================================

const resend = new Resend(process.env.RESEND_API_KEY);

// The "from" address must be from a verified
// domain in your Resend dashboard.
// During development you can use:
//   onboarding@resend.dev  (Resend's test address)
// In production replace with your own domain:
//   SkillVerse <noreply@yourdomain.com>
const FROM = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

// ============================================
// GUARD — silently skip if key not configured
// ============================================

function isConfigured(): boolean {
  return (
    !!process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== "your_resend_api_key_here"
  );
}

// ============================================
// SHARED HTML WRAPPER
// Clean, minimal email shell
// ============================================

function emailShell(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SkillVerse</title>
  <style>
    body { margin: 0; padding: 0; background: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .wrap { max-width: 580px; margin: 32px auto; background: #FFFFFF; border-radius: 16px; overflow: hidden; border: 1px solid #E2E8F0; }
    .header { background: #1456F0; padding: 28px 36px; }
    .header h1 { margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 800; letter-spacing: -0.3px; }
    .header p { margin: 4px 0 0; color: #BFDBFE; font-size: 13px; }
    .body { padding: 32px 36px; color: #1E293B; }
    .body h2 { margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #0F172A; }
    .body p { margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #475569; }
    .score-box { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 20px 24px; margin: 20px 0; text-align: center; }
    .score-big { font-size: 52px; font-weight: 900; color: #1456F0; line-height: 1; }
    .score-label { font-size: 13px; color: #64748B; margin-top: 4px; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; }
    .badge-pass { background: #DCFCE7; color: #16A34A; }
    .badge-fail { background: #FEE2E2; color: #DC2626; }
    .badge-levelup { background: #FEF3C7; color: #D97706; }
    .list { margin: 0; padding: 0; list-style: none; }
    .list li { padding: 8px 0; border-bottom: 1px solid #F1F5F9; font-size: 14px; color: #475569; }
    .list li:last-child { border-bottom: none; }
    .list li::before { content: attr(data-icon); margin-right: 8px; }
    .cta { display: block; margin: 24px 0 0; padding: 14px 28px; background: #1456F0; color: #FFFFFF; text-decoration: none; border-radius: 10px; font-size: 15px; font-weight: 700; text-align: center; }
    .footer { padding: 20px 36px; background: #F8FAFC; border-top: 1px solid #E2E8F0; font-size: 12px; color: #94A3B8; text-align: center; }
    .level-track { display: flex; align-items: center; gap: 8px; margin: 20px 0; justify-content: center; }
    .level-node { padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 700; }
    .level-done { background: #DCFCE7; color: #15803D; }
    .level-current { background: #1456F0; color: #FFFFFF; }
    .level-locked { background: #F1F5F9; color: #94A3B8; border: 1px dashed #CBD5E1; }
    .arrow { color: #CBD5E1; font-size: 16px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>SkillVerse</h1>
      <p>Your AI-powered learning journey</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      © 2026 SkillVerse · You're receiving this because you have an account with us.
    </div>
  </div>
</body>
</html>
  `.trim();
}

// ============================================
// EMAIL 1 — WELCOME
// Triggered: new user registers via Google
// ============================================

export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
}): Promise<void> {
  if (!isConfigured()) return;

  const { to, name } = params;
  const firstName = name.split(" ")[0];

  const html = emailShell(`
    <h2>Welcome to SkillVerse, ${firstName}! 🎉</h2>
    <p>
      You've just joined a community of students learning real skills,
      taking AI-powered assignments and connecting with peers.
    </p>
    <p>Here's what you can do right now:</p>
    <ul class="list">
      <li data-icon="📚">Pick a skill and get your first AI assignment</li>
      <li data-icon="🏆">Complete assignments to unlock Intermediate and Advanced levels</li>
      <li data-icon="👥">Discover other students and connect via chat</li>
      <li data-icon="🚀">Browse live hackathons and competitions</li>
    </ul>
    <a class="cta" href="${process.env.APP_URL ?? "http://localhost:8081"}">
      Start Learning →
    </a>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Welcome to SkillVerse, ${firstName}!`,
      html,
    });
    console.log(`Welcome email sent to ${to}`);
  } catch (error) {
    // Never crash the main request because of email failure
    console.error("Welcome email failed:", error);
  }
}

// ============================================
// EMAIL 2 — ASSIGNMENT RESULT
// Triggered: student submits an answer
// ============================================

export async function sendAssignmentResultEmail(params: {
  to: string;
  name: string;
  skillName: string;
  assignmentTitle: string;
  difficulty: string;
  score: number;
  passed: boolean;
  feedback: string;
  strengths: string[];
  improvements: string[];
}): Promise<void> {
  if (!isConfigured()) return;

  const {
    to, name, skillName, assignmentTitle,
    difficulty, score, passed, feedback,
    strengths, improvements,
  } = params;

  const firstName = name.split(" ")[0];
  const statusBadge = passed
    ? `<span class="badge badge-pass">✔ Passed</span>`
    : `<span class="badge badge-fail">✘ Needs More Practice</span>`;

  const strengthItems = strengths
    .map(s => `<li data-icon="✔">${s}</li>`)
    .join("");

  const improvementItems = improvements
    .map(s => `<li data-icon="→">${s}</li>`)
    .join("");

  const html = emailShell(`
    <h2>Assignment Result: ${assignmentTitle}</h2>
    <p>
      Hi ${firstName}, here's how you did on your
      <strong>${difficulty}</strong> ${skillName} assignment.
    </p>

    <div class="score-box">
      <div class="score-big">${score}</div>
      <div class="score-label">out of 100 &nbsp;·&nbsp; ${statusBadge}</div>
    </div>

    <p><strong>AI Feedback</strong></p>
    <p>${feedback}</p>

    ${strengths.length ? `
    <p><strong>What you did well</strong></p>
    <ul class="list">${strengthItems}</ul>
    ` : ""}

    ${improvements.length ? `
    <p><strong>Areas to improve</strong></p>
    <ul class="list">${improvementItems}</ul>
    ` : ""}

    <a class="cta" href="${process.env.APP_URL ?? "http://localhost:8081"}">
      ${passed ? "Continue to Next Assignment →" : "Try Again →"}
    </a>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `${passed ? "✔ Passed" : "Result"}: ${assignmentTitle} — ${score}/100`,
      html,
    });
    console.log(`Assignment result email sent to ${to}`);
  } catch (error) {
    console.error("Assignment result email failed:", error);
  }
}

// ============================================
// EMAIL 3 — LEVEL UP
// Triggered: student earns enough passes to
// unlock the next difficulty level
// ============================================

export async function sendLevelUpEmail(params: {
  to: string;
  name: string;
  skillName: string;
  previousLevel: string;
  newLevel: string;
}): Promise<void> {
  if (!isConfigured()) return;

  const { to, name, skillName, previousLevel, newLevel } = params;
  const firstName = name.split(" ")[0];

  const levels = ["Beginner", "Intermediate", "Advanced"];
  const levelNodes = levels.map(l => {
    const isDone    = levels.indexOf(l) < levels.indexOf(newLevel);
    const isCurrent = l === newLevel;
    const cls = isDone ? "level-done" : isCurrent ? "level-current" : "level-locked";
    return `<div class="level-node ${cls}">${isDone ? "✔ " : ""}${l}</div>`;
  }).join(`<div class="arrow">→</div>`);

  const html = emailShell(`
    <h2>Level Up! You unlocked ${newLevel} 🎉</h2>
    <p>
      Incredible work, ${firstName}! You've completed enough
      <strong>${previousLevel}</strong> assignments in <strong>${skillName}</strong>
      to unlock the next level.
    </p>

    <div class="score-box">
      <span class="badge badge-levelup">🏆 ${newLevel} Unlocked</span>
    </div>

    <div class="level-track">${levelNodes}</div>

    <p>
      Your next assignment will be at <strong>${newLevel}</strong> difficulty —
      expect more challenging and real-world questions.
    </p>

    <a class="cta" href="${process.env.APP_URL ?? "http://localhost:8081"}">
      Take Your First ${newLevel} Assignment →
    </a>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `🏆 You unlocked ${newLevel} level in ${skillName}!`,
      html,
    });
    console.log(`Level-up email sent to ${to}`);
  } catch (error) {
    console.error("Level-up email failed:", error);
  }
}
