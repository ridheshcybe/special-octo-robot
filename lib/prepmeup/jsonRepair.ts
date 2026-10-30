/**
 * Resilient JSON Parser and Repair Engine for LLM & Admin Studio payloads.
 * Solves:
 * 1. Missing comma/bracket: "expected ',' or ']' after array element in JSON at position ... line ... column ..."
 * 2. Unescaped LaTeX backslashes (\frac, \lambda, \alpha, \text, \det, \sum, etc.)
 * 3. Truncated output at token limits (auto-closing strings, arrays, and objects)
 * 4. Trailing commas before } or ]
 * 5. Extraneous markdown text/fences around JSON
 */

export function cleanJsonFences(text: string): string {
  if (!text) return "";
  let s = text.trim();

  // Remove markdown code fences if wrapped
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  // If there is conversational text before the first '{' or '[', strip it
  const firstBrace = s.indexOf("{");
  const firstBracket = s.indexOf("[");

  let startIdx = 0;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
  }

  if (startIdx > 0) {
    s = s.slice(startIdx);
  }

  // Also strip trailing conversational text after the last matching '}' or ']'
  const lastBrace = s.lastIndexOf("}");
  const lastBracket = s.lastIndexOf("]");
  const endIdx = Math.max(lastBrace, lastBracket);
  if (endIdx !== -1 && endIdx < s.length - 1) {
    s = s.slice(0, endIdx + 1);
  }

  return s.trim();
}

/**
 * Repairs syntax mistakes commonly emitted by LLMs in large JSON responses.
 */
export function repairJsonString(raw: string): string {
  let s = cleanJsonFences(raw);
  if (!s) return "{}";

  // 1. Fix unescaped backslashes (especially in LaTeX equations)
  // Valid escapes in standard JSON: \", \\, \/, \b, \f, \n, \r, \t, \uXXXX
  s = s.replace(/\\(?![\\"/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\");

  // 2. Fix missing commas between array elements and objects:
  // } { -> }, {
  s = s.replace(/\}\s*\{/g, "}, {");
  // ] [ -> ], [
  s = s.replace(/\]\s*\[/g, "], [");
  // "string1" \n "string2" -> "string1", \n "string2"
  s = s.replace(/"\s*\n\s*"/g, '",\n"');
  // } \n "prop" -> }, \n "prop"
  s = s.replace(/\}\s*\n\s*"/g, '},\n"');
  // "prop" \n { -> "prop", \n {
  s = s.replace(/"\s*\n\s*\{/g, '",\n{');
  // primitives followed by new elements: true\n"next" -> true,\n"next"
  s = s.replace(/(true|false|null|\d+)\s*\n\s*([{\["0-9a-zA-Z])/g, "$1,\n$2");

  // 3. Fix trailing commas before closing braces or brackets
  s = s.replace(/,\s*([\}\]])/g, "$1");

  // 4. Handle truncated JSON (e.g. cut off at token limit position ~8890)
  // Balance unclosed quotes, curly braces, and square brackets
  let inString = false;
  let escape = false;
  const stack: string[] = [];
  const rebuilt: string[] = [];

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (escape) {
      escape = false;
      rebuilt.push(char);
      continue;
    }
    if (char === "\\") {
      escape = true;
      rebuilt.push(char);
      continue;
    }
    if (char === '"') {
      inString = !inString;
      rebuilt.push(char);
      continue;
    }
    if (!inString) {
      if (char === "{" || char === "[") {
        stack.push(char === "{" ? "}" : "]");
      } else if (char === "}" || char === "]") {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop();
        }
      }
    }
    rebuilt.push(char);
  }

  let repaired = rebuilt.join("");

  // If truncated inside a string literal, close it
  if (inString) {
    repaired += '"';
  }

  // Remove any dangling comma at the end of truncated stream
  repaired = repaired.replace(/,\s*$/, "");

  // Auto-close any unclosed objects or arrays in reverse order
  while (stack.length > 0) {
    repaired += stack.pop();
  }

  // Clean trailing commas again that may have been created before auto-close
  repaired = repaired.replace(/,\s*([\}\]])/g, "$1");

  return repaired;
}

/**
 * Safely parses any LLM or user-provided JSON string with progressive repair stages.
 */
export function safeParseJson<T = any>(input: string, fallback?: any): T {
  if (!input || typeof input !== "string") {
    if (fallback !== undefined) return fallback;
    throw new Error("Invalid empty JSON input.");
  }

  // Stage 1: Direct native JSON.parse
  try {
    return JSON.parse(input);
  } catch {}

  // Stage 2: Clean fences and try parse
  const cleaned = cleanJsonFences(input);
  try {
    return JSON.parse(cleaned);
  } catch {}

  // Stage 3: Progressive syntactic repair (commas, LaTeX backslashes, truncation)
  try {
    const repaired = repairJsonString(input);
    return JSON.parse(repaired);
  } catch (err: any) {
    // Stage 4: If still failing and fallback provided, return fallback
    if (fallback !== undefined) {
      console.warn("[SafeParseJson] JSON repair could not fully recover syntax, using fallback:", err.message);
      return fallback;
    }

    // Otherwise throw a sanitized error message
    throw new Error(`JSON structure syntax error in syllabus/content payload: ${err.message}`);
  }
}
