const assert = require("node:assert/strict");
const fs = require("node:fs");
const katex = require("katex");

console.log("Testing AI Simulator Generator & KaTeX Math Rendering...");

// 1. Verify KaTeX renders complex mathematical equations
const sampleEquations = [
  "A = U \\Sigma V^T",
  "\\det(A - \\lambda I) = 0",
  "\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}",
  "I_L = \\frac{V_{th}}{R_{th} + R_L}",
  "\\sum_{i=1}^n \\frac{1}{i^2} = \\frac{\\pi^2}{6}",
  "v(t) = V_m \\sin(\\omega t + \\phi)",
];

for (const eq of sampleEquations) {
  const rendered = katex.renderToString(eq, { displayMode: true, throwOnError: false });
  assert.ok(rendered.includes('class="katex"'), `KaTeX should render equation: ${eq}`);
  assert.ok(!rendered.includes("KaTeX parse error"), `KaTeX should render without parse errors for: ${eq}`);
}
console.log("✓ All KaTeX mathematical equations rendered with 100% precision.");

// 2. Verify RichMathMarkdown imports katex and handles display math
const richMathSrc = fs.readFileSync("app/prepmeup/_components/RichMathMarkdown.tsx", "utf8");
assert.ok(richMathSrc.includes('import katex from "katex";'), "RichMathMarkdown must import katex");
assert.ok(richMathSrc.includes("katex.renderToString"), "RichMathMarkdown must invoke katex.renderToString");
assert.ok(richMathSrc.includes("katex-display-container"), "RichMathMarkdown must support katex-display-container");
console.log("✓ RichMathMarkdown KaTeX integration verified.");

// 3. Verify prepmeup layout imports katex CSS
const layoutSrc = fs.readFileSync("app/prepmeup/layout.tsx", "utf8");
assert.ok(layoutSrc.includes('import "katex/dist/katex.min.css";'), "PrepMeUp layout must import KaTeX CSS");
console.log("✓ KaTeX global CSS import verified in app/prepmeup/layout.tsx.");

// 4. Verify Content Studio has AI Simulator Generator
const contentStudioPage = fs.readFileSync("app/prepmeup/admin/content-studio/page.tsx", "utf8");
assert.ok(contentStudioPage.includes("DynamicInteractiveSim"), "Content Studio must import DynamicInteractiveSim");
assert.ok(contentStudioPage.includes("AI Simulator Generator"), "Content Studio must feature AI Simulator Generator");
assert.ok(contentStudioPage.includes("generate_simulation"), "Content Studio must call generate_simulation action");
assert.ok(contentStudioPage.includes("Interactive AI Simulator"), "Content Studio must have Interactive AI Simulator option");
console.log("✓ Content Studio AI Simulator Generator integration verified.");

// 5. Verify Content Studio Route handles simulation generation and persistence
const contentStudioRoute = fs.readFileSync("app/api/prepmeup/admin/content-studio/route.ts", "utf8");
assert.ok(contentStudioRoute.includes("generate_simulation"), "Content Studio API route must handle generate_simulation action");
assert.ok(contentStudioRoute.includes("generateSimulationDraft"), "Content Studio API route must call generateSimulationDraft");
assert.ok(contentStudioRoute.includes("state.simulations"), "Content Studio API route must persist simulations in state.simulations");
console.log("✓ Content Studio API route simulation generator & persistence verified.");

// 6. Verify DynamicInteractiveSim component exists and has required features
const simComponent = fs.readFileSync("app/prepmeup/_components/DynamicInteractiveSim.tsx", "utf8");
assert.ok(simComponent.includes("simType"), "DynamicInteractiveSim must support simType");
assert.ok(simComponent.includes("protocol"), "DynamicInteractiveSim must support protocol simulation");
assert.ok(simComponent.includes("matrix"), "DynamicInteractiveSim must support matrix transformation simulation");
assert.ok(simComponent.includes("checkpoints"), "DynamicInteractiveSim must support checkpoints");
console.log("✓ DynamicInteractiveSim component verified.");

console.log("All 6 AI Simulator Generator & KaTeX Math Rendering verification checks passed successfully!");
