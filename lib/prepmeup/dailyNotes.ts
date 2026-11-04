import { safeParseJson } from "@/lib/prepmeup/jsonRepair";
import fs from "fs";
import path from "path";
import { logger } from "@/lib/logger";
import { resolvePersistentDataDir } from "@/app/prepmeup/_lib/studentStore";

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

/**
 * Curated Rotating Pool of Semester 1 High-Yield Capsules across all 6 DYPIU courses.
 * Indexed deterministically by calendar day in Asia/Kolkata so each day genuinely serves
 * distinct topic notes, derivations, and diagnostic questions.
 */
export const DAILY_CAPSULES_POOL: Omit<DailyNoteData, "date">[] = [
  {
    id: "capsule-cse1001-cayley-hamilton",
    subjectCode: "CSE1001",
    subjectTitle: "Applied Computational Mathematics",
    topic: "Cayley-Hamilton Theorem & Matrix Inverse Shortcut",
    readTimeMinutes: 5,
    xpReward: 50,
    summary: [
      "Every square matrix satisfies its own characteristic equation: $P(A) = 0$ where $P(\\lambda) = \\det(A - \\lambda I) = 0$.",
      "For any $2 \\times 2$ matrix $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$, the characteristic equation is $\\lambda^2 - \\text{Tr}(A)\\lambda + \\det(A) = 0$.",
      "Inverse formula shortcut: $A^2 - \\text{Tr}(A)A + \\det(A)I = 0 \\implies A^{-1} = \\frac{1}{\\det(A)}(\\text{Tr}(A)I - A)$.",
      "Higher power calculation: Any high power $A^n$ ($n \\ge 3$) can be reduced to a lower polynomial degree modulo the characteristic polynomial.",
    ],
    notesMarkdown: `### 1. Theorem Formulation
Let $A \\in \\mathbb{R}^{n \\times n}$ be an arbitrary square matrix. The characteristic polynomial $p(\\lambda)$ of $A$ is defined by:
$$p(\\lambda) = \\det(A - \\lambda I) = (-1)^n \\lambda^n + c_{n-1}\\lambda^{n-1} + \\dots + c_1\\lambda + c_0$$

The **Cayley-Hamilton Theorem** asserts that substituting the matrix $A$ in place of the scalar variable $\\lambda$ yields the zero matrix:
$$p(A) = (-1)^n A^n + c_{n-1}A^{n-1} + \\dots + c_1 A + c_0 I_n = \\mathbf{0}$$

---

### 2. Matrix Inverse Shortcut Derivation
If $A$ is non-singular ($\\det(A) \\neq 0$), multiplying the characteristic equation by $A^{-1}$ gives:
$$A^{-1} = -\\frac{1}{c_0} \\left[ (-1)^n A^{n-1} + c_{n-1}A^{n-2} + \\dots + c_1 I \\right]$$

---

### 3. Worked Numerical Example
Given $A = \\begin{bmatrix} 2 & 1 \\\\ 3 & 4 \\end{bmatrix}$:
- $\\text{Tr}(A) = 2 + 4 = 6$, $\\det(A) = 8 - 3 = 5$
- Characteristic equation: $\\lambda^2 - 6\\lambda + 5 = 0 \\implies A^2 - 6A + 5I = \\mathbf{0}$
- Inverse: $A^{-1} = \\frac{1}{5}(6I - A) = \\begin{bmatrix} 0.8 & -0.2 \\\\ -0.6 & 0.4 \\end{bmatrix}$`,
    quiz: [
      {
        id: "dq-1",
        question: "For a $2 \\times 2$ matrix $A$ with $\\text{Tr}(A) = 7$ and $\\det(A) = 10$, what is its Cayley-Hamilton relation?",
        options: ["A^2 - 7A + 10I = 0", "A^2 + 7A + 10I = 0", "A^2 - 10A + 7I = 0", "A^2 - 7A - 10I = 0"],
        correctIndex: 0,
        explanation: "Substituting $\\lambda = A$ into $\\lambda^2 - \\text{Tr}(A)\\lambda + \\det(A) = 0$ yields $A^2 - 7A + 10I = 0$.",
      },
      {
        id: "dq-2",
        question: "If $A$ satisfies $A^2 - 4A + 3I = 0$, what is $A^{-1}$?",
        options: ["A^{-1} = 4I - A", "A^{-1} = \\frac{1}{3}(4I - A)", "A^{-1} = \\frac{1}{3}(A - 4I)", "A^{-1} = 3(4I - A)"],
        correctIndex: 1,
        explanation: "Multiplying $A^2 - 4A + 3I = 0$ by $A^{-1}$ gives $A - 4I + 3A^{-1} = 0 \\implies A^{-1} = \\frac{1}{3}(4I - A)$.",
      },
      {
        id: "dq-3",
        question: "What are the eigenvalues of $A$ satisfying $A^2 - 5A + 6I = 0$?",
        options: ["\\lambda = 1, 6", "\\lambda = 2, 3", "\\lambda = -2, -3", "\\lambda = 0, 5"],
        correctIndex: 1,
        explanation: "Factoring $\\lambda^2 - 5\\lambda + 6 = (\\lambda - 2)(\\lambda - 3) = 0$ gives $\\lambda = 2, 3$.",
      },
    ],
    notification: {
      id: "notif-cse1001-ch",
      title: "⚡ Daily Revision Capsule: Cayley-Hamilton Theorem",
      message: "Master matrix inverse shortcuts in 5 mins + take the 3-question diagnostic quiz",
      publishedAt: "2026-10-27T06:00:00.000Z",
    },
  },
  {
    id: "capsule-cse1002-thevenin-mpt",
    subjectCode: "CSE1002",
    subjectTitle: "Basic Electrical and Electronics Engineering",
    topic: "Thevenin Equivalent Circuit & Maximum Power Transfer Theorem",
    readTimeMinutes: 6,
    xpReward: 50,
    summary: [
      "Any linear bilateral two-terminal DC network can be replaced by an open-circuit voltage source $V_{th}$ in series with equivalent resistance $R_{th}$.",
      "To find $R_{th}$, deactivate all independent sources: short-circuit independent voltage sources and open-circuit independent current sources.",
      "Maximum Power Transfer Theorem: Load resistor $R_L$ absorbs maximum power when $R_L = R_{th}$.",
      "At $R_L = R_{th}$, the maximum power delivered to the load is $P_{\\max} = \\frac{V_{th}^2}{4 R_{th}}$ and circuit efficiency is $50\\%$.",
    ],
    notesMarkdown: `### 1. Thevenin's Theorem & Load Current Equation
Across load terminals $A$-$B$, any linear resistive network simplifies to a series source $V_{th}$ and resistance $R_{th}$. When a load resistor $R_L$ is connected across $A$-$B$:
$$I_L = \\frac{V_{th}}{R_{th} + R_L}, \\qquad P_L = I_L^2 R_L = \\frac{V_{th}^2 R_L}{(R_{th} + R_L)^2}$$

---

### 2. Proof of Maximum Power Condition ($\\frac{dP_L}{dR_L} = 0$)
Differentiating load power $P_L$ with respect to $R_L$:
$$\\frac{dP_L}{dR_L} = V_{th}^2 \\frac{(R_{th} + R_L)^2 - R_L \\cdot 2(R_{th} + R_L)}{(R_{th} + R_L)^4} = 0$$
$$(R_{th} + R_L) - 2R_L = 0 \\implies R_L = R_{th}$$

Substituting $R_L = R_{th}$ yields the maximum power formula:
$$P_{\\max} = \\frac{V_{th}^2 R_{th}}{(2R_{th})^2} = \\frac{V_{th}^2}{4 R_{th}}$$

---

### 3. Solved University Numerical
**Problem:** A DC network has open-circuit terminal voltage $V_{th} = 24\\text{ V}$ and Thevenin resistance $R_{th} = 6\\, \\Omega$. Find the optimal load resistance $R_L$ and maximum power $P_{\\max}$.
1. For maximum power transfer: $R_L = R_{th} = 6\\, \\Omega$.
2. Load current at optimal match: $I_L = \\frac{24}{6 + 6} = 2.0\\text{ A}$.
3. Maximum load power: $P_{\\max} = \\frac{24^2}{4 \\times 6} = \\frac{576}{24} = 24.0\\text{ W}$.`,
    quiz: [
      {
        id: "dq-bee-1",
        question: "For a circuit with $V_{th} = 20\\text{ V}$ and $R_{th} = 5\\, \\Omega$, what is the maximum power $P_{\\max}$ that can be delivered to a purely resistive load $R_L$?",
        options: ["80 W", "40 W", "20 W", "10 W"],
        correctIndex: 2,
        explanation: "Using $P_{\\max} = \\frac{V_{th}^2}{4 R_{th}} = \\frac{20^2}{4 \\times 5} = \\frac{400}{20} = 20\\text{ W}$.",
      },
      {
        id: "dq-bee-2",
        question: "When computing $R_{th}$ for a network containing only independent sources, how are voltage and current sources treated?",
        options: [
          "Voltage sources shorted; current sources opened",
          "Voltage sources opened; current sources shorted",
          "Both shorted",
          "Both opened",
        ],
        correctIndex: 0,
        explanation: "Zeroing an ideal voltage source ($V=0$) corresponds to a short circuit, while zeroing an ideal current source ($I=0$) corresponds to an open circuit.",
      },
      {
        id: "dq-bee-3",
        question: "What is the electrical transmission efficiency $\\eta$ of a Thevenin circuit operating under Maximum Power Transfer ($R_L = R_{th}$)?",
        options: ["100%", "81.2%", "50%", "25%"],
        correctIndex: 2,
        explanation: "Since $R_L = R_{th}$, equal power $I^2 R$ is dissipated in $R_{th}$ and $R_L$, giving $\\eta = \\frac{R_L}{R_{th} + R_L} = 50\\%$.",
      },
    ],
    notification: {
      id: "notif-cse1002-thevenin",
      title: "⚡ Daily Revision Capsule: Thevenin & Max Power Transfer",
      message: "Review the dP/dRL = 0 proof and test yourself on 3 circuit numericals",
      publishedAt: "2026-10-28T06:00:00.000Z",
    },
  },
  {
    id: "capsule-cse1003-pipeline-hazards",
    subjectCode: "CSE1003",
    subjectTitle: "Computer Organization and Architecture",
    topic: "5-Stage RISC Pipelining, Speedup & RAW Data Hazards",
    readTimeMinutes: 6,
    xpReward: 50,
    summary: [
      "A 5-stage RISC pipeline overlaps Instruction Fetch (IF), Decode (ID), Execute (EX), Memory (MEM), and Write-Back (WB).",
      "For $n$ instructions on a $k$-stage pipeline with no stalls, total execution takes $k + n - 1$ clock cycles.",
      "Read-After-Write (RAW) is a true data dependency hazard where instruction $I_2$ reads a register before $I_1$ writes its result in WB.",
      "Hardware Data Forwarding (Bypassing) routes the ALU output from EX/MEM or MEM/WB directly to the next ALU input, eliminating most RAW stalls.",
    ],
    notesMarkdown: `### 1. Pipeline Throughput & Speedup Equations
In a non-pipelined processor where each instruction requires $k$ stages, executing $n$ instructions takes $T_{\\text{seq}} = n \\cdot k$ cycles. In an ideal $k$-stage pipeline:
$$T_{\\text{pipe}} = k + (n - 1) \\text{ cycles}, \\qquad S_k = \\frac{n \\cdot k}{k + n - 1} \\xrightarrow{n \\to \\infty} k$$

When pipeline stalls occur with average stall cycles per instruction $\\text{Stalls}_{\\text{avg}}$:
$$\\text{CPI}_{\\text{pipe}} = 1 + \\text{Stalls}_{\\text{avg}}$$

---

### 2. Data Hazards Classification
For two instructions $I_1$ (earlier) and $I_2$ (later):
- **RAW (Read After Write — True Dependency):** $I_2$ tries to read a source register before $I_1$ writes to it.
- **WAR (Write After Read — Anti-Dependency):** $I_2$ writes to a destination before $I_1$ reads it.
- **WAW (Write After Write — Output Dependency):** $I_2$ writes to the same register before $I_1$ writes to it.

---

### 3. Solved University Numerical
**Problem:** A 5-stage pipeline runs with a clock cycle of $2\\text{ ns}$. $20\\%$ of instructions incur a 1-cycle load-use RAW stall penalty. Compute the effective CPI and instruction throughput (MIPS).
1. Effective CPI: $\\text{CPI} = 1 + (0.20 \\times 1) = 1.20\\text{ cycles/instruction}$.
2. Clock frequency: $f = \\frac{1}{2\\text{ ns}} = 500\\text{ MHz}$.
3. Throughput: $\\text{MIPS} = \\frac{f}{\\text{CPI} \\times 10^6} = \\frac{500}{1.20} \\approx 416.67\\text{ MIPS}$.`,
    quiz: [
      {
        id: "dq-coa-1",
        question: "How many clock cycles are required to execute $100$ instructions on an ideal $5$-stage pipeline with zero stalls?",
        options: ["500 cycles", "105 cycles", "104 cycles", "100 cycles"],
        correctIndex: 2,
        explanation: "Using $k + n - 1$: $5 + 100 - 1 = 104$ clock cycles.",
      },
      {
        id: "dq-coa-2",
        question: "Which hazard occurs when instruction `SUB R3, R1, R2` immediately follows `ADD R1, R4, R5` in a simple 5-stage pipeline?",
        options: ["Structural hazard", "RAW (Read After Write) data hazard", "WAR anti-dependency", "Control branch hazard"],
        correctIndex: 1,
        explanation: "`SUB` reads `R1` in stage ID while `ADD` has not yet written `R1` back to the register file (which happens in WB), creating a RAW hazard.",
      },
      {
        id: "dq-coa-3",
        question: "If a pipelined processor has an ideal CPI of 1, a branch frequency of $15\\%$, and a 2-cycle branch stall penalty, what is the effective CPI?",
        options: ["1.15", "1.30", "1.50", "2.00"],
        correctIndex: 1,
        explanation: "$\\text{CPI} = 1 + 0.15 \\times 2 = 1 + 0.30 = 1.30$.",
      },
    ],
    notification: {
      id: "notif-cse1003-pipeline",
      title: "⚡ Daily Revision Capsule: 5-Stage RISC Pipelining & Hazards",
      message: "Master CPI stall formulas, RAW data forwarding, and speedup numericals",
      publishedAt: "2026-10-30T06:00:00.000Z",
    },
  },
  {
    id: "capsule-cse1005-python-complexity",
    subjectCode: "CSE1005",
    subjectTitle: "Python Programming",
    topic: "Python Hash Sets, List Comprehensions & Time Complexity Analysis",
    readTimeMinutes: 5,
    xpReward: 50,
    summary: [
      "Membership lookup `x in s` takes $\\mathcal{O}(1)$ average time in a Python `set` or `dict` (hash table) versus $\\mathcal{O}(n)$ in a `list` or `tuple`.",
      "Appending to a Python `list` via `.append(x)` runs in amortized $\\mathcal{O}(1)$ time, whereas `.insert(0, x)` or `.pop(0)` costs $\\mathcal{O}(n)$ due to element shifting.",
      "Generator expressions `(f(x) for x in seq)` evaluate lazily in $\\mathcal{O}(1)$ auxiliary memory, unlike list comprehensions `[f(x) for x in seq]` which allocate $\\mathcal{O}(n)$ memory.",
      "Dictionary keys and set elements must be hashable (immutable types such as `int`, `str`, `tuple` of immutables).",
    ],
    notesMarkdown: `### 1. Hash Table (\`set\` / \`dict\`) vs Dynamic Array (\`list\`)
Python lists are implemented as contiguous dynamic arrays of object pointers (\`PyObject**\`). Checking \`item in my_list\` performs a linear scan:
$$T_{\\text{list lookup}}(n) = \\mathcal{O}(n)$$

By contrast, Python \`set\` and \`dict\` compute \`hash(key)\` and index directly into an open-addressed hash table:
$$T_{\\text{set lookup}}(n) = \\mathcal{O}(1) \\text{ average}$$

---

### 2. First Duplicate Detection in $\\mathcal{O}(n)$ Time
\`\`\`python
def find_first_duplicate(arr: list[int]) -> int | None:
    seen = set()
    for val in arr:
        if val in seen:      # O(1) average hash lookup
            return val
        seen.add(val)        # O(1) average insertion
    return None
\`\`\`

---

### 3. Memory Comparison: List Comprehension vs Generator
\`\`\`python
import sys

eager_list = [x * x for x in range(100_000)]
lazy_gen   = (x * x for x in range(100_000))

# eager_list allocates ~800 KB immediately; lazy_gen uses ~200 bytes!
\`\`\``,
    quiz: [
      {
        id: "dq-py-1",
        question: "What is the average time complexity of checking `x in visited` when `visited` is a Python `set` of $n$ elements?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctIndex: 0,
        explanation: "Python sets are implemented as hash tables, providing $\\mathcal{O}(1)$ average-case lookup.",
      },
      {
        id: "dq-py-2",
        question: "Which of the following objects CANNOT be used as a key in a Python `dict`?",
        options: ["(1, 2, 3)", "' CSE1005 '", "[1, 2, 3]", "frozenset({1, 2})"],
        correctIndex: 2,
        explanation: "Lists `[1, 2, 3]` are mutable and unhashable (`TypeError: unhashable type: 'list'`).",
      },
      {
        id: "dq-py-3",
        question: "What is the time complexity of `my_list.pop(0)` on a Python list of length $n$?",
        options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
        correctIndex: 1,
        explanation: "Removing index 0 requires shifting all remaining $n - 1$ object references left by one position, taking $\\mathcal{O}(n)$ time.",
      },
    ],
    notification: {
      id: "notif-cse1005-sets",
      title: "⚡ Daily Revision Capsule: Python Sets & Big-O Complexity",
      message: "Compare O(1) hash lookups vs O(n) list scans + 3 quick quiz questions",
      publishedAt: "2026-10-31T06:00:00.000Z",
    },
  },
];

function getStoragePath(): string {
  return path.join(resolvePersistentDataDir(), "daily_note.json");
}

function getTodayFormatted(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function getRotatingCapsuleForToday(overrideDateStr?: string): DailyNoteData {
  // Deterministic rotation by calendar day in Asia/Kolkata
  const kolkataDateStr =
    overrideDateStr && /^\d{4}-\d{2}-\d{2}$/.test(overrideDateStr)
      ? overrideDateStr
      : new Date().toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        }); // YYYY-MM-DD
  const dayNum = parseInt(kolkataDateStr.replace(/-/g, ""), 10) || 20261030;
  const idx = dayNum % DAILY_CAPSULES_POOL.length;
  const selected = DAILY_CAPSULES_POOL[idx];

  const formattedDate =
    overrideDateStr && /^\d{4}-\d{2}-\d{2}$/.test(overrideDateStr)
      ? new Date(`${overrideDateStr}T12:00:00+05:30`).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        })
      : getTodayFormatted();

  return {
    ...selected,
    id: `${selected.id}-${kolkataDateStr}`,
    date: formattedDate,
    notification: {
      ...selected.notification,
      id: `${selected.notification.id}-${kolkataDateStr}`,
    },
  };
}

export function getStoredDailyNote(overrideDateStr?: string): DailyNoteData {
  if (overrideDateStr && /^\d{4}-\d{2}-\d{2}$/.test(overrideDateStr)) {
    return getRotatingCapsuleForToday(overrideDateStr);
  }
  const todayFormatted = getTodayFormatted();
  try {
    const p = getStoragePath();
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, "utf-8");
      const parsed = JSON.parse(raw);
      // Only use custom admin-published daily note if it was explicitly published for TODAY
      if (parsed && parsed.date === todayFormatted && parsed.topic) {
        return parsed;
      }
    }
  } catch (err) {
    logger.warn("DAILY_NOTE", "Failed to read stored daily note, using rotating pool", { error: String(err) });
  }
  return getRotatingCapsuleForToday();
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
    "title": "⚡ Daily Revision Capsule: ${topic}",
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

  const parsed: any = safeParseJson(rawContent, null);
  if (!parsed) {
    throw new Error("Failed to parse JSON response from AI model");
  }
  const now = new Date();
  const dateStr = getTodayFormatted();
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
      title: parsed.notification?.title || `⚡ Daily Revision Capsule: ${topic}`,
      message: parsed.notification?.message || "Read today's high-yield note and test yourself (+50 XP)!",
      publishedAt: now.toISOString(),
    },
  };
}
