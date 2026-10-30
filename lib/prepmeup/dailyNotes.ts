import { safeParseJson } from "@/lib/prepmeup/jsonRepair";
import fs from "fs";
import path from "path";
import { logger } from "@/lib/logger";

export interface DailyQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface DailyNoteData {
  id: string;
  date: string;
  subjectCode: string;
  subjectTitle: string;
  topic: string;
  readTimeMinutes: number;
  xpReward: number;
  summary: string[];
  notesMarkdown: string;
  quiz: DailyQuizQuestion[];
  notification: {
    id: string;
    title: string;
    message: string;
    publishedAt: string;
  };
}

const DEFAULT_DAILY_NOTE: DailyNoteData = {
  id: "daily-drop-2026-10-27-01",
  date: "October 27, 2026",
  subjectCode: "CSE1001",
  subjectTitle: "Applied Computational Mathematics",
  topic: "Cayley-Hamilton Theorem & Matrix Inverse Shortcut",
  readTimeMinutes: 5,
  xpReward: 50,
  summary: [
    "Every square matrix satisfies its own characteristic equation: $P(A) = 0$ where $P(\\lambda) = \\det(A - \\lambda I) = 0$.",
    "For any $2 \\times 2$ matrix $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$, the characteristic equation is $\\lambda^2 - \\text{Tr}(A)\\lambda + \\det(A) = 0$.",
    "Inverse formula shortcut: $A^2 - \\text{Tr}(A)A + \\det(A)I = 0 \\implies A^{-1} = \\frac{1}{\\det(A)}(\\text{Tr}(A)I - A)$.",
    "Higher power calculation: Any high power $A^n$ ($n \\ge 3$) can be reduced to a lower polynomial degree using synthetic division modulo the characteristic polynomial.",
    "Cayley-Hamilton applies to all real and complex square matrices regardless of whether eigenvalues are distinct or repeated.",
  ],
  notesMarkdown: `### 1. Theorem Formulation
Let $A \\in \\mathbb{R}^{n \\times n}$ be an arbitrary square matrix. The characteristic polynomial $p(\\lambda)$ of $A$ is defined by:
$$p(\\lambda) = \\det(A - \\lambda I) = (-1)^n \\lambda^n + c_{n-1}\\lambda^{n-1} + \\dots + c_1\\lambda + c_0$$

The **Cayley-Hamilton Theorem** asserts that substituting the matrix $A$ in place of the scalar variable $\\lambda$ yields the zero matrix:
$$p(A) = (-1)^n A^n + c_{n-1}A^{n-1} + \\dots + c_1 A + c_0 I_n = \\mathbf{0}$$

---

### 2. Matrix Inverse Shortcut Derivation
If $A$ is non-singular, then $\\det(A) = (-1)^n c_0 \\neq 0$. Multiplying the characteristic equation by $A^{-1}$:
$$A^{-1} \\left[ (-1)^n A^n + c_{n-1}A^{n-1} + \\dots + c_1 A + c_0 I \\right] = \\mathbf{0}$$
$$(-1)^n A^{n-1} + c_{n-1}A^{n-2} + \\dots + c_1 I + c_0 A^{-1} = \\mathbf{0}$$

Solving directly for $A^{-1}$:
$$A^{-1} = -\\frac{1}{c_0} \\left[ (-1)^n A^{n-1} + c_{n-1}A^{n-2} + \\dots + c_1 I \\right]$$

---

### 3. Step-by-Step Worked Numerical Example
**Problem:** Given matrix $A = \\begin{bmatrix} 2 & 1 \\\\ 3 & 4 \\end{bmatrix}$, verify the Cayley-Hamilton theorem and compute $A^{-1}$ and $A^3$.

**Step 1: Compute Trace and Determinant**
- $\\text{Tr}(A) = 2 + 4 = 6$
- $\\det(A) = (2)(4) - (1)(3) = 8 - 3 = 5$

**Step 2: Characteristic Equation**
$$p(\\lambda) = \\lambda^2 - \\text{Tr}(A)\\lambda + \\det(A) = \\lambda^2 - 6\\lambda + 5 = 0$$

**Step 3: Verification**
$$A^2 = \\begin{bmatrix} 2 & 1 \\\\ 3 & 4 \\end{bmatrix} \\begin{bmatrix} 2 & 1 \\\\ 3 & 4 \\end{bmatrix} = \\begin{bmatrix} 7 & 6 \\\\ 18 & 19 \\end{bmatrix}$$
$$A^2 - 6A + 5I = \\begin{bmatrix} 7 & 6 \\\\ 18 & 19 \\end{bmatrix} - \\begin{bmatrix} 12 & 6 \\\\ 18 & 24 \\end{bmatrix} + \\begin{bmatrix} 5 & 0 \\\\ 0 & 5 \\end{bmatrix} = \\begin{bmatrix} 0 & 0 \\\\ 0 & 0 \\end{bmatrix} = \\mathbf{0} \\quad \\text{(Verified!)}$$

**Step 4: Compute $A^{-1}$**
$$A^2 - 6A + 5I = 0 \\implies 5A^{-1} = 6I - A$$
$$A^{-1} = \\frac{1}{5}\\left( \\begin{bmatrix} 6 & 0 \\\\ 0 & 6 \\end{bmatrix} - \\begin{bmatrix} 2 & 1 \\\\ 3 & 4 \\end{bmatrix} \\right) = \\frac{1}{5}\\begin{bmatrix} 4 & -1 \\\\ -3 & 2 \\end{bmatrix} = \\begin{bmatrix} 0.8 & -0.2 \\\\ -0.6 & 0.4 \\end{bmatrix}$$

**Step 5: Compute Higher Power $A^3$**
Multiply $A^2 - 6A + 5I = 0$ by $A$:
$$A^3 = 6A^2 - 5A = 6(6A - 5I) - 5A = 31A - 30I$$
$$A^3 = 31\\begin{bmatrix} 2 & 1 \\\\ 3 & 4 \\end{bmatrix} - \\begin{bmatrix} 30 & 0 \\\\ 0 & 30 \\end{bmatrix} = \\begin{bmatrix} 32 & 31 \\\\ 93 & 94 \\end{bmatrix}$$`,
  quiz: [
    {
      id: "dq-1",
      question: "For a matrix $A$ of order $2 \\times 2$ with $\\text{Tr}(A) = 7$ and $\\det(A) = 10$, what is the Cayley-Hamilton relation satisfied by $A$?",
      options: [
        "A^2 - 7A + 10I = 0",
        "A^2 + 7A + 10I = 0",
        "A^2 - 10A + 7I = 0",
        "A^2 - 7A - 10I = 0",
      ],
      correctIndex: 0,
      explanation: "For any $2 \\times 2$ square matrix, the characteristic equation is $\\lambda^2 - \\text{Tr}(A)\\lambda + \\det(A) = 0$. By Cayley-Hamilton, substituting $\\lambda = A$ gives $A^2 - 7A + 10I = 0$.",
    },
    {
      id: "dq-2",
      question: "If $A$ satisfies $A^2 - 4A + 3I = 0$, what is the exact expression for $A^{-1}$ in terms of $A$ and $I$?",
      options: [
        "A^{-1} = 4I - A",
        "A^{-1} = \\frac{1}{3}(4I - A)",
        "A^{-1} = \\frac{1}{3}(A - 4I)",
        "A^{-1} = 3(4I - A)",
      ],
      correctIndex: 1,
      explanation: "Multiply $A^2 - 4A + 3I = 0$ by $A^{-1}$: $A - 4I + 3A^{-1} = 0 \\implies 3A^{-1} = 4I - A \\implies A^{-1} = \\frac{1}{3}(4I - A)$.",
    },
    {
      id: "dq-3",
      question: "What are the eigenvalues of a matrix $A$ satisfying $A^2 - 5A + 6I = 0$?",
      options: [
        "\\lambda = 1, 6",
        "\\lambda = 2, 3",
        "\\lambda = -2, -3",
        "\\lambda = 0, 5",
      ],
      correctIndex: 1,
      explanation: "The characteristic equation is $\\lambda^2 - 5\\lambda + 6 = 0$. Factoring gives $(\\lambda - 2)(\\lambda - 3) = 0$, so the eigenvalues are $\\lambda_1 = 2$ and $\\lambda_2 = 3$.",
    },
  ],
  notification: {
    id: "notif-daily-acm-01",
    title: "⚡ Daily High-Yield Capsule Ready!",
    message: "Master Cayley-Hamilton Theorem & Matrix Inverses in 5 mins + Test yourself for +50 XP",
    publishedAt: "2026-10-27T19:30:00.000Z",
  },
};

function getStoragePath(): string {
  return path.join(process.cwd(), "deploy", "cms", "daily_note.json");
}

export function getStoredDailyNote(): DailyNoteData {
  try {
    const p = getStoragePath();
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    logger.warn("DAILY_NOTE", "Failed to read stored daily note, using default", { error: String(err) });
  }
  return DEFAULT_DAILY_NOTE;
}

export function saveDailyNote(data: DailyNoteData): void {
  try {
    const p = getStoragePath();
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
    logger.audit("DAILY_NOTE_PUBLISHED", {
      id: data.id,
      topic: data.topic,
      subjectCode: data.subjectCode,
    });
  } catch (err) {
    logger.error("DAILY_NOTE", "Failed to save daily note", err);
    throw err;
  }
}

/**
 * Generate a complete daily note, quiz, and 60-second summary from a topic string using Groq AI.
 */
export async function generateDailyNoteWithAI(
  topic: string,
  subjectCode: string = "CSE1001",
  subjectTitle: string = "Applied Computational Mathematics"
): Promise<DailyNoteData> {
  const groqApiKey = process.env.GROQ_API_KEY || "";
  const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  if (!groqApiKey) {
    throw new Error("GROQ_API_KEY is not configured on the server");
  }

  const prompt = `You are a distinguished engineering professor and competitive exam creator for B.Tech First Year (Semester 1).
Create an elite, high-yield academic daily capsule for the following topic:
Subject: ${subjectTitle} (${subjectCode})
Topic: ${topic}

Respond with pure JSON conforming strictly to this format:
{
  "subjectCode": "${subjectCode}",
  "subjectTitle": "${subjectTitle}",
  "topic": "${topic}",
  "readTimeMinutes": 5,
  "xpReward": 50,
  "summary": [
    "4 to 5 crisp, high-yield exam takeaways using LaTeX for math like $\\\\lambda$ or formulas."
  ],
  "notesMarkdown": "Comprehensive high-yield notes in GitHub-flavored markdown. Include: 1. Core Concept & Theorem Formulation with display math ($$...$$). 2. Key Derivation/Formula. 3. Fully Worked Step-by-Step Numerical Example with exact numbers and answers.",
  "quiz": [
    {
      "id": "dq-1",
      "question": "Clear multiple choice question with LaTeX math.",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Step-by-step solution proving why this option is correct."
    },
    {
      "id": "dq-2",
      "question": "Second question.",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 1,
      "explanation": "Detailed explanation."
    },
    {
      "id": "dq-3",
      "question": "Third question.",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 2,
      "explanation": "Detailed explanation."
    }
  ],
  "notification": {
    "title": "⚡ Daily Drop: ${topic}",
    "message": "5-minute breakdown + interactive quiz. Earn +50 XP today!"
  }
}
Important: Return ONLY valid JSON. No conversational preamble. Escape backslashes in LaTeX as double backslashes (e.g. \\\\lambda, \\\\begin{bmatrix}).`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "PrepMeUp/1.0",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const json = await res.json();
  const rawContent = json.choices?.[0]?.message?.content || "";

  // Extract and repair JSON payload
  const parsed: any = safeParseJson(rawContent, null);
  if (!parsed) {
    throw new Error("Failed to parse JSON response from AI model");
  }
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const id = `daily-${Date.now()}`;

  return {
    id,
    date: dateStr,
    subjectCode: parsed.subjectCode || subjectCode,
    subjectTitle: parsed.subjectTitle || subjectTitle,
    topic: parsed.topic || topic,
    readTimeMinutes: parsed.readTimeMinutes || 5,
    xpReward: parsed.xpReward || 50,
    summary: Array.isArray(parsed.summary) ? parsed.summary : [parsed.summary || ""],
    notesMarkdown: parsed.notesMarkdown || "",
    quiz: Array.isArray(parsed.quiz) ? parsed.quiz : [],
    notification: {
      id: `notif-${id}`,
      title: parsed.notification?.title || `⚡ Daily Drop: ${topic}`,
      message: parsed.notification?.message || "Read today's high-yield note and test yourself (+50 XP)!",
      publishedAt: now.toISOString(),
    },
  };
}
