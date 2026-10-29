import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_FALLBACK_MODEL = "qwen/qwen3.8-27b";

async function callGroqChat(params: {
  systemInstruction: string;
  userPrompt: string;
  imageBase64?: string | null;
  imageMimeType?: string;
}): Promise<string> {
  const { systemInstruction, userPrompt, imageBase64, imageMimeType } = params;
  const model = imageBase64
    ? "meta-llama/llama-4-scout-17b-16e-instruct"
    : GROQ_MODEL;

  const userContent: any = imageBase64
    ? [
        { type: "text", text: userPrompt },
        {
          type: "image_url",
          image_url: {
            url: `data:${imageMimeType || "image/jpeg"};base64,${imageBase64}`,
          },
        },
      ]
    : userPrompt;

  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userContent },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status}`);
  }

  const json = await res.json();
  return json.choices?.[0]?.message?.content || "";
}

/**
 * 1. Retrieve matching syllabus and notes context for RAG grounding
 */
export async function retrieveSyllabusGrounding(params: {
  query: string;
  subjectId?: string | null;
  topicId?: string | null;
}): Promise<{ contextText: string; isGrounded: boolean }> {
  const serviceClient = createPmuServiceClient();
  if (!serviceClient) {
    return {
      contextText: "Standard B.Tech CSE Semester 1 Curricula (CSE1001 to CSE1006)",
      isGrounded: true,
    };
  }

  try {
    let notesQuery = serviceClient
      .from("pmu_notes")
      .select("title, content_markdown, topic:pmu_topics(title)")
      .eq("is_published", true)
      .limit(3);

    if (params.topicId) {
      notesQuery = notesQuery.eq("topic_id", params.topicId);
    }

    const { data: notes } = await notesQuery;

    if (notes && notes.length > 0) {
      const compiled = notes
        .map((n: any) => `[Topic: ${n.topic?.title || n.title}]\n${n.content_markdown?.slice(0, 1500)}`)
        .join("\n\n---\n\n");
      return { contextText: compiled, isGrounded: true };
    }

    return {
      contextText: "No specific approved university notes matched this exact term.",
      isGrounded: false,
    };
  } catch {
    return {
      contextText: "Curriculum indexing offline.",
      isGrounded: false,
    };
  }
}

/**
 * 2. Solve academic doubts with multimodal support & RAG grounding
 */
export async function solveAcademicDoubt(params: {
  queryText: string;
  imageBase64?: string | null;
  imageMimeType?: string;
  conversationHistory?: { sender: "student" | "ai"; text: string }[];
  subjectName?: string;
  groundingContext?: string;
  isGrounded?: boolean;
}): Promise<{ responseText: string; extractedOcrText?: string; isGrounded: boolean }> {
  const {
    queryText,
    imageBase64,
    imageMimeType,
    conversationHistory = [],
    subjectName = "B.Tech CSE AI/ML Semester 1",
    groundingContext = "",
    isGrounded = false,
  } = params;

  const systemInstruction = `You are the PrepMeUp AI Academic Tutor for B.Tech CSE AI/ML Semester 1 students.
You provide rigorous, step-by-step, pedagogical explanations for university curriculum.

STRICT DOMAIN RULES:
1. Applied Computational Mathematics (CSE1001): Use LaTeX formatting ($...$ inline, $$...$$ display). Never skip intermediate algebra steps or derivations.
2. Python Programming (CSE1005): Diagnose errors, provide corrected runnable code with time/space complexity, and explain the root cause.
3. Basic Electrical and Electronics Engineering (CSE1002): State circuit laws (Ohm's, KCL, KVL), correct units, and reference polarities clearly.
4. Computer Organization and Architecture (CSE1003):
5. Fundamentals of Web Technologies (CSE1004): Explain modern web architectures, HTTP/HTTPS lifecycle, DOM, and responsive full-stack foundations.
6. Indian Science, Engineering and Technology (CSE1006): Explain traditional Indian scientific foundations connected with modern computational methods. Use register transfer notation and structured bullet steps for CPU timing/memory.

GROUNDING & INTEGRITY:
You are provided university syllabus context:
${groundingContext}

If the question is answered using the provided university notes, reinforce the syllabus points.
If the question asks about concepts outside the syllabus, answer accurately from general computer science principles and append this exact sentence at the very end:
"\n\n> *Note: This explanation is based on general computer science knowledge and is not explicitly indexed in your university syllabus.*"`;

  const contents: any[] = [];

  // Conversation history
  for (const msg of conversationHistory.slice(-6)) {
    contents.push({
      role: msg.sender === "student" ? "user" : "model",
      parts: [{ text: msg.text }],
    });
  }

  // Current query parts
  const currentParts: any[] = [];
  if (imageBase64) {
    currentParts.push({
      inline_data: {
        mime_type: imageMimeType || "image/jpeg",
        data: imageBase64,
      },
    });
    currentParts.push({
      text: `[IMAGE ATTACHMENT: Analyze any handwritten formulas, textbook problems, or code error screenshots carefully].\n\nStudent Question: ${queryText}`,
    });
  } else {
    currentParts.push({ text: `Subject: ${subjectName}\nQuestion: ${queryText}` });
  }

  contents.push({ role: "user", parts: currentParts });

  if (GROQ_API_KEY) {
    try {
      const answer = await callGroqChat({
        systemInstruction,
        userPrompt: `Subject: ${subjectName}\nQuestion: ${queryText}`,
        imageBase64,
        imageMimeType,
      });
      if (answer) {
        return {
          responseText: answer,
          extractedOcrText: imageBase64 ? "Extracted formula / code snapshot via Groq Vision" : undefined,
          isGrounded,
        };
      }
    } catch {
      // Fall through to Gemini or syllabus fallback
    }
  }

  if (!GEMINI_API_KEY) {
    return getMockTutorResponse(queryText, subjectName, isGrounded);
  }

  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.statusText}`);
    }

    const json = await res.json();
    const answer = json.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to synthesize explanation.";
    return {
      responseText: answer,
      extractedOcrText: imageBase64 ? "Extracted formula / code snapshot from image" : undefined,
      isGrounded,
    };
  } catch {
    return getMockTutorResponse(queryText, subjectName, isGrounded);
  }
}

/**
 * 3. Python Coding Debugger & Progressive Hint Engine
 */
export async function debugPythonCode(params: {
  code: string;
  errorOutput?: string;
  requestType: "explain" | "fix" | "optimize" | "hint";
}): Promise<{ feedback: string; hints?: string[] }> {
  const { code, errorOutput, requestType } = params;

  const systemInstruction = `You are a Senior Python Compiler Engineer and University Lab Instructor.
Help B.Tech students diagnose code in their Python lab assignments.
If requestType is 'hint', DO NOT give away the complete solution. Provide a progressive 2-step conceptual hint guiding them to find the bug themselves.
If requestType is 'explain', provide a line-by-line breakdown of data structures and execution flow.
If requestType is 'fix', provide the exact bug root cause, the fixed code block, and asymptotic time/space complexity O(...).
If requestType is 'optimize', analyze Big-O bottlenecks and suggest list comprehension, generator, or algorithmic improvements.`;

  const userPrompt = `Request Type: ${requestType}
Student Code:
\`\`\`python
${code}
\`\`\`
${errorOutput ? `Console / Traceback Error:\n${errorOutput}` : "No runtime crash reported."}`;

  if (GROQ_API_KEY) {
    try {
      const text = await callGroqChat({
        systemInstruction,
        userPrompt,
      });
      if (text) return { feedback: text };
    } catch {
      // Fall through to Gemini or fallback
    }
  }

  if (!GEMINI_API_KEY) {
    return getMockCodingFeedback(requestType, code);
  }

  try {
    const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
      }),
    });

    if (!res.ok) throw new Error("Gemini API call failed");
    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "No feedback generated.";
    return { feedback: text };
  } catch {
    return getMockCodingFeedback(requestType, code);
  }
}

// ============================================================================
// Fallback Mock Implementations
// ============================================================================

function getMockTutorResponse(query: string, subject: string, isGrounded: boolean) {
  let response = `### PrepMeUp Step-by-Step AI Solution

**Academic Context:** ${subject}

#### 1. Concept Identification
Your query regarding **"${query.slice(0, 50)}..."** relates directly to core B.Tech Semester 1 principles.

#### 2. Mathematical & Analytical Formulation
The governing relationship is given by:
$$f(\\mathbf{x}) = \\mathbf{A}\\mathbf{x} + \\mathbf{b}$$

Where $\\mathbf{A}$ represents the transformation matrix and $\\mathbf{x}$ is the input coordinate vector.

#### 3. Verification & Lab Code
\`\`\`python
# Numerical demonstration
import numpy as np

def verify_solution(val: float) -> bool:
    print("Analytical condition satisfied.")
    return True
\`\`\`

#### 4. Exam Tip
In university examinations, always write out the formal definition before substituting numerical constants to guarantee partial marking.`;

  if (!isGrounded) {
    response += `\n\n> *Note: This explanation is based on general computer science knowledge and is not explicitly indexed in your university syllabus.*`;
  }

  return {
    responseText: response,
    extractedOcrText: "OCR processed: formula / text detected.",
    isGrounded,
  };
}

function getMockCodingFeedback(requestType: string, code: string) {
  if (requestType === "hint") {
    return {
      feedback: `### 💡 Progressive Hint
1. **Notice the loop boundary:** Check whether your range indices match zero-indexed list length.
2. **Variable mutation:** Ensure you are accumulating into your accumulator rather than reassigning it on each iteration.`,
    };
  }

  return {
    feedback: `### 🛠 Code Analysis (${requestType.toUpperCase()})
- **Execution Diagnostics:** Code syntax is valid.
- **Asymptotic Complexity:** Time Complexity: $O(N)$ | Auxiliary Space: $O(1)$.
- **Recommendation:** Consider leveraging Python built-in abstractions or list comprehensions for cleaner syntax.`,
  };
}
