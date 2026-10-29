"use client";

import React, { useState } from "react";
import katex from "katex";

/**
 * Extracts balanced curly braces { ... } from a string starting at startIndex.
 * Supports arbitrary depth of nested braces.
 */
function extractBalancedBraces(
  str: string,
  startIndex: number
): { content: string; endIndex: number } | null {
  if (startIndex >= str.length || str[startIndex] !== "{") return null;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === "\\" && i + 1 < str.length) {
      i++; // skip escaped character
      continue;
    }
    if (str[i] === "{") depth++;
    else if (str[i] === "}") {
      depth--;
      if (depth === 0) {
        return { content: str.slice(startIndex + 1, i), endIndex: i };
      }
    }
  }
  return null;
}

/**
 * Replaces a LaTeX 1-argument command like \cmd{arg} using balanced braces.
 */
function replaceOneArgCommand(
  str: string,
  cmdName: string,
  transform: (arg: string) => string
): string {
  let result = "";
  let i = 0;
  const target = "\\" + cmdName;
  while (i < str.length) {
    if (str.startsWith(target, i)) {
      let cursor = i + target.length;
      while (cursor < str.length && /\s/.test(str[cursor])) cursor++;
      const match = extractBalancedBraces(str, cursor);
      if (match) {
        result += transform(match.content);
        i = match.endIndex + 1;
        continue;
      }
    }
    result += str[i];
    i++;
  }
  return result;
}

/**
 * Replaces a LaTeX 2-argument command like \cmd{arg1}{arg2} using balanced braces.
 */
function replaceTwoArgCommand(
  str: string,
  cmdName: string,
  transform: (arg1: string, arg2: string) => string
): string {
  let result = "";
  let i = 0;
  const target = "\\" + cmdName;
  while (i < str.length) {
    if (str.startsWith(target, i)) {
      let cursor = i + target.length;
      while (cursor < str.length && /\s/.test(str[cursor])) cursor++;
      const match1 = extractBalancedBraces(str, cursor);
      if (match1) {
        let cursor2 = match1.endIndex + 1;
        while (cursor2 < str.length && /\s/.test(str[cursor2])) cursor2++;
        const match2 = extractBalancedBraces(str, cursor2);
        if (match2) {
          result += transform(match1.content, match2.content);
          i = match2.endIndex + 1;
          continue;
        }
      }
    }
    result += str[i];
    i++;
  }
  return result;
}

/**
 * Converts a LaTeX math string into clean, readable HTML mathematical notation
 * with stacked fraction bars, superscripts, subscripts, matrices, Greek letters,
 * radical signs, and mathematical operators.
 */
export function renderLatexToHtml(latexRaw: string, isDisplay: boolean = false): string {
  if (!latexRaw) return "";
  let clean = latexRaw.trim();
  if (clean.startsWith("$$") && clean.endsWith("$$")) {
    clean = clean.slice(2, -2).trim();
  } else if (clean.startsWith("\\[") && clean.endsWith("\\]")) {
    clean = clean.slice(2, -2).trim();
  } else if (clean.startsWith("\\(") && clean.endsWith("\\)")) {
    clean = clean.slice(2, -2).trim();
  } else if (clean.startsWith("$") && clean.endsWith("$") && clean.length > 2) {
    clean = clean.slice(1, -1).trim();
  }

  // 1. Try KaTeX standard rendering first
  try {
    const rendered = katex.renderToString(clean, {
      displayMode: isDisplay,
      throwOnError: false,
      strict: false,
    });
    if (isDisplay) {
      return `<div class="katex-display-container">${rendered}</div>`;
    }
    return `<span class="katex-inline-container">${rendered}</span>`;
  } catch {
    // Fall back to custom regex parsing below
  }

  // 2. Initial sanitization of raw input text (only raw < and > are escaped)
  let s = clean;
  s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // 2. Parse math internal tokens without re-escaping HTML tags
  function parseMathTokens(raw: string): string {
    let text = raw;

    // Matrices: \begin{bmatrix} ... \end{bmatrix} or \begin{pmatrix} ... \end{pmatrix}
    text = text.replace(/\\begin\{([bpv]?matrix)\}([\s\S]*?)\\end\{\1\}/g, (_match, type, body) => {
      const rows = body
        .trim()
        .split(/\\\\/)
        .map((r: string) => r.trim())
        .filter(Boolean);
      const leftDelim = type === "pmatrix" ? "(" : type === "vmatrix" ? "|" : "[";
      const rightDelim = type === "pmatrix" ? ")" : type === "vmatrix" ? "|" : "]";
      const cellsHtml = rows
        .map(
          (row: string) =>
            `<tr>${row
              .split("&amp;")
              .map(
                (cell: string) =>
                  `<td style="padding:4px 9px;text-align:center;font-family:'Cambria Math','Times New Roman',serif;">${parseMathTokens(
                    cell
                  )}</td>`
              )
              .join("")}</tr>`
        )
        .join("");
      return `<span style="display:inline-flex;align-items:center;vertical-align:middle;margin:2px 6px;"><span style="font-size:1.6em;font-weight:300;color:#ff6a3d;">${leftDelim}</span><table style="border-collapse:collapse;display:inline-table;"><tbody>${cellsHtml}</tbody></table><span style="font-size:1.6em;font-weight:300;color:#ff6a3d;">${rightDelim}</span></span>`;
    });

    // Aligned equations: \begin{aligned} ... \end{aligned} or \begin{align*} ... \end{align*}
    text = text.replace(/\\begin\{(aligned|align\*?)\}([\s\S]*?)\\end\{\1\}/g, (_match, _type, body) => {
      const rows = body
        .trim()
        .split(/\\\\/)
        .map((r: string) => r.trim())
        .filter(Boolean);
      const rowsHtml = rows
        .map((row: string) => {
          const parts = row.split("&amp;");
          if (parts.length > 1) {
            return `<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin:3px 0;">
              <div style="text-align:right;flex:1;">${parseMathTokens(parts[0])}</div>
              <div style="text-align:left;flex:1;">${parseMathTokens(parts.slice(1).join(" "))}</div>
            </div>`;
          }
          return `<div style="text-align:center;margin:3px 0;">${parseMathTokens(row)}</div>`;
        })
        .join("");
      return `<div style="display:flex;flex-direction:column;width:100%;margin:4px 0;">${rowsHtml}</div>`;
    });

    // Cases: \begin{cases} ... \end{cases}
    text = text.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (_match, body) => {
      const rows = body
        .trim()
        .split(/\\\\/)
        .map((r: string) => r.trim())
        .filter(Boolean);
      const rowsHtml = rows
        .map((row: string) => {
          const parts = row.split("&amp;");
          return `<div style="display:flex;align-items:center;gap:12px;margin:2px 0;">
            <span>${parseMathTokens(parts[0])}</span>
            ${parts[1] ? `<span style="color:#a19f95;">${parseMathTokens(parts[1])}</span>` : ""}
          </div>`;
        })
        .join("");
      return `<span style="display:inline-flex;align-items:center;vertical-align:middle;margin:2px 6px;"><span style="font-size:2.2em;font-weight:100;color:#ff6a3d;line-height:0.8;margin-right:4px;">{</span><span style="display:inline-flex;flex-direction:column;text-align:left;">${rowsHtml}</span></span>`;
    });

    // Multiline line breaks in display math: \\
    text = text.replace(/\\\\/g, "<br/>");

    // Nested Fractions: \frac{num}{den} with recursive balanced brace parsing
    text = replaceTwoArgCommand(text, "frac", (num, den) => {
      const numHtml = parseMathTokens(num);
      const denHtml = parseMathTokens(den);
      return `<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 4px;line-height:1.15;text-align:center;"><span style="border-bottom:1.5px solid #f3f1ea;padding:0 5px 2px;font-size:0.92em;display:block;width:100%;text-align:center;">${numHtml}</span><span style="padding:2px 5px 0;font-size:0.92em;display:block;width:100%;text-align:center;">${denHtml}</span></span>`;
    });

    // Square roots: \sqrt{...}
    text = replaceOneArgCommand(text, "sqrt", (inner) => {
      const innerHtml = parseMathTokens(inner);
      return `<span style="display:inline-flex;align-items:center;vertical-align:middle;">√<span style="border-top:1.5px solid #f3f1ea;padding:0 3px;">${innerHtml}</span></span>`;
    });

    // Vector / Overline / Hat accents
    text = replaceOneArgCommand(text, "vec", (content) => `<span style="text-decoration:overline;font-style:italic;">${content}</span>`);
    text = replaceOneArgCommand(text, "overline", (content) => `<span style="text-decoration:overline;">${content}</span>`);
    text = replaceOneArgCommand(text, "bar", (content) => `<span style="text-decoration:overline;">${content}</span>`);
    text = replaceOneArgCommand(text, "hat", (content) => `<span style="position:relative;display:inline-block;">${content}<span style="position:absolute;top:-0.5em;left:0;right:0;text-align:center;font-size:0.8em;">^</span></span>`);
    text = replaceOneArgCommand(text, "xrightarrow", (label) => {
      const labelHtml = parseMathTokens(label);
      return `<span style="display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 6px;"><span style="font-size:0.75em;border-bottom:1px solid #ff6a3d;padding:0 4px;color:#ffd8cc;">${labelHtml}</span><span style="font-size:1.1em;line-height:0.8;">⟶</span></span>`;
    });

    // Text & formatting commands
    text = replaceOneArgCommand(text, "text", (content) => `<span style="font-family:var(--font-onest),sans-serif;font-style:normal;color:#e5e3dc;">${content}</span>`);
    text = replaceOneArgCommand(text, "mathrm", (content) => `<span style="font-style:normal;">${content}</span>`);
    text = replaceOneArgCommand(text, "textbf", (content) => `<strong>${content}</strong>`);
    text = replaceOneArgCommand(text, "mathbf", (content) => `<strong style="font-weight:700;color:#f3f1ea;">${content}</strong>`);
    text = replaceOneArgCommand(text, "boldsymbol", (content) => `<strong style="font-weight:700;color:#ff6a3d;">${content}</strong>`);
    text = replaceOneArgCommand(text, "operatorname", (content) => `<span style="font-style:normal;font-weight:600;">${content}</span>`);
    text = replaceOneArgCommand(text, "underline", (content) => `<span style="text-decoration:underline;">${content}</span>`);

    // Norms: \| ... \|
    text = text.replace(/\\\|/g, "‖");

    // Greek letters, mathematical operators, and delimiters
    const symbols: Record<string, string> = {
      // Delimiters & Percentages
      "\\%": "%",
      "\\mid": "|",
      "\\blacksquare": "■",
      "\\qed": "■",
      "\\lceil": "⌈",
      "\\rceil": "⌉",
      "\\lfloor": "⌊",
      "\\rfloor": "⌋",
      "\\left\\{": "{",
      "\\right\\}": "}",
      "\\left(": "(",
      "\\right)": ")",
      "\\left[": "[",
      "\\right]": "]",
      "\\left|": "|",
      "\\right|": "|",
      "\\left.": "",
      "\\right.": "",
      "\\langle": "⟨",
      "\\rangle": "⟩",

      // Math Sets
      "\\mathbb{R}": "ℝ",
      "\\mathbb{C}": "ℂ",
      "\\mathbb{N}": "ℕ",
      "\\mathbb{Z}": "ℤ",
      "\\mathbb{Q}": "ℚ",
      "\\mathcal{L}": "𝓛",
      "\\mathcal{F}": "ℱ",

      // Greek Upper & Lower
      "\\lambda": "λ",
      "\\Lambda": "Λ",
      "\\omega": "ω",
      "\\Omega": "Ω",
      "\\phi": "ϕ",
      "\\Phi": "Φ",
      "\\varphi": "φ",
      "\\theta": "θ",
      "\\Theta": "Θ",
      "\\alpha": "α",
      "\\beta": "β",
      "\\gamma": "γ",
      "\\Gamma": "Γ",
      "\\delta": "δ",
      "\\Delta": "Δ",
      "\\epsilon": "ϵ",
      "\\varepsilon": "ε",
      "\\mu": "μ",
      "\\sigma": "σ",
      "\\Sigma": "Σ",
      "\\pi": "π",
      "\\Pi": "Π",
      "\\rho": "ρ",
      "\\tau": "τ",
      "\\eta": "η",
      "\\zeta": "ζ",
      "\\xi": "ξ",
      "\\psi": "ψ",
      "\\Psi": "Ψ",

      // Operators & Calculus
      "\\nabla": "∇",
      "\\partial": "∂",
      "\\infty": "∞",
      "\\sum": "∑",
      "\\prod": "∏",
      "\\int": "∫",
      "\\iint": "∬",
      "\\iiint": "∭",
      "\\oint": "∮",

      // Logic & Arrows
      "\\implies": "⟹",
      "\\Rightarrow": "⇒",
      "\\iff": "⟺",
      "\\Leftrightarrow": "⇔",
      "\\to": "→",
      "\\rightarrow": "→",
      "\\leftarrow": "←",
      "\\leftrightarrow": "↔",

      // Relations & Binary Ops
      "\\neq": "≠",
      "\\ne": "≠",
      "\\leq": "≤",
      "\\le": "≤",
      "\\geq": "≥",
      "\\ge": "≥",
      "\\approx": "≈",
      "\\cong": "≅",
      "\\equiv": "≡",
      "\\sim": "∼",
      "\\propto": "∝",
      "\\pm": "±",
      "\\mp": "∓",
      "\\times": "×",
      "\\cdot": "⋅",
      "\\bullet": "•",
      "\\circ": "°",
      "\\degree": "°",
      "\\div": "÷",
      "\\oplus": "⊕",
      "\\otimes": "⊗",
      "\\odot": "⊙",
      "\\perp": "⟂",
      "\\parallel": "∥",
      "\\angle": "∠",
      "\\hbar": "ℏ",
      "\\in": "∈",
      "\\notin": "∉",
      "\\subset": "⊂",
      "\\subseteq": "⊆",
      "\\cup": "∪",
      "\\cap": "∩",
      "\\forall": "∀",
      "\\exists": "∃",
      "\\dots": "…",
      "\\cdots": "⋯",
      "\\ldots": "…",

      // Functions
      "\\det": '<span style="font-style:normal;font-weight:700;color:#ff6a3d;">det</span>',
      "\\dim": '<span style="font-style:normal;font-weight:600;">dim</span>',
      "\\rank": '<span style="font-style:normal;font-weight:600;">rank</span>',
      "\\nullity": '<span style="font-style:normal;font-weight:600;">nullity</span>',
      "\\sin": '<span style="font-style:normal;">sin</span>',
      "\\cos": '<span style="font-style:normal;">cos</span>',
      "\\tan": '<span style="font-style:normal;">tan</span>',
      "\\csc": '<span style="font-style:normal;">csc</span>',
      "\\sec": '<span style="font-style:normal;">sec</span>',
      "\\cot": '<span style="font-style:normal;">cot</span>',
      "\\sinh": '<span style="font-style:normal;">sinh</span>',
      "\\cosh": '<span style="font-style:normal;">cosh</span>',
      "\\tanh": '<span style="font-style:normal;">tanh</span>',
      "\\arcsin": '<span style="font-style:normal;">arcsin</span>',
      "\\arccos": '<span style="font-style:normal;">arccos</span>',
      "\\arctan": '<span style="font-style:normal;">arctan</span>',
      "\\exp": '<span style="font-style:normal;">exp</span>',
      "\\log": '<span style="font-style:normal;">log</span>',
      "\\ln": '<span style="font-style:normal;">ln</span>',
      "\\lim": '<span style="font-style:normal;">lim</span>',
      "\\max": '<span style="font-style:normal;">max</span>',
      "\\min": '<span style="font-style:normal;">min</span>',
      "\\pmod": " mod ",
      "\\mod": " mod ",

      // Spacing
      "\\qquad": "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
      "\\quad": "&nbsp;&nbsp;&nbsp;&nbsp;",
      "\\;": "&nbsp;",
      "\\,": "&thinsp;",
      "\\!": "",
    };

    const sortedKeys = Object.keys(symbols).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      text = text.split(key).join(symbols[key]);
    }

    // Superscripts and Subscripts with balanced braces: ^{...} and _{...}
    let supIdx = text.indexOf("^{");
    while (supIdx !== -1) {
      const match = extractBalancedBraces(text, supIdx + 1);
      if (match) {
        const innerHtml = parseMathTokens(match.content);
        text = text.slice(0, supIdx) + `<sup style="font-size:0.75em;line-height:0;">${innerHtml}</sup>` + text.slice(match.endIndex + 1);
        supIdx = text.indexOf("^{");
      } else {
        break;
      }
    }

    let subIdx = text.indexOf("_{");
    while (subIdx !== -1) {
      const match = extractBalancedBraces(text, subIdx + 1);
      if (match) {
        const innerHtml = parseMathTokens(match.content);
        text = text.slice(0, subIdx) + `<sub style="font-size:0.75em;line-height:0;">${innerHtml}</sub>` + text.slice(match.endIndex + 1);
        subIdx = text.indexOf("_{");
      } else {
        break;
      }
    }

    // Single-character superscripts and subscripts: ^x, _x
    text = text.replace(/\^([a-zA-Z0-9+\-*=])/g, '<sup style="font-size:0.75em;line-height:0;">$1</sup>');
    text = text.replace(/_([a-zA-Z0-9+\-*=])/g, '<sub style="font-size:0.75em;line-height:0;">$1</sub>');

    // Clean remaining stray LaTeX backslash escapes and braces
    text = text.replace(/\\\{/g, "{").replace(/\\\}/g, "}");
    text = text.replace(/\\([a-zA-Z]+)/g, "$1");
    text = text.replace(/\\([ \t])/g, "&nbsp;");
    text = text.replace(/\\([0-9%])/g, "$1");

    return text;
  }

  const parsedHtml = parseMathTokens(s);

  if (isDisplay) {
    return `<div style="margin:14px 0;padding:14px 18px;border-radius:8px;background:#111114;border:1px solid rgba(255,59,29,0.28);border-left:3px solid #ff3b1d;overflow-x:auto;text-align:center;font-family:'Cambria Math','STIX Two Math','Times New Roman',serif;font-size:1.12rem;color:#f3f1ea;letter-spacing:0.02em;">${parsedHtml}</div>`;
  }

  return `<span style="font-family:'Cambria Math','STIX Two Math','Times New Roman',serif;font-size:1.05em;color:#ffd8cc;background:rgba(255,59,29,0.08);padding:1px 5px;border-radius:4px;border:1px solid rgba(255,59,29,0.18);display:inline-block;vertical-align:baseline;">${parsedHtml}</span>`;
}

/**
 * Formats inline text containing $...$ math, **bold**, *italic*, and `code`.
 */
function formatInlineMarkdownAndMath(line: string): string {
  // 1. Extract inline code `...` first so we don't parse math inside code
  const codeTokens: string[] = [];
  let processed = line.replace(/`([^`]+)`/g, (_m, code) => {
    const idx = codeTokens.length;
    const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    codeTokens.push(
      `<code style="font-family:monospace;font-size:0.88em;background:#17171b;color:#ff6a3d;padding:2px 6px;border-radius:4px;border:1px solid #26262c;">${escaped}</code>`
    );
    return `@@CODE_${idx}@@`;
  });

  // 2. Extract inline math $$...$$ or \[...\] or \(...\) or $...$
  const mathTokens: string[] = [];
  processed = processed.replace(/\$\$([\s\S]+?)\$\$/g, (_m, expr) => {
    const idx = mathTokens.length;
    mathTokens.push(renderLatexToHtml(expr, true));
    return `@@MATH_${idx}@@`;
  });
  processed = processed.replace(/\\\[([\s\S]+?)\\\]/g, (_m, expr) => {
    const idx = mathTokens.length;
    mathTokens.push(renderLatexToHtml(expr, true));
    return `@@MATH_${idx}@@`;
  });
  processed = processed.replace(/\\\(([\s\S]+?)\\\)/g, (_m, expr) => {
    const idx = mathTokens.length;
    mathTokens.push(renderLatexToHtml(expr, false));
    return `@@MATH_${idx}@@`;
  });
  processed = processed.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (_m, expr) => {
    const idx = mathTokens.length;
    mathTokens.push(renderLatexToHtml(expr, false));
    return `@@MATH_${idx}@@`;
  });

  // 3. Escape remaining HTML
  processed = processed.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // 4. Bold & Italic
  processed = processed.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#f3f1ea;font-weight:700;">$1</strong>');
  processed = processed.replace(/\*([^*]+)\*/g, '<em style="color:#d6d3cb;">$1</em>');

  // 5. Restore math and code tokens
  processed = processed.replace(/@@MATH_(\d+)@@/g, (_m, i) => mathTokens[Number(i)] || "");
  processed = processed.replace(/@@CODE_(\d+)@@/g, (_m, i) => codeTokens[Number(i)] || "");

  return processed;
}

interface RichMathMarkdownProps {
  content: string;
  className?: string;
}

export function RichMathMarkdown({ content, className }: RichMathMarkdownProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  if (!content) return null;

  const normalized = content.replace(/\\`/g, "`").replace(/\r\n/g, "\n");

  // Split content into high-level blocks: fenced code blocks ```...```, display math blocks $$...$$, and text blocks
  const blocks: Array<
    | { type: "code"; lang: string; code: string }
    | { type: "math"; expr: string }
    | { type: "text"; text: string }
  > = [];

  const regex = /```([a-zA-Z0-9_-]*)[ \t]*\n([\s\S]*?)```|\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({ type: "text", text: normalized.slice(lastIndex, match.index) });
    }
    if (match[2] !== undefined) {
      blocks.push({ type: "code", lang: match[1] || "python", code: match[2].trim() });
    } else if (match[3] !== undefined) {
      blocks.push({ type: "math", expr: match[3].trim() });
    } else if (match[4] !== undefined) {
      blocks.push({ type: "math", expr: match[4].trim() });
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < normalized.length) {
    blocks.push({ type: "text", text: normalized.slice(lastIndex) });
  }

  const renderTextSegment = (text: string, segIdx: number) => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const rawLine = lines[i];
      const trimmed = rawLine.trim();

      if (!trimmed) {
        i++;
        continue;
      }

      // Horizontal Rule
      if (/^---+$/.test(trimmed)) {
        elements.push(
          <hr
            key={`hr-${segIdx}-${i}`}
            style={{ border: "none", borderTop: "1px solid rgba(243,241,234,0.12)", margin: "18px 0" }}
          />
        );
        i++;
        continue;
      }

      // Headings
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h4
            key={`h3-${segIdx}-${i}`}
            className="font-display"
            style={{
              fontSize: "19px",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              color: "#ff6a3d",
              marginTop: "18px",
              marginBottom: "8px",
            }}
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(trimmed.slice(4)) }}
          />
        );
        i++;
        continue;
      }
      if (trimmed.startsWith("## ")) {
        elements.push(
          <h3
            key={`h2-${segIdx}-${i}`}
            className="font-display"
            style={{
              fontSize: "22px",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              color: "#f3f1ea",
              marginTop: "22px",
              marginBottom: "10px",
              borderBottom: "1px solid rgba(243,241,234,0.1)",
              paddingBottom: "6px",
            }}
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(trimmed.slice(3)) }}
          />
        );
        i++;
        continue;
      }
      if (trimmed.startsWith("# ")) {
        elements.push(
          <h2
            key={`h1-${segIdx}-${i}`}
            className="font-display"
            style={{
              fontSize: "26px",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              color: "#f3f1ea",
              marginTop: "20px",
              marginBottom: "12px",
            }}
            dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(trimmed.slice(2)) }}
          />
        );
        i++;
        continue;
      }

      // Markdown Table
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        const tableLines: string[] = [];
        while (i < lines.length && lines[i].trim().startsWith("|")) {
          tableLines.push(lines[i].trim());
          i++;
        }
        const rows = tableLines
          .filter((l) => !/^\|[\s:|-]+\|$/.test(l))
          .map((l) =>
            l
              .slice(1, -1)
              .split("|")
              .map((c) => c.trim())
          );

        if (rows.length > 0) {
          const header = rows[0];
          const body = rows.slice(1);
          elements.push(
            <div key={`tbl-${segIdx}-${i}`} style={{ overflowX: "auto", margin: "14px 0" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  border: "1px solid #26262c",
                  fontSize: "13px",
                  backgroundColor: "#0c0c0f",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#17171b", borderBottom: "1px solid #26262c" }}>
                    {header.map((h, hIdx) => (
                      <th
                        key={hIdx}
                        style={{
                          padding: "10px 14px",
                          textAlign: "left",
                          fontWeight: 700,
                          color: "#ff3b1d",
                          textTransform: "uppercase",
                          fontSize: "11px",
                          letterSpacing: "0.05em",
                        }}
                        dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(h) }}
                      />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {body.map((r, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: "1px solid rgba(243,241,234,0.08)" }}>
                      {r.map((c, cIdx) => (
                        <td
                          key={cIdx}
                          style={{ padding: "10px 14px", color: "#d6d3cb", lineHeight: 1.5 }}
                          dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(c) }}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        continue;
      }

      // Bullet or Numbered List
      if (/^([-*•]|\d+\.)\s+/.test(trimmed)) {
        const listItems: string[] = [];
        const isOrdered = /^\d+\.\s+/.test(trimmed);
        while (i < lines.length && /^(\s*)([-*•]|\d+\.)\s+/.test(lines[i])) {
          listItems.push(lines[i].trim().replace(/^([-*•]|\d+\.)\s+/, ""));
          i++;
        }
        const ListTag = isOrdered ? "ol" : "ul";
        elements.push(
          <ListTag
            key={`list-${segIdx}-${i}`}
            style={{
              margin: "10px 0",
              paddingLeft: "22px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              color: "#d6d3cb",
              fontSize: "14px",
              lineHeight: 1.65,
              listStyleType: isOrdered ? "decimal" : "disc",
            }}
          >
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(item) }} />
            ))}
          </ListTag>
        );
        continue;
      }

      // Standard Paragraph
      elements.push(
        <p
          key={`p-${segIdx}-${i}`}
          style={{ margin: "8px 0", fontSize: "14px", lineHeight: 1.7, color: "#d6d3cb" }}
          dangerouslySetInnerHTML={{ __html: formatInlineMarkdownAndMath(trimmed) }}
        />
      );
      i++;
    }

    return elements;
  };

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {blocks.map((b, idx) => {
        if (b.type === "math") {
          return (
            <div
              key={`math-${idx}`}
              dangerouslySetInnerHTML={{ __html: renderLatexToHtml(b.expr, true) }}
            />
          );
        }
        if (b.type === "code") {
          return (
            <div
              key={`code-${idx}`}
              style={{
                margin: "12px 0",
                borderRadius: "8px",
                border: "1px solid #26262c",
                backgroundColor: "#08080a",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 14px",
                  backgroundColor: "#17171b",
                  borderBottom: "1px solid #26262c",
                }}
              >
                <span className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", color: "#ff6a3d" }}>
                  {b.lang || "code"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(b.code);
                    setCopiedIdx(idx);
                    setTimeout(() => setCopiedIdx(null), 1500);
                  }}
                  style={{
                    fontSize: "11px",
                    fontFamily: "monospace",
                    color: copiedIdx === idx ? "#4ade80" : "#a19f95",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {copiedIdx === idx ? "✓ Copied" : "Copy Snippet"}
                </button>
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: "14px 16px",
                  overflowX: "auto",
                  fontFamily: "monospace",
                  fontSize: "12.5px",
                  lineHeight: 1.6,
                  color: "#f3f1ea",
                }}
              >
                <code>{b.code}</code>
              </pre>
            </div>
          );
        }
        return <React.Fragment key={`txt-${idx}`}>{renderTextSegment(b.text, idx)}</React.Fragment>;
      })}
    </div>
  );
}
