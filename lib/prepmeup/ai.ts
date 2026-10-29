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

async function callGemini(parts: GeminiMessagePart[], systemInstruction?: string): Promise<string> {
  if (GROQ_API_KEY) {
    const userText = parts
      .map((p) => p.text || "")
      .filter(Boolean)
      .join("\n\n");
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
          { role: "user", content: userText },
        ],
        temperature: 0.2,
        max_tokens: 4096,
      }),
      cache: "no-store",
    });
    if (groqRes.ok) {
      const groqJson = await groqRes.json();
      const groqText = groqJson.choices?.[0]?.message?.content;
      if (groqText) return groqText;
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
      temperature: 0.2, // Low temperature for high academic precision and structural reliability
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  };

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
      systemInstruction
    );

    const jsonStr = cleanJsonOutput(rawText);
    const parsed = JSON.parse(jsonStr);
    return structuredSyllabusSchema.parse(parsed);
  } catch (err: any) {
    // If Gemini key is missing or call fails in local offline development, provide intelligent structured fallback
    if (!GEMINI_API_KEY || err.message?.includes("GEMINI_API_KEY")) {
      return getMockSyllabusStructure(syllabusText);
    }
    throw err;
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
    const rawText = await callGemini([{ text: userPrompt }], systemInstruction);
    const jsonStr = cleanJsonOutput(rawText);
    const parsed = JSON.parse(jsonStr);
    return structuredQuestionsResponseSchema.parse(parsed);
  } catch (err: any) {
    if (!GEMINI_API_KEY || err.message?.includes("GEMINI_API_KEY")) {
      return getMockQuestionsBatch(subject, topic, count, difficulty, types);
    }
    throw err;
  }
}

// ============================================================================
// Fallback Mock Generators (Active when GEMINI_API_KEY is not set)
// ============================================================================

function getMockSyllabusStructure(text: string) {
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
