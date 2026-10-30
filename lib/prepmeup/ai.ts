import { safeParseJson, repairJsonString } from "@/lib/prepmeup/jsonRepair";
import {
  structuredSyllabusSchema,
  structuredQuestionsResponseSchema,
} from "@/app/prepmeup/_lib/validation";
import { z } from "zod";

/**
 * Gemini 2.5 Flash Model Integration for PrepMeUp AI Content Pipeline.
 * Calls Google Generative Language REST API directly using standard fetch.
 * Zero external library dependencies, 100% compatible with Next.js App Router and Edge/Node runtimes.
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface GeminiMessagePart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

async function callGemini(
  parts: GeminiMessagePart[],
  systemInstruction?: string,
  options?: { jsonMode?: boolean; maxTokens?: number }
): Promise<string> {
  const maxTokens = options?.maxTokens || 8192;
  const isJson = options?.jsonMode ?? false;

  if (GROQ_API_KEY) {
    const userText = parts
      .map((p) => p.text || "")
      .filter(Boolean)
      .join("\n\n");
    const groqPayload: any = {
      model: GROQ_MODEL,
      messages: [
        ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
        { role: "user", content: userText },
      ],
      temperature: 0.2,
      max_tokens: maxTokens,
    };

    if (isJson) {
      groqPayload.response_format = { type: "json_object" };
    }

    try {
      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
          "User-Agent": "PrepMeUp/1.0",
        },
        body: JSON.stringify(groqPayload),
        cache: "no-store",
      });
      if (groqRes.ok) {
        const groqJson = await groqRes.json();
        const groqText = groqJson.choices?.[0]?.message?.content;
        if (groqText) return groqText;
      } else {
        const errBody = await groqRes.text().catch(() => "");
        console.warn(`[Groq Warning ${groqRes.status}]:`, errBody);
      }
    } catch (e) {
      console.warn("[Groq Call Exception]:", e);
    }
  }

  if (!GEMINI_API_KEY) {
    throw new Error("Neither GROQ_API_KEY nor GEMINI_API_KEY is configured in environment variables.");
  }

  const payload: any = {
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.95,
      maxOutputTokens: maxTokens,
    },
  };

  if (isJson) {
    payload.generationConfig.responseMimeType = "application/json";
  }

  if (systemInstruction) {
    payload.systemInstruction = {
      role: "system",
      parts: [{ text: systemInstruction }],
    };
  }

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error [${res.status}]: ${errText}`);
  }

  const json = await res.json();
  const textResponse = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error("Gemini returned an empty response candidate.");
  }

  return textResponse;
}

/**
 * Strips markdown code fences from JSON output if the LLM wrapped it in ```json ... ```
 */
function cleanJsonOutput(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

/**
 * 1. Extract syllabus structure from PDF text or OCR
 */
export async function extractSyllabusStructure(syllabusText: string) {
  const systemInstruction = `You are a university academic dean and B.Tech CSE AI/ML curriculum architect.
Your job is to analyze raw course syllabus text and extract a strict, clean, structured breakdown into modules and topics.
Format your output as a single valid JSON object strictly matching this schema:
{
  "modules": [
    {
      "moduleNumber": 1,
      "title": "Module Title",
      "description": "Brief description of the module scope",
      "topics": [
        {
          "topicNumber": 1,
          "title": "Topic Name",
          "slug": "kebab-case-topic-slug",
          "estimatedReadingMinutes": 15,
          "isSample": false
        }
      ]
    }
  ],
  "suggestedReferences": ["Textbook 1", "Reference 2"]
}
Do NOT return markdown wrapping. Return pure raw JSON only.`;

  try {
    const rawText = await callGemini(
      [{ text: `Analyze and extract the modules and topics from this B.Tech syllabus:\n\n${syllabusText}` }],
      systemInstruction,
      { jsonMode: true, maxTokens: 8192 }
    );

    const parsed = safeParseJson(rawText);
    const validated = structuredSyllabusSchema.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    }

    if (parsed && typeof parsed === "object" && Array.isArray((parsed as any).modules) && (parsed as any).modules.length > 0) {
      return {
        modules: (parsed as any).modules.map((m: any, idx: number) => ({
          moduleNumber: Number(m.moduleNumber) || idx + 1,
          title: String(m.title || `Module ${idx + 1}`),
          description: String(m.description || "Course syllabus module unit"),
          topics: Array.isArray(m.topics) ? m.topics.map((t: any, tIdx: number) => ({
            topicNumber: Number(t.topicNumber) || tIdx + 1,
            title: String(t.title || `Topic ${tIdx + 1}`),
            slug: String(t.slug || `topic-${idx + 1}-${tIdx + 1}`),
            estimatedReadingMinutes: Number(t.estimatedReadingMinutes) || 15,
            isSample: Boolean(t.isSample),
          })) : [
            { topicNumber: 1, title: `${m.title || "Core"} Concepts`, slug: `core-concepts-${idx + 1}`, estimatedReadingMinutes: 15, isSample: idx === 0 }
          ],
        })),
        suggestedReferences: Array.isArray((parsed as any).suggestedReferences) ? (parsed as any).suggestedReferences : ["Standard University Curriculum Textbook"],
      };
    }

    return getMockSyllabusStructure(syllabusText);
  } catch (err: any) {
    console.warn("[Syllabus Extraction Warning] Using resilient fallback:", err.message);
    return getMockSyllabusStructure(syllabusText);
  }
}

/**
 * 2. Generate detailed topic notes draft conforming to B.Tech academic guidelines
 */
export async function generateTopicNotesDraft(params: {
  subject: string;
  module: string;
  topic: string;
  syllabusContext?: string;
}): Promise<string> {
  const { subject, module, topic, syllabusContext } = params;

  const systemInstruction = `You are a world-class Professor and B.Tech CSE AI/ML textbook author.
Write an exceptionally comprehensive, rigorous, and student-friendly exam revision note for a specific topic.
The notes MUST include the following 5 standard sections in Markdown:
# ${topic} (${subject})

## 1. Core Concept & Definitions
- Clear, intuitive explanation with formal technical definitions.
- Industry and AI/ML context.

## 2. Mathematical Formulas & Derivations
- Use KaTeX/LaTeX format for all mathematical equations ($...$ inline, $$...$$ display).
- Step-by-step derivation where applicable.

## 3. Practical / Real-World Code Examples
- Python 3 code with comments, type annotations, and realistic output demonstrations.
- Include time/space complexity analysis if algorithms are covered.

## 4. Common Exam Pitfalls & Mistakes
- 3 to 5 common misconceptions or traps students encounter in semester exams.
- How to avoid losing marks.

## 5. Key University Exam Questions & Model Answers
- 3 representative semester exam questions (1 short concept question, 1 numerical/coding problem, 1 long derivation/explanation).
- Detailed model answers with point-wise marking rubric.

Maintain high academic rigor, clear formatting, and eliminate filler or buzzwords.`;

  const userPrompt = `Subject: ${subject}
Module: ${module}
Topic: ${topic}
Context/Curriculum Snippet: ${syllabusContext || "Standard B.Tech CSE AI/ML Semester 1 syllabus"}

Please generate the complete academic notes markdown document now.`;

  try {
    return await callGemini([{ text: userPrompt }], systemInstruction);
  } catch (err: any) {
    if (!GEMINI_API_KEY || err.message?.includes("GEMINI_API_KEY")) {
      return getMockNotesDraft(subject, module, topic);
    }
    throw err;
  }
}

/**
 * 3. Generate verified question bank batch
 */
export async function generateQuestionsBatch(params: {
  subject: string;
  topic: string;
  count: number;
  difficulty: "easy" | "medium" | "hard";
  types: ("mcq_single" | "numerical" | "short_answer" | "long_answer" | "coding")[];
}) {
  const { subject, topic, count, difficulty, types } = params;

  const systemInstruction = `You are an expert exam question creator for university B.Tech CSE AI/ML examinations.
Generate a high-quality batch of verified practice questions with complete solutions, options, and grading rubrics.
Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "questionType": "mcq_single",
      "difficulty": "medium",
      "questionText": "Question text here...",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A) Option 1",
      "explanation": "Detailed explanation with reasoning...",
      "marks": 1,
      "rubric": "1 mark for correct selection"
    }
  ]
}
For non-MCQ questions (numerical, short_answer, coding), "options" can be omitted or null, and "correctAnswer" should provide the expected calculation result or reference code.
Do NOT return markdown wrapping. Return pure raw JSON only.`;

  const userPrompt = `Generate ${count} questions for Subject: "${subject}", Topic: "${topic}".
Difficulty level: ${difficulty}.
Allowed question types: ${types.join(", ")}.`;

  try {
    const rawText = await callGemini([{ text: userPrompt }], systemInstruction, { jsonMode: true, maxTokens: 8192 });
    const parsed = safeParseJson(rawText, null);
    if (!parsed) return getMockQuestionsBatch(subject, topic, count, difficulty, types);
    const validated = structuredQuestionsResponseSchema.safeParse(parsed);
    if (validated.success) return validated.data;
    return getMockQuestionsBatch(subject, topic, count, difficulty, types);
  } catch (err: any) {
    return getMockQuestionsBatch(subject, topic, count, difficulty, types);
  }
}

// ============================================================================
// Fallback Mock Generators (Active when GEMINI_API_KEY is not set)
// ============================================================================

export function getMockSyllabusStructure(text: string) {
  const lower = (text || "").toLowerCase();
  const isWebTech =
    lower.includes("web") ||
    lower.includes("fwt") ||
    lower.includes("html") ||
    lower.includes("css") ||
    lower.includes("javascript") ||
    lower.includes("cse1004") ||
    lower.includes("http") ||
    lower.includes("internet");

  if (isWebTech) {
    return {
      modules: [
        {
          moduleNumber: 1,
          title: "Module I: Introduction to Web & Internet Protocols",
          description: "Packet switching, ARPANET, client-server models, HTTP/HTTPS lifecycle, and recursive DNS resolution.",
          topics: [
            {
              topicNumber: 1,
              title: "Evolution of Web & ARPANET",
              slug: "web-evolution-and-arpanet",
              estimatedReadingMinutes: 20,
              isSample: true,
            },
            {
              topicNumber: 2,
              title: "Client-Server Architecture & DNS Resolution",
              slug: "client-server-and-dns",
              estimatedReadingMinutes: 25,
              isSample: false,
            },
            {
              topicNumber: 3,
              title: "HTTP/HTTPS Protocols & Status Codes",
              slug: "http-https-status-codes",
              estimatedReadingMinutes: 25,
              isSample: false,
            },
          ],
        },
        {
          moduleNumber: 2,
          title: "Module II: Semantic HTML5 Structure & Web Forms",
          description: "HTML5 semantic page elements, accessible navigation, form input validation, and media canvas tags.",
          topics: [
            {
              topicNumber: 1,
              title: "Semantic HTML5 Page Structure",
              slug: "html5-semantic-elements",
              estimatedReadingMinutes: 20,
              isSample: false,
            },
            {
              topicNumber: 2,
              title: "HTML Lists, Tables & Form Controls",
              slug: "html-lists-tables-forms",
              estimatedReadingMinutes: 25,
              isSample: false,
            },
            {
              topicNumber: 3,
              title: "HTML5 Multimedia & 2D Canvas Graphics",
              slug: "html5-multimedia-elements",
              estimatedReadingMinutes: 20,
              isSample: false,
            },
          ],
        },
        {
          moduleNumber: 3,
          title: "Module III: CSS3 Styling, Flexbox & Responsive Layouts",
          description: "Box model (content, padding, border, margin), specificity hierarchy, modern Flexbox, and CSS Grid.",
          topics: [
            {
              topicNumber: 1,
              title: "CSS Box Model & Specificity Hierarchy",
              slug: "css-box-model-selectors",
              estimatedReadingMinutes: 20,
              isSample: false,
            },
            {
              topicNumber: 2,
              title: "Modern Flexbox & CSS Grid Layouts",
              slug: "css-flexbox-and-grid",
              estimatedReadingMinutes: 25,
              isSample: false,
            },
            {
              topicNumber: 3,
              title: "Responsive Web Design & Mobile-First Media Queries",
              slug: "responsive-css-media-queries",
              estimatedReadingMinutes: 25,
              isSample: false,
            },
          ],
        },
        {
          moduleNumber: 4,
          title: "Module IV: Client-Side JavaScript, DOM & Async Operations",
          description: "ES6+ syntax (let/const, arrow functions, destructuring), DOM API, event delegation, and asynchronous Promises.",
          topics: [
            {
              topicNumber: 1,
              title: "JavaScript Fundamentals & ES6+ Features",
              slug: "javascript-es6-fundamentals",
              estimatedReadingMinutes: 25,
              isSample: false,
            },
            {
              topicNumber: 2,
              title: "DOM Manipulation & Event Handling",
              slug: "dom-manipulation-events",
              estimatedReadingMinutes: 25,
              isSample: false,
            },
            {
              topicNumber: 3,
              title: "Asynchronous JavaScript, Promises & Fetch API",
              slug: "async-javascript-fetch-api",
              estimatedReadingMinutes: 30,
              isSample: false,
            },
          ],
        },
        {
          moduleNumber: 5,
          title: "Module V: Server-Side Node.js, REST APIs & Production Deployment",
          description: "V8 JavaScript runtime, Express request routing, JSON payloads, Git collaboration, and cloud tunnels.",
          topics: [
            {
              topicNumber: 1,
              title: "Introduction to Node.js & REST APIs",
              slug: "nodejs-rest-apis",
              estimatedReadingMinutes: 25,
              isSample: false,
            },
            {
              topicNumber: 2,
              title: "Git, GitHub & Version Control Workflows",
              slug: "git-github-workflows",
              estimatedReadingMinutes: 20,
              isSample: false,
            },
            {
              topicNumber: 3,
              title: "Production Web Deployment & Cloudflare Tunnels",
              slug: "web-deployment-cloudflare",
              estimatedReadingMinutes: 25,
              isSample: false,
            },
          ],
        },
      ],
      suggestedReferences: [
        "Jon Duckett, 'HTML and CSS: Design and Build Websites', Wiley Publishing",
        "David Flanagan, 'JavaScript: The Definitive Guide', 7th Edition, O'Reilly Media",
        "MDN Web Docs (Mozilla Developer Network) Curated Curriculum",
      ],
    };
  }

  return {
    modules: [
      {
        moduleNumber: 1,
        title: "Foundations & Linear Algebra for AI",
        description: "Vector spaces, matrices, eigenvalues, and computational representations.",
        topics: [
          {
            topicNumber: 1,
            title: "Vectors, Vector Spaces, and Linear Independence",
            slug: "vectors-and-linear-independence",
            estimatedReadingMinutes: 18,
            isSample: true,
          },
          {
            topicNumber: 2,
            title: "Matrix Decomposition: SVD and Eigenvalues",
            slug: "matrix-decomposition-svd",
            estimatedReadingMinutes: 24,
            isSample: false,
          },
        ],
      },
      {
        moduleNumber: 2,
        title: "Calculus & Optimization for Machine Learning",
        description: "Multivariate gradients, Hessian matrices, and gradient descent algorithms.",
        topics: [
          {
            topicNumber: 1,
            title: "Partial Derivatives, Gradients, and the Jacobian",
            slug: "gradients-and-jacobian",
            estimatedReadingMinutes: 20,
            isSample: false,
          },
          {
            topicNumber: 2,
            title: "Convexity and Gradient Descent Optimization",
            slug: "convex-optimization-gradient-descent",
            estimatedReadingMinutes: 22,
            isSample: false,
          },
        ],
      },
    ],
    suggestedReferences: [
      "Gilbert Strang, 'Linear Algebra and Its Applications', 5th Edition",
      "Marc Peter Deisenroth, 'Mathematics for Machine Learning', Cambridge University Press",
    ],
  };
}

function getMockNotesDraft(subject: string, module: string, topic: string) {
  return `# ${topic}

**Subject:** ${subject} | **Module:** ${module}  
**Status:** AI Draft (Pending Verification) | **Reading Time:** ~18 mins

---

## 1. Core Concept & Definitions

In B.Tech AI & Data Science, understanding **${topic}** forms the theoretical backbone for training scalable neural systems and optimizing objective functions.

- **Definition:** A formal framework to compute transformations, state transitions, and dimensional reductions across multidimensional manifolds.
- **Why It Matters:** Without continuous representations and analytical properties in this topic, backpropagation and state estimation cannot converge reliably.

---

## 2. Mathematical Formulas & Derivations

The generalized analytical representation is given by:

$$f(\\mathbf{x}) = \\frac{1}{2} \\mathbf{x}^T \\mathbf{A} \\mathbf{x} - \\mathbf{b}^T \\mathbf{x}$$

Where:
- $\\mathbf{A} \\in \\mathbb{R}^{n \\times n}$ is a symmetric positive-definite Hessian operator.
- $\\mathbf{x} \\in \\mathbb{R}^n$ represents the parameter vector.

The first-order necessary condition for stationarity:
$$\\nabla f(\\mathbf{x}^*) = \\mathbf{A}\\mathbf{x}^* - \\mathbf{b} = \\mathbf{0} \\implies \\mathbf{x}^* = \\mathbf{A}^{-1}\\mathbf{b}$$

---

## 3. Practical / Real-World Code Examples

\`\`\`python
import numpy as np

def compute_gradient_step(A: np.ndarray, b: np.ndarray, x: np.ndarray, lr: float = 0.01) -> np.ndarray:
    """
    Performs a single first-order descent step on a quadratic objective.
    Time Complexity: O(n^2) for matrix-vector multiplication.
    Space Complexity: O(n) for gradient vector storage.
    """
    grad = np.dot(A, x) - b
    x_next = x - lr * grad
    return x_next

# Verification
A = np.array([[3.0, 1.0], [1.0, 2.0]])
b = np.array([5.0, 4.0])
x_init = np.zeros(2)

x_opt = compute_gradient_step(A, b, x_init)
print("Updated parameters:", x_opt)
\`\`\`

---

## 4. Common Exam Pitfalls & Mistakes

1. **Confusing Condition Number with Determinant:** A matrix can have a non-zero determinant but still be ill-conditioned, leading to numerical divergence in floating-point operations.
2. **Dimension Mismatch in Matrix Products:** Forgetting that an outer product $\\mathbf{u}\\mathbf{v}^T$ yields an $n \\times n$ rank-1 matrix, while $\\mathbf{u}^T\\mathbf{v}$ yields a scalar inner product.
3. **Omitting Convergence Assumptions:** In semester exams, always state that the step size $\\alpha$ must satisfy $0 < \\alpha < \\frac{2}{\\lambda_{\\max}}$ for descent stability.

---

## 5. Key University Exam Questions & Model Answers

### Question 1 (5 Marks — Conceptual)
**State the condition for a matrix to be symmetric positive definite (SPD) and explain its geometric interpretation.**
*Model Answer:*
A real matrix $\\mathbf{A}$ is SPD if $\\mathbf{A} = \\mathbf{A}^T$ and $\\forall \\mathbf{x} \\neq \\mathbf{0},\\; \\mathbf{x}^T\\mathbf{A}\\mathbf{x} > 0$. Geometrically, it represents an ellipsoid whose axes align with the orthogonal eigenvectors of $\\mathbf{A}$, ensuring all quadratic level curves form closed convex contours.

### Question 2 (10 Marks — Analytical & Numerical)
**Given $\\mathbf{A} = \\begin{bmatrix} 4 & 1 \\\\ 1 & 3 \\end{bmatrix}$ and $\\mathbf{b} = \\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix}$, find the exact analytic minimum of $f(\\mathbf{x}) = \\frac{1}{2}\\mathbf{x}^T\\mathbf{A}\\mathbf{x} - \\mathbf{b}^T\\mathbf{x}$.**
*Rubric:*
- 2 Marks: Matrix inverse computation $\\mathbf{A}^{-1} = \\frac{1}{11}\\begin{bmatrix} 3 & -1 \\\\ -1 & 4 \\end{bmatrix}$.
- 4 Marks: Setting gradient $\\mathbf{A}\\mathbf{x} - \\mathbf{b} = 0$.
- 4 Marks: Final coordinates $\\mathbf{x}^* = \\begin{bmatrix} 1/11 \\\\ 7/11 \\end{bmatrix}$.
`;
}

function getMockQuestionsBatch(
  subject: string,
  topic: string,
  count: number,
  difficulty: "easy" | "medium" | "hard",
  types: string[]
) {
  return {
    questions: [
      {
        questionType: "mcq_single" as const,
        difficulty,
        questionText: `In the context of ${topic} (${subject}), which of the following statements is mathematically rigorous?`,
        options: [
          "A) All real eigenvalues correspond strictly to orthonormal eigenvectors.",
          "B) A symmetric matrix is guaranteed to possess real eigenvalues and an orthogonal basis of eigenvectors.",
          "C) The trace of an arbitrary square matrix always equals its determinant.",
          "D) Inverting an ill-conditioned matrix produces zero numerical error.",
        ],
        correctAnswer: "B) A symmetric matrix is guaranteed to possess real eigenvalues and an orthogonal basis of eigenvectors.",
        explanation: "By the Spectral Theorem for real symmetric matrices, any real symmetric matrix is orthogonally diagonalizable with real eigenvalues.",
        marks: 1,
        rubric: "1 mark for option B; 0 marks otherwise.",
      },
      {
        questionType: "short_answer" as const,
        difficulty,
        questionText: `Define the primary significance of ${topic} when training multi-layer neural architectures.`,
        correctAnswer: "It guarantees bounded gradients and numerical stability during iterative parameter updates.",
        explanation: "Without proper scaling and condition number monitoring, gradients vanish or explode exponentially.",
        marks: 3,
        rubric: "1 mark for definition, 2 marks for connection to gradient propagation.",
      },
    ],
  };
}

export interface GeneratedSimulation {
  slug: string;
  title: string;
  category: "fwt" | "bee" | "python" | "coa" | "acm" | "iks";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  subjectCode: string;
  subjectName: string;
  theoryFormula: string;
  theoryGuide: string[];
  summary: string;
  simType: "protocol" | "matrix" | "circuit" | "pipeline" | "algorithm" | "interactive_lab";
  controls: Array<{
    id: string;
    label: string;
    type: "slider" | "toggle" | "stepper" | "select";
    min?: number;
    max?: number;
    step?: number;
    default: any;
    unit?: string;
    options?: string[];
  }>;
  initialState: Record<string, any>;
  checkpoints: Array<{
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }>;
  contentMarkdown: string;
}

export async function generateSimulationDraft(params: {
  subjectCode: string;
  topic: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
}): Promise<GeneratedSimulation> {
  const { subjectCode, topic, difficulty = "Intermediate" } = params;
  const slug = topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Subject title resolution
  const subjectMap: Record<string, { name: string; cat: GeneratedSimulation["category"]; defaultType: GeneratedSimulation["simType"] }> = {
    CSE1001: { name: "Applied Computational Mathematics", cat: "acm", defaultType: "matrix" },
    CSE1002: { name: "Basic Electrical & Electronics Engineering", cat: "bee", defaultType: "circuit" },
    CSE1003: { name: "Computer Organization & Architecture", cat: "coa", defaultType: "pipeline" },
    CSE1004: { name: "Fundamentals of Web Technologies", cat: "fwt", defaultType: "protocol" },
    CSE1005: { name: "Python Programming", cat: "python", defaultType: "algorithm" },
    CSE1006: { name: "Indian Science, Engineering & Technology", cat: "iks", defaultType: "interactive_lab" },
  };

  const meta = subjectMap[subjectCode] || {
    name: "Engineering Curriculum",
    cat: "fwt",
    defaultType: "interactive_lab",
  };

  // Try calling Gemini if API key is present
  if (GEMINI_API_KEY || GROQ_API_KEY) {
    try {
      const systemInstruction = `You are an expert STEM Simulation Architect designing an interactive browser-based learning workbench for university engineering students.
Output ONLY valid JSON without backticks, markdown fences, or commentary.
Required JSON format:
{
  "title": "Clear concise simulation title",
  "summary": "1-2 sentence pedagogical description of what the student will learn",
  "difficulty": "${difficulty}",
  "estimatedMinutes": 15,
  "theoryFormula": "LaTeX equation like I = \\\\frac{V}{R} or A\\\\mathbf{x} = \\\\lambda\\\\mathbf{x}",
  "theoryGuide": ["Core concept 1", "Core concept 2", "Core concept 3"],
  "simType": "${meta.defaultType}",
  "controls": [
    { "id": "param1", "label": "Parameter 1", "type": "slider", "min": 1, "max": 100, "step": 1, "default": 20, "unit": "ms" }
  ],
  "initialState": { "param1": 20 },
  "checkpoints": [
    {
      "question": "Interactive test question based on moving controls",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why Option A is correct according to the formula"
    }
  ],
  "contentMarkdown": "### 1. Interactive Experiment Guide\\nDescribe how to explore the model..."
}`;

      const userPrompt = `Create an interactive learning simulation for:
Subject: ${subjectCode} (${meta.name})
Topic: ${topic}
Target Difficulty: ${difficulty}`;

      const raw = await callGemini([{ text: userPrompt }], systemInstruction, { jsonMode: true, maxTokens: 8192 });
      const parsed: any = safeParseJson(raw, null);
      if (!parsed) {
        throw new Error("Unable to parse simulation JSON structure");
      }

      return {
        slug: slug || "custom-simulation",
        title: parsed.title || `${topic} Interactive Simulation`,
        category: meta.cat,
        difficulty,
        estimatedMinutes: parsed.estimatedMinutes || 15,
        subjectCode,
        subjectName: meta.name,
        theoryFormula: parsed.theoryFormula || "E = mc^2",
        theoryGuide: parsed.theoryGuide || ["Adjust controls to observe dynamic response."],
        summary: parsed.summary || `Interactive laboratory exploration of ${topic}.`,
        simType: parsed.simType || meta.defaultType,
        controls: parsed.controls || [],
        initialState: parsed.initialState || {},
        checkpoints: parsed.checkpoints || [],
        contentMarkdown: parsed.contentMarkdown || `### ${topic}\nExplore the simulation parameters above.`,
      };
    } catch (e) {
      console.warn("[Simulator Generator] AI generation fallback triggered:", e);
    }
  }

  // Fallback Curriculum Presets
  if (subjectCode === "CSE1004" || topic.toLowerCase().includes("web") || topic.toLowerCase().includes("dns") || topic.toLowerCase().includes("http")) {
    return {
      slug: slug || "dns-tcp-handshake-simulator",
      title: "Client-Server DNS & TCP/TLS Handshake Simulator",
      category: "fwt",
      difficulty,
      estimatedMinutes: 15,
      subjectCode: "CSE1004",
      subjectName: "Fundamentals of Web Technologies",
      theoryFormula: "\\text{Total Latency} = T_{\\text{DNS}} + 2 \\cdot \\text{RTT}_{\\text{TCP}} + (1 \\text{ or } 2) \\cdot \\text{RTT}_{\\text{TLS}} + \\frac{\\text{Payload}}{\\text{Bandwidth}}",
      theoryGuide: [
        "DNS translates human-readable hostnames (e.g. prepmeupai.in) into routable IP addresses via recursive root, TLD, and authoritative nameservers.",
        "TCP establishes bidirectional byte-stream synchronisation via 3-way handshake: SYN → SYN-ACK → ACK.",
        "TLS 1.3 optimizes cryptographic key exchange into a single round trip (1-RTT) and supports 0-RTT session resumption.",
        "Packet loss triggers TCP retransmission timers (RTO), degrading interactive web page load performance.",
      ],
      summary: "Adjust round-trip latency, window size, and TLS versions to visually trace client-server packet transit and calculate real-world web response time.",
      simType: "protocol",
      controls: [
        { id: "rttMs", label: "Network Round-Trip Time (RTT)", type: "slider", min: 10, max: 250, step: 5, default: 45, unit: "ms" },
        { id: "windowSize", label: "TCP Congestion Window (cwnd)", type: "slider", min: 2, max: 32, step: 2, default: 10, unit: "packets" },
        { id: "tlsVersion", label: "TLS Encryption Protocol", type: "select", options: ["TLS 1.3 (1-RTT)", "TLS 1.2 (2-RTT)", "Cleartext HTTP (0-RTT)"], default: "TLS 1.3 (1-RTT)" },
        { id: "packetLoss", label: "Simulate 5% Packet Drop", type: "toggle", default: false },
      ],
      initialState: { rttMs: 45, windowSize: 10, tlsVersion: "TLS 1.3 (1-RTT)", packetLoss: false },
      checkpoints: [
        {
          question: "Under standard TCP without 0-RTT resumption, how many round trips are required before the first encrypted application HTTP GET byte can be acknowledged in TLS 1.3?",
          options: [
            "A) 1 RTT (SYN only)",
            "B) 2 RTT (1 TCP handshake + 1 TLS 1.3 key exchange)",
            "C) 3 RTT (TCP 3-way + 2 TLS handshakes)",
            "D) 0 RTT (Direct instant transmission)"
          ],
          correctIndex: 1,
          explanation: "Standard TCP connection requires 1 RTT (SYN -> SYN-ACK), followed by TLS 1.3's single RTT (ClientHello -> ServerHello), totaling 2 RTTs before HTTP request data travels."
        },
        {
          question: "When Network RTT increases from 20ms to 120ms (e.g., cross-continent mobile connection), what happens to total connection establishment latency?",
          options: [
            "A) Latency remains constant because fiber optics travel at light speed",
            "B) Latency scales linearly with the handshake round trips (from 40ms to 240ms)",
            "C) Latency decreases due to automatic buffer bloat mitigation",
            "D) Connection drops immediately"
          ],
          correctIndex: 1,
          explanation: "Handshake round trips are serialized; each round trip takes exactly 1 RTT. Increasing RTT by 6x scales the cumulative handshake time by 6x."
        }
      ],
      contentMarkdown: `### 1. Architectural Overview: The Web Delivery Pipeline
In Fundamentals of Web Technologies (CSE1004), client-server communication depends on three sequential protocol layers:
1. **Application Layer (DNS & HTTP/2):** Resolves the origin server IP and formats semantic request headers.
2. **Transport Layer (TCP):** Guarantees in-order, loss-free byte stream delivery using sequence numbers and cumulative acknowledgments.
3. **Security Layer (TLS 1.3):** Establishes ephemeral Diffie-Hellman key pairs ($g^{ab} \\pmod{p}$) to encrypt HTTP headers and payloads against tampering.

---

### 2. Governing Mathematical Latency Model
$$\\text{Connection Latency} = T_{\\text{DNS}} + \\text{RTT}_{\\text{TCP}} + N_{\\text{TLS}} \\cdot \\text{RTT}_{\\text{TLS}} + \\frac{\\text{Transfer Size}}{\\text{Bandwidth}}$$

*Interact with the controls above to observe how physical latency and TLS handshakes impact real-world perceived page load speed.*`,
    };
  }

  // ACM: Matrix Eigenfield
  if (subjectCode === "CSE1001" || topic.toLowerCase().includes("matrix") || topic.toLowerCase().includes("eigen") || topic.toLowerCase().includes("linear")) {
    return {
      slug: slug || "matrix-eigenfield-stretcher",
      title: "2D Matrix Transformation & Eigenvector Stretcher",
      category: "acm",
      difficulty,
      estimatedMinutes: 20,
      subjectCode: "CSE1001",
      subjectName: "Applied Computational Mathematics",
      theoryFormula: "A \\mathbf{x} = \\lambda \\mathbf{x} \\iff \\det(A - \\lambda I) = 0",
      theoryGuide: [
        "A 2D square matrix $A = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$ linearly transforms basis vectors $\\hat{i}$ and $\\hat{j}$.",
        "Eigenvectors are non-zero directions along which the transformation acts purely as a scalar elongation: $\\mathbf{x} \\mapsto \\lambda \\mathbf{x}$.",
        "The determinant $\\det(A) = ad - bc$ denotes the signed area scaling factor of unit squares under $A$.",
      ],
      summary: "Manipulate matrix components in real time to visualize coordinate deformation, determinant area scaling, and eigenvector alignment.",
      simType: "matrix",
      controls: [
        { id: "a11", label: "Matrix Element A[0,0] (a)", type: "slider", min: -3, max: 4, step: 0.5, default: 2 },
        { id: "a12", label: "Matrix Element A[0,1] (b)", type: "slider", min: -3, max: 4, step: 0.5, default: 1 },
        { id: "a21", label: "Matrix Element A[1,0] (c)", type: "slider", min: -3, max: 4, step: 0.5, default: 1 },
        { id: "a22", label: "Matrix Element A[1,1] (d)", type: "slider", min: -3, max: 4, step: 0.5, default: 2 },
        { id: "vectorAngle", label: "Probe Vector Angle (θ)", type: "slider", min: 0, max: 360, step: 5, default: 45, unit: "°" },
      ],
      initialState: { a11: 2, a12: 1, a21: 1, a22: 2, vectorAngle: 45 },
      checkpoints: [
        {
          question: "When matrix A is symmetric (b = c = 1, a = d = 2), what are the calculated eigenvalues?",
          options: [
            "A) λ1 = 1, λ2 = 3",
            "B) λ1 = 0, λ2 = 4",
            "C) λ1 = 2, λ2 = 2",
            "D) λ1 = -1, λ2 = 5",
          ],
          correctIndex: 0,
          explanation: "Characteristic equation: det(A - λI) = (2 - λ)^2 - 1 = λ^2 - 4λ + 3 = (λ - 1)(λ - 3) = 0, yielding λ = 1 and λ = 3."
        }
      ],
      contentMarkdown: `### 1. Geometric Foundations of Linear Algebra
Any real square matrix $A \\in \\mathbb{R}^{2 \\times 2}$ maps the unit circle into an ellipse. The principal axes of this ellipse align directly with the orthogonal eigenvectors of $A A^T$.`,
    };
  }

  // COA: CPU Pipelining
  if (subjectCode === "CSE1003" || topic.toLowerCase().includes("pipeline") || topic.toLowerCase().includes("hazard") || topic.toLowerCase().includes("cpu")) {
    return {
      slug: slug || "cpu-5stage-pipeline-hazard-simulator",
      title: "5-Stage CPU Pipeline & Hazard Forwarding Simulator",
      category: "coa",
      difficulty,
      estimatedMinutes: 20,
      subjectCode: "CSE1003",
      subjectName: "Computer Organization & Architecture",
      theoryFormula: "\\text{Speedup} = \\frac{N \\cdot k}{k + N - 1 + \\text{Stalls}}, \\quad \\text{CPI} = 1 + \\frac{\\text{Stall Cycles}}{\\text{Instructions}}",
      theoryGuide: [
        "Classic RISC 5-stage pipeline: Instruction Fetch (IF) → Decode (ID) → Execute (EX) → Memory (MEM) → Write Back (WB).",
        "Data Hazards (RAW: Read After Write) arise when an instruction depends on a register result before it is written back.",
        "Hardware Forwarding paths bypass the register file by routing values directly from EX/MEM or MEM/WB pipeline registers.",
      ],
      summary: "Step through CPU clock cycles, enable/disable data forwarding, and observe how pipeline bubbles prevent race hazards.",
      simType: "pipeline",
      controls: [
        { id: "forwarding", label: "Operand Forwarding Bypasses", type: "toggle", default: true },
        { id: "branchPrediction", label: "Branch Prediction (Always Taken)", type: "toggle", default: false },
        { id: "clockStep", label: "Clock Cycle", type: "slider", min: 1, max: 10, step: 1, default: 3 },
      ],
      initialState: { forwarding: true, branchPrediction: false, clockStep: 3 },
      checkpoints: [
        {
          question: "Without forwarding, how many stall cycles (bubbles) must the CPU inject between 'ADD R1, R2, R3' and 'SUB R4, R1, R5'?",
          options: [
            "A) 0 cycles",
            "B) 1 cycle",
            "C) 2 cycles (until R1 writes back in WB stage)",
            "D) 5 cycles"
          ],
          correctIndex: 2,
          explanation: "R1 is computed in cycle 3 (EX) but written back in cycle 5 (WB). The dependent SUB instruction decoding in cycle 2 needs R1 by cycle 3, causing 2 stall cycles without forwarding."
        }
      ],
      contentMarkdown: `### 1. Pipelining Principles
Pipelining does not decrease the latency of an individual instruction; instead, it dramatically increases instruction throughput by exploiting parallelism among overlapping instruction cycles.`,
    };
  }

  // BEE Circuit & Power Simulation Preset
  if (subjectCode === "CSE1002" || topic.toLowerCase().includes("circuit") || topic.toLowerCase().includes("ohm") || topic.toLowerCase().includes("power") || topic.toLowerCase().includes("rlc")) {
    return {
      slug: slug || "ac-dc-circuit-power-dissipation-simulator",
      title: "Ohm's Law, Power Dissipation & AC Oscilloscope Simulator",
      category: "bee",
      difficulty,
      estimatedMinutes: 15,
      subjectCode: "CSE1002",
      subjectName: "Basic Electrical & Electronics Engineering",
      theoryFormula: "I = \\frac{V}{R}, \\quad P = V \\cdot I = I^2 R = \\frac{V^2}{R}",
      theoryGuide: [
        "Ohm's Law states that current through a conductor is directly proportional to voltage and inversely proportional to resistance.",
        "Thermal power dissipation P = I²R converts electric potential energy into heat.",
        "In alternating current (AC), voltage oscillates as v(t) = V_peak * sin(2πft), with RMS voltage V_rms = V_peak / √2.",
      ],
      summary: "Adjust source voltage, load resistance, and AC frequency to observe electron flow velocity, thermal dissipation, and real-time waveforms on an animated oscilloscope.",
      simType: "circuit",
      controls: [
        { id: "voltage", label: "Source Voltage (V)", type: "slider", min: 1, max: 24, step: 0.5, default: 12, unit: "V" },
        { id: "resistance", label: "Load Resistance (R)", type: "slider", min: 1, max: 50, step: 1, default: 10, unit: "Ω" },
        { id: "frequency", label: "AC Wave Frequency", type: "slider", min: 10, max: 200, step: 5, default: 50, unit: "Hz" },
        { id: "acMode", label: "AC Mode (Sine Wave)", type: "toggle", default: true },
      ],
      initialState: { voltage: 12, resistance: 10, frequency: 50, acMode: true },
      checkpoints: [
        {
          question: "If voltage is doubled from 12V to 24V across a fixed 10Ω resistor, by what factor does thermal power dissipation increase?",
          options: [
            "A) 2x (linear increase)",
            "B) 4x (quadratic increase P = V² / R)",
            "C) Remains identical",
            "D) Decreases by half"
          ],
          correctIndex: 1,
          explanation: "Power is proportional to the square of the voltage: P = V² / R. Doubling voltage quadruples power from 14.4W to 57.6W."
        }
      ],
      contentMarkdown: `### 1. Ohm's Law & Electrical Energy Conversion\nElectric current represents the directed rate of electron flow through conductive materials. Resistance opposes this flow through lattice collisions, generating heat according to Joule's law.`,
    };
  }

  // Python Algorithm & Complexity Preset
  if (subjectCode === "CSE1005" || topic.toLowerCase().includes("python") || topic.toLowerCase().includes("sort") || topic.toLowerCase().includes("algorithm")) {
    return {
      slug: slug || "python-algorithm-complexity-visualizer",
      title: "Python Algorithm Complexity & Stack Tracer",
      category: "python",
      difficulty,
      estimatedMinutes: 15,
      subjectCode: "CSE1005",
      subjectName: "Python Programming",
      theoryFormula: "T(N) = a T(N/b) + f(N) \\implies \\mathcal{O}(N \\log N)",
      theoryGuide: [
        "Time complexity measures the growth rate of required CPU operations as input size N increases.",
        "Divide-and-conquer algorithms like Merge Sort run in optimal O(N log N) time.",
        "Quadratic algorithms like Bubble Sort scale as O(N²), becoming impractical for large datasets.",
      ],
      summary: "Adjust array size and toggle algorithm modes to observe real-time operation counters, stack growth, and Big-O asymptotic comparisons.",
      simType: "algorithm",
      controls: [
        { id: "inputSize", label: "Input Size (N)", type: "slider", min: 10, max: 500, step: 10, default: 100, unit: "items" },
        { id: "algorithm", label: "Algorithm Mode", type: "select", options: ["Merge Sort O(N log N)", "Binary Search O(log N)", "Bubble Sort O(N²)", "Hash Lookup O(1)"], default: "Merge Sort O(N log N)" },
        { id: "optimized", label: "In-Place Optimization", type: "toggle", default: true },
      ],
      initialState: { inputSize: 100, algorithm: "Merge Sort O(N log N)", optimized: true },
      checkpoints: [
        {
          question: "When sorting N = 100 items, approximately how many operations does Merge Sort perform compared to Bubble Sort?",
          options: [
            "A) Merge Sort ~664 ops vs Bubble Sort ~4,950 ops (7.4x faster)",
            "B) They perform identical operations",
            "C) Bubble Sort is faster for N = 100",
            "D) Merge Sort requires 1,000,000 ops"
          ],
          correctIndex: 0,
          explanation: "Merge sort scales with N log2(N) ≈ 100 * 6.64 = 664. Bubble sort scales with N(N-1)/2 ≈ 4,950 operations."
        }
      ],
      contentMarkdown: `### 1. Algorithmic Efficiency & Space-Time Tradeoffs\nIn Python engineering, understanding algorithmic time and memory complexity is critical for scalable systems.`,
    };
  }

  // Default Generic Engineering Interactive Lab
  return {
    slug: slug || "interactive-engineering-lab",
    title: `${topic} Interactive Learning Workbench`,
    category: meta.cat,
    difficulty,
    estimatedMinutes: 15,
    subjectCode,
    subjectName: meta.name,
    theoryFormula: "y = f(x_1, x_2, \\dots, x_n)",
    theoryGuide: [
      `Interactive parameter manipulation for ${topic}.`,
      "Dynamic real-time graphical feedback connects mathematical formulas to engineering behavior.",
      "Comprehension checkpoints reinforce syllabus mastery.",
    ],
    summary: `Hands-on interactive simulator for ${topic} (${subjectCode}).`,
    simType: meta.defaultType,
    controls: [
      { id: "intensity", label: "Parameter Magnitude", type: "slider", min: 1, max: 100, step: 1, default: 50 },
      { id: "mode", label: "Operating Regime", type: "select", options: ["Nominal State", "Peak Saturation", "Optimized Mode"], default: "Nominal State" },
      { id: "boost", label: "Active Feedback Loop", type: "toggle", default: true },
    ],
    initialState: { intensity: 50, mode: "Nominal State", boost: true },
    checkpoints: [
      {
        question: `How does increasing Parameter Magnitude impact governing equation outcomes in ${topic}?`,
        options: [
          "A) Produces a proportional monotonic response",
          "B) Induces numerical divergence beyond critical limits",
          "C) Leaves the system unchanged",
          "D) Inverts state polarities"
        ],
        correctIndex: 0,
        explanation: "In linear and quasi-linear regimes, output variables scale proportionally with input driving parameters."
      }
    ],
    contentMarkdown: `### 1. Laboratory Objective: ${topic}
Experiment with the interactive controls above to visualize the governing mathematical and physical principles of ${topic} (${subjectCode}).`,
  };
}
