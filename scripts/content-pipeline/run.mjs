#!/usr/bin/env node
/**
 * PrepMeUp AI — Local multi-agent content pipeline.
 *
 * 1. WRITER agent (default deepseek-r1:8b via Ollama) drafts a lesson note per topic.
 * 2. Several REVIEWER agents (different local models) score it and list issues.
 * 3. If the average score is below the threshold, the writer revises using the
 *    feedback (up to --rounds times).
 * 4. Approved notes are saved to content_source/pipeline/ with a review report,
 *    and optionally uploaded to the website via the admin notes API.
 *
 * Usage:
 *   node scripts/content-pipeline/run.mjs --topics scripts/content-pipeline/topics.example.json
 *   node scripts/content-pipeline/run.mjs --topic "Binary Search Trees" --subject CSE1003 --module 2
 *   ... --upload            upload approved notes as "under_review" drafts
 *   ... --upload --publish  upload and publish immediately
 *
 * Env (read from .env.local if present):
 *   OLLAMA_URL (default http://127.0.0.1:11434)
 *   PIPELINE_WRITER_MODEL, PIPELINE_REVIEWER_MODELS (comma separated)
 *   PIPELINE_SITE_URL (default http://localhost:3000)
 *   PMU_ADMIN_EMAIL, PMU_ADMIN_PASSWORD  (required for --upload)
 */
import fs from "node:fs";
import path from "node:path";

// ---------- env + args ----------
for (const f of [".env.local", ".env"]) {
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};

const OLLAMA = (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
const WRITER = opt("writer", process.env.PIPELINE_WRITER_MODEL || "deepseek-r1:8b");
const REVIEWERS = (opt("reviewers", process.env.PIPELINE_REVIEWER_MODELS || "llama3.1:8b,gemma4:12b,qwen2.5:7b"))
  .split(",").map((s) => s.trim()).filter(Boolean);
const THRESHOLD = Number(opt("threshold", "7.5"));
const ROUNDS = Number(opt("rounds", "2"));
const SITE = (opt("site", process.env.PIPELINE_SITE_URL || "http://localhost:3000")).replace(/\/$/, "");
const OUT_DIR = path.resolve("content_source", "pipeline");
const UPLOAD = flag("upload");
const PUBLISH = flag("publish");
const DRY = flag("dry-run");

const ROLES = [
  { name: "Accuracy Reviewer", focus: "technical and factual correctness, wrong formulas, misleading claims, missing key concepts for a B.Tech syllabus" },
  { name: "Pedagogy Reviewer", focus: "clarity for a first-year engineering student, logical flow, worked examples, exam relevance" },
  { name: "Format & Safety Reviewer", focus: "clean Markdown structure (headings, lists, code blocks, LaTeX with $...$), no filler, no hallucinated references, nothing unsafe" },
];

// ---------- helpers ----------
const log = (...a) => console.log(`[${new Date().toLocaleTimeString()}]`, ...a);
const stripThink = (t) => t.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);

async function chat(model, system, user, { json = false, temperature = 0.4 } = {}) {
  const res = await fetch(`${OLLAMA}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      ...(json ? { format: "json" } : {}),
      options: { temperature, num_ctx: 8192 },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`${model}: HTTP ${res.status} ${await res.text()}`);
  const data = await res.json();
  return stripThink(data?.message?.content || "");
}

async function ensureModels() {
  const res = await fetch(`${OLLAMA}/api/tags`).catch(() => null);
  if (!res?.ok) throw new Error(`Ollama not reachable at ${OLLAMA}. Start it with: ollama serve`);
  const have = new Set((await res.json()).models.map((m) => m.name));
  const missing = [WRITER, ...REVIEWERS].filter((m) => !have.has(m) && !have.has(`${m}:latest`));
  if (missing.length) throw new Error(`Missing models: ${missing.join(", ")}. Run: ollama pull <model>`);
}

function loadTopics() {
  const single = opt("topic");
  if (single) {
    return [{ title: single, subjectCode: opt("subject", "CSE1001"), moduleNumber: Number(opt("module", "1")), notes: opt("notes", "") }];
  }
  const file = opt("topics");
  if (!file) throw new Error("Provide --topic \"...\" or --topics <file.json>");
  const list = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(list) || !list.length) throw new Error("Topics file must be a non-empty JSON array");
  return list;
}

// ---------- agents ----------
const WRITER_SYSTEM = `You are an expert university lecturer writing study notes for PrepMeUp AI (B.Tech CSE AI/ML students in India).
Write in clean GitHub Markdown. Structure: # Title, short intro, ## sections with explanations, at least one worked example,
code blocks where relevant, math in $...$ / $$...$$, a "## Key Takeaways" list, and "## Exam Practice" with 3-5 questions.
Be accurate and concise. Output ONLY the Markdown note, no preamble.`;

async function write(topic, previous, feedback) {
  const base = `Topic: ${topic.title}\nSubject code: ${topic.subjectCode}\nModule: ${topic.moduleNumber}\n${topic.notes ? `Author notes: ${topic.notes}\n` : ""}`;
  const user = previous
    ? `${base}\nRevise the note below. Fix EVERY issue raised by reviewers while keeping what works.\n\nREVIEWER FEEDBACK:\n${feedback}\n\nCURRENT NOTE:\n${previous}`
    : `${base}\nWrite the full study note now.`;
  const out = await chat(WRITER, WRITER_SYSTEM, user, { temperature: 0.6 });
  return out.replace(/^```(?:markdown|md)?\s*/i, "").replace(/```\s*$/, "").trim();
}

async function review(model, role, topic, note) {
  const system = `You are the ${role.name} on a strict editorial board. Focus on: ${role.focus}.
Respond ONLY with JSON: {"score": <0-10 number>, "approve": <boolean>, "issues": [<short strings>], "summary": "<one sentence>"}`;
  const raw = await chat(model, system, `Topic: ${topic.title} (${topic.subjectCode}, module ${topic.moduleNumber})\n\nNOTE:\n${note}`, { json: true, temperature: 0.1 });
  try {
    const j = JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] || raw);
    return { reviewer: role.name, model, score: Math.max(0, Math.min(10, Number(j.score) || 0)), approve: !!j.approve, issues: Array.isArray(j.issues) ? j.issues.slice(0, 8) : [], summary: String(j.summary || "") };
  } catch {
    return { reviewer: role.name, model, score: 0, approve: false, issues: ["Reviewer returned invalid JSON"], summary: raw.slice(0, 200) };
  }
}

// ---------- upload ----------
let adminCookie = null;
async function login() {
  const email = process.env.PMU_ADMIN_EMAIL;
  const password = process.env.PMU_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set PMU_ADMIN_EMAIL and PMU_ADMIN_PASSWORD in .env.local to use --upload");
  const res = await fetch(`${SITE}/api/prepmeup/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const cookie = (res.headers.getSetCookie?.() || [res.headers.get("set-cookie") || ""]).find((c) => c.startsWith("pmu-admin-session="));
  if (!res.ok || !cookie) throw new Error(`Admin login failed (HTTP ${res.status})`);
  adminCookie = cookie.split(";")[0];
}

async function upload(topic, note) {
  if (!adminCookie) await login();
  const words = note.split(/\s+/).length;
  const res = await fetch(`${SITE}/api/prepmeup/admin/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: adminCookie },
    body: JSON.stringify({
      topicId: topic.topicId || "f1111111-1111-4111-8111-111111111111",
      subjectCode: topic.subjectCode,
      moduleNumber: topic.moduleNumber,
      title: topic.title,
      contentMarkdown: note,
      readingTimeMin: Math.min(120, Math.max(1, Math.round(words / 200))),
      isSample: false,
      status: PUBLISH ? "published" : "under_review",
      isPublished: PUBLISH,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) throw new Error(`Upload failed: ${data.error || res.status}`);
  return data.note?.id;
}

// ---------- main ----------
async function processTopic(topic) {
  log(`▶ ${topic.title}`);
  let note = await write(topic);
  let reviews = [];
  let avg = 0;
  for (let round = 0; round <= ROUNDS; round++) {
    reviews = [];
    for (let i = 0; i < REVIEWERS.length; i++) {
      // Sequential so a single GPU is not overloaded by parallel models.
      const r = await review(REVIEWERS[i], ROLES[i % ROLES.length], topic, note);
      log(`   ${r.reviewer} (${r.model}): ${r.score}/10 ${r.approve ? "✓" : "✗"}`);
      reviews.push(r);
    }
    avg = reviews.reduce((s, r) => s + r.score, 0) / reviews.length;
    log(`   round ${round + 1}: avg ${avg.toFixed(1)} (need ${THRESHOLD})`);
    if (avg >= THRESHOLD || round === ROUNDS) break;
    const feedback = reviews.map((r) => `${r.reviewer}: ${r.summary}\n- ${r.issues.join("\n- ")}`).join("\n\n");
    note = await write(topic, note, feedback);
  }

  const approved = avg >= THRESHOLD;
  const slug = `${topic.subjectCode}-m${topic.moduleNumber}-${slugify(topic.title)}`;
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, `${slug}.md`), note, "utf8");
  const report = { topic, writer: WRITER, approved, averageScore: Number(avg.toFixed(2)), reviews, generatedAt: new Date().toISOString(), uploaded: false };

  if (approved && UPLOAD && !DRY) {
    try {
      report.noteId = await upload(topic, note);
      report.uploaded = true;
      log(`   ⬆ uploaded (${PUBLISH ? "published" : "under review"})`);
    } catch (e) {
      report.uploadError = e.message;
      log(`   ⚠ ${e.message}`);
    }
  } else if (!approved) {
    log(`   ✗ not approved — saved locally for manual editing`);
  }
  fs.writeFileSync(path.join(OUT_DIR, `${slug}.review.json`), JSON.stringify(report, null, 2), "utf8");
  return report;
}

(async () => {
  try {
    await ensureModels();
    const topics = loadTopics();
    log(`Writer: ${WRITER} | Reviewers: ${REVIEWERS.join(", ")} | ${topics.length} topic(s)`);
    const results = [];
    for (const t of topics) {
      try {
        results.push(await processTopic(t));
      } catch (e) {
        log(`   ⚠ ${t.title}: ${e.message}`);
        results.push({ topic: t, approved: false, error: e.message });
      }
    }
    const ok = results.filter((r) => r.approved).length;
    const up = results.filter((r) => r.uploaded).length;
    log(`Done: ${ok}/${results.length} approved, ${up} uploaded. Output: ${OUT_DIR}`);
  } catch (e) {
    console.error(`✗ ${e.message}`);
    process.exit(1);
  }
})();
