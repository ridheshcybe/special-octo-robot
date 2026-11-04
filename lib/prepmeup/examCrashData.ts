export interface VivaFlashcard {
  id: string;
  question: string;
  answer: string;
  tag: string;
}

export interface SubjectCrashPack {
  subjectSlug: string;
  subjectCode: string;
  subjectTitle: string;
  crashSummary: string;
  formulaSheetMarkdown: string;
  vivaFlashcards: VivaFlashcard[];
}

export const EXAM_CRASH_PACKS: Record<string, SubjectCrashPack> = {
  "applied-computational-mathematics": {
    subjectSlug: "applied-computational-mathematics",
    subjectCode: "CSE1001",
    subjectTitle: "Applied Computational Mathematics",
    crashSummary:
      "60-Minute Night-Before-Exam Sheet covering Matrix Rank, Cayley-Hamilton, Eigenvalues, Taylor/Maclaurin Series, Jacobians, and Bayes' Theorem.",
    formulaSheetMarkdown: `### 1. Linear Algebra & Eigenvalue Core Equations
- **Rank-Nullity Theorem:** For an $m \\times n$ matrix $A$, $\\text{Rank}(A) + \\text{Nullity}(A) = n$.
- **Linear System $AX = B$ Consistency (Rouché–Capelli):**
  - Consistent iff $\\text{Rank}(A) = \\text{Rank}([A \\mid B]) = r$.
  - Unique solution if $r = n$; infinitely many solutions with $(n - r)$ free variables if $r < n$.
- **Characteristic Equation & Eigenvalues:**
  $$\\det(A - \\lambda I) = 0, \\qquad \\sum_{i=1}^n \\lambda_i = \\text{tr}(A), \\qquad \\prod_{i=1}^n \\lambda_i = \\det(A)$$
- **Cayley-Hamilton Theorem:** Every square matrix $A$ satisfies its own characteristic polynomial $p(A) = 0$. Multiply by $A^{-1}$ to compute $A^{-1}$ in terms of powers of $A$.

### 2. Differential & Multivariable Calculus
- **Maclaurin Series Expansion:**
  $$f(x) = f(0) + xf'(0) + \\frac{x^2}{2!}f''(0) + \\frac{x^3}{3!}f'''(0) + \\cdots$$
- **Euler's Theorem on Homogeneous Functions:** If $u(x,y)$ has degree $n$:
  $$x\\frac{\\partial u}{\\partial x} + y\\frac{\\partial u}{\\partial y} = n u, \\qquad x^2\\frac{\\partial^2 u}{\\partial x^2} + 2xy\\frac{\\partial^2 u}{\\partial x \\partial y} + y^2\\frac{\\partial^2 u}{\\partial y^2} = n(n-1)u$$
- **Jacobian Transformation (Polar $x = r\\cos\\theta, y = r\\sin\\theta$):**
  $$J = \\frac{\\partial(x,y)}{\\partial(r,\\theta)} = \\begin{vmatrix} \\cos\\theta & -r\\sin\\theta \\\\ \\sin\\theta & r\\cos\\theta \\end{vmatrix} = r \\implies dx\\,dy = r\\,dr\\,d\\theta$$

### 3. Probability & Statistical Distributions
- **Bayes' Theorem:** $P(E_k \\mid A) = \\frac{P(E_k)\\,P(A \\mid E_k)}{\\sum_{j=1}^n P(E_j)\\,P(A \\mid E_j)}$
- **Binomial:** $P(X=k) = \\binom{n}{k}p^k q^{n-k}$, Mean $= np$, Variance $= npq$.
- **Poisson:** $P(X=k) = \\frac{e^{-\\lambda}\\lambda^k}{k!}$, Mean $=$ Variance $= \\lambda$.`,
    vivaFlashcards: [
      {
        id: "acm-v1",
        tag: "Matrices • High Frequency",
        question: "If eigenvalues of matrix A are 2, 3, and 5, what are the eigenvalues of A⁻¹ and A²?",
        answer: "Eigenvalues of A⁻¹ are 1/2, 1/3, 1/5. Eigenvalues of A² are 2² = 4, 3² = 9, and 5² = 25.",
      },
      {
        id: "acm-v2",
        tag: "Linear Systems",
        question: "When does a homogeneous system AX = 0 have a non-trivial (non-zero) solution?",
        answer: "When Rank(A) < n (number of unknowns), which for a square matrix is equivalent to det(A) = 0.",
      },
      {
        id: "acm-v3",
        tag: "Calculus • Euler's Theorem",
        question: "What is the degree of homogeneity of u = ln((x³ + y³)/(x + y)) and what is x(∂u/∂x) + y(∂u/∂y)?",
        answer: "Here eᵘ = (x³ + y³)/(x + y) is homogeneous of degree 3 − 1 = 2. By Euler's theorem on f(u) = eᵘ, x(∂u/∂x) + y(∂u/∂y) = 2·eᵘ / eᵘ = 2.",
      },
      {
        id: "acm-v4",
        tag: "Multivariable Maxima/Minima",
        question: "In the second-derivative test for f(x, y), what is the condition on rt − s² for a saddle point?",
        answer: "If rt − s² < 0 at a stationary point (where ∂f/∂x = 0 and ∂f/∂y = 0), the point is a saddle point (neither maximum nor minimum).",
      },
      {
        id: "acm-v5",
        tag: "Jacobians",
        question: "What is the product J · J' of the Jacobian of (u, v) with respect to (x, y) and its inverse Jacobian?",
        answer: "By the chain rule for Jacobians, ∂(u,v)/∂(x,y) × ∂(x,y)/∂(u,v) = 1.",
      },
      {
        id: "acm-v6",
        tag: "Probability",
        question: "When do we approximate a Binomial distribution B(n, p) using a Poisson distribution?",
        answer: "When n is very large (n → ∞) and success probability p is very small (p → 0) such that λ = np remains finite and moderate.",
      },
    ],
  },

  "basic-electrical-and-electronics-engineering": {
    subjectSlug: "basic-electrical-and-electronics-engineering",
    subjectCode: "CSE1002",
    subjectTitle: "Basic Electrical and Electronics Engineering",
    crashSummary:
      "60-Minute Night-Before-Exam Sheet covering KCL/KVL, Thevenin/Norton, Series RLC Resonance, 3-Phase Star/Delta, Transformers, and BJT/Diode Rectifiers.",
    formulaSheetMarkdown: `### 1. DC Network Theorems
- **KCL & KVL:** $\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$ at any node; $\\sum V = 0$ around any closed mesh.
- **Thevenin & Maximum Power Transfer:**
  $$I_L = \\frac{V_{th}}{R_{th} + R_L}, \\qquad R_L = R_{th} \\implies P_{\\max} = \\frac{V_{th}^2}{4 R_{th}} \\quad (\\eta = 50\\%)$$
- **Star–Delta ($Y \\leftrightarrow \\Delta$) Conversion:** For balanced resistors, $R_Y = \\frac{R_\\Delta}{3}$.

### 2. Single-Phase & Three-Phase AC Circuits
- **Series RLC Impedance & Resonance:**
  $$Z = R + j(X_L - X_C), \\qquad |Z| = \\sqrt{R^2 + (\\omega L - \\tfrac{1}{\\omega C})^2}, \\qquad f_r = \\frac{1}{2\\pi\\sqrt{LC}}$$
- **Power Factor & True Power:** $\\cos\\phi = \\frac{R}{|Z|}$, $P = V_{\\text{rms}} I_{\\text{rms}} \\cos\\phi$ (W), $Q = V_{\\text{rms}} I_{\\text{rms}} \\sin\\phi$ (VAR), $S = V_{\\text{rms}} I_{\\text{rms}}$ (VA).
- **3-Phase Balanced Systems:**
  - **Star ($Y$):** $V_L = \\sqrt{3}V_{ph}, \\quad I_L = I_{ph}$
  - **Delta ($\\Delta$):** $V_L = V_{ph}, \\quad I_L = \\sqrt{3}I_{ph}$
  - **Total 3-Phase Active Power:** $P = \\sqrt{3} V_L I_L \\cos\\phi$

### 3. Transformers & Semiconductor Devices
- **Transformer EMF Equation:** $E_1 = 4.44\\,f\\,N_1\\,\\Phi_m$, Turns Ratio $\\frac{E_2}{E_1} = \\frac{N_2}{N_1} = \\frac{I_1}{I_2} = K$.
- **Rectifier Ripple & Efficiency:** Half-Wave ($\\eta_{\\max} = 40.6\\%$, $\\gamma = 1.21$); Full-Wave / Bridge ($\\eta_{\\max} = 81.2\\%$, $\\gamma = 0.482$).
- **BJT Current Gain Relation:** $I_E = I_B + I_C$, $\\beta = \\frac{\\alpha}{1 - \\alpha}$, $I_C = \\beta I_B + (\\beta + 1)I_{CBO}$.`,
    vivaFlashcards: [
      {
        id: "bee-v1",
        tag: "Lab Viva • Network Theorems",
        question: "While finding Thevenin resistance R_th, how do we replace ideal independent voltage and current sources?",
        answer: "Ideal voltage sources are short-circuited (replaced by a wire, R = 0) and ideal current sources are open-circuited (removed, R = ∞).",
      },
      {
        id: "bee-v2",
        tag: "AC Circuits • Resonance",
        question: "At series RLC resonance (f = f_r), what is the power factor and phase angle between voltage and current?",
        answer: "At resonance, X_L = X_C so impedance Z = R (purely resistive). Phase angle φ = 0° and power factor cos(φ) = 1 (unity).",
      },
      {
        id: "bee-v3",
        tag: "Transformers • Viva Classic",
        question: "Why are transformer ratings specified in kVA instead of kW?",
        answer: "Copper loss depends on current (I²) and core/iron loss depends on voltage (V), both independent of load power factor cos(φ). Hence total heating depends on apparent power (V × I = kVA).",
      },
      {
        id: "bee-v4",
        tag: "Transformers • DC Supply Trap",
        question: "What happens if a 230V DC supply is connected to the primary winding of a transformer?",
        answer: "With DC (f = 0), dΦ/dt = 0 so no back-EMF is induced in the primary. Since primary winding resistance is very low, a huge current flows and burns out the primary winding.",
      },
      {
        id: "bee-v5",
        tag: "Electronics • PN Diode",
        question: "What is the knee (barrier) voltage for Silicon (Si) and Germanium (Ge) diodes at room temperature?",
        answer: "Approximately 0.7 V for Silicon (Si) and 0.3 V for Germanium (Ge).",
      },
      {
        id: "bee-v6",
        tag: "BJT Configurations",
        question: "Why is Common Emitter (CE) configuration the most widely used BJT amplifier configuration?",
        answer: "Because Common Emitter provides both high current gain (β ≈ 50–300) and high voltage gain simultaneously, yielding the highest power gain among CB, CE, and CC.",
      },
    ],
  },

  "computer-organization-and-architecture": {
    subjectSlug: "computer-organization-and-architecture",
    subjectCode: "CSE1003",
    subjectTitle: "Computer Organization and Architecture",
    crashSummary:
      "60-Minute Night-Before-Exam Sheet covering IEEE-754 Floating Point, Booth's Algorithm, 5-Stage RISC Pipeline Hazards, Cache Mapping, and AMAT.",
    formulaSheetMarkdown: `### 1. Data Representation & Computer Arithmetic
- **$n$-bit 2's Complement Range:** $-2^{n-1}$ to $+(2^{n-1} - 1)$. Overflow occurs when $C_{\\text{in}} \\oplus C_{\\text{out}} = 1$ at MSB.
- **IEEE-754 Single Precision (32-bit):** 1 Sign bit ($S$), 8 Exponent bits ($E$, Bias $= 127$), 23 Mantissa bits ($M$):
  $$\\text{Value} = (-1)^S \\times (1.M)_2 \\times 2^{E - 127}$$
- **Booth's Multiplication Recoding:** Inspect $(Q_0, Q_{-1})$: \`00\` or \`11\` $\\to$ Arithmetic Shift Right; \`01\` $\\to A \\leftarrow A + M$; \`10\` $\\to A \\leftarrow A - M$.

### 2. CPU Performance & 5-Stage RISC Pipelining
- **Iron Law of Processor Performance:**
  $$T_{\\text{CPU}} = \\frac{\\text{Instruction Count (IC)} \\times \\text{CPI}}{f_{\\text{clock}}} = \\text{IC} \\times \\text{CPI} \\times T_{\\text{cycle}}$$
- **Pipeline Speedup ($k$ stages, $n$ instructions):**
  $$S = \\frac{n \\cdot k}{k + (n - 1) + \\text{Stall Cycles}}, \\qquad \\text{CPI}_{\\text{pipe}} = 1 + \\text{Stall Cycles per Instruction}$$
- **Amdahl's Law:** $S_{\\text{overall}} = \\frac{1}{(1 - f) + \\frac{f}{S_{\\text{enh}}}}$

### 3. Memory Hierarchy & Cache Organization
- **Average Memory Access Time (AMAT):**
  $$\\text{AMAT} = T_{\\text{hit}} + (\\text{Miss Rate} \\times \\text{Miss Penalty})$$
- **Cache Address Breakdown ($2^m$ byte memory, $2^b$ byte block, $2^s$ sets):**
  - **Byte Offset:** $b$ bits
  - **Index / Set Bits:** $s$ bits (Direct Mapped: $s = \\log_2(\\text{Lines})$; $k$-way Set Associative: $s = \\log_2(\\text{Lines}/k)$)
  - **Tag Bits:** $m - s - b$ bits`,
    vivaFlashcards: [
      {
        id: "coa-v1",
        tag: "Pipeline Hazards",
        question: "What are the 3 types of pipeline hazards and how is a RAW (Read-After-Write) hazard resolved without stalling?",
        answer: "1) Structural, 2) Data (RAW, WAR, WAW), and 3) Control (branch) hazards. ALU-to-ALU RAW hazards are resolved with 0 stalls using operand forwarding (bypassing) from EX/MEM or MEM/WB registers.",
      },
      {
        id: "coa-v2",
        tag: "Cache Memory",
        question: "Why does a LOAD-USE hazard still require 1 stall cycle even when hardware forwarding is enabled?",
        answer: "Because a LOAD instruction reads data from data cache at the end of the MEM stage (stage 4), whereas the immediately following dependent instruction needs that operand at the start of the EX stage (stage 3).",
      },
      {
        id: "coa-v3",
        tag: "Control Unit",
        question: "Compare Hardwired Control Unit vs Microprogrammed Control Unit.",
        answer: "Hardwired uses combinational logic gates/FSMs (faster clock speed, used in RISC, harder to modify). Microprogrammed stores control words in Control ROM (easier to modify complex instructions, used in CISC).",
      },
      {
        id: "coa-v4",
        tag: "Cache Write Policies",
        question: "What is the difference between Write-Through and Write-Back cache policies?",
        answer: "Write-Through updates both cache and main memory on every write (uses write buffer). Write-Back updates only the cache line and sets a Dirty Bit, writing to RAM only when the line is evicted.",
      },
      {
        id: "coa-v5",
        tag: "I/O Transfer",
        question: "How does DMA (Direct Memory Access) improve CPU efficiency over Interrupt-Driven I/O?",
        answer: "DMA transfers an entire block of data directly between the I/O device and main memory via cycle-stealing without CPU intervention, interrupting the CPU only once when the entire block transfer completes.",
      },
      {
        id: "coa-v6",
        tag: "Booth's Algorithm",
        question: "When does Booth's multiplication algorithm perform worst?",
        answer: "On alternating 1s and 0s (e.g., 01010101₂), where every bit transition triggers an addition or subtraction before shifting.",
      },
    ],
  },

  "fundamentals-of-web-technologies": {
    subjectSlug: "fundamentals-of-web-technologies",
    subjectCode: "CSE1004",
    subjectTitle: "Fundamentals of Web Technologies",
    crashSummary:
      "60-Minute Night-Before-Exam Sheet covering DNS/HTTP Lifecycle, CSS Specificity & Box Model, Flexbox/Grid, DOM Event Bubbling, and Async Fetch.",
    formulaSheetMarkdown: `### 1. CSS Specificity & Box Model Equations
- **CSS Specificity Weight Tuple $(a, b, c, d)$:**
  - $a =$ Inline \`style=""\` ($1,0,0,0$)
  - $b =$ ID selectors \`#nav\` ($0,1,0,0$)
  - $c =$ Classes \`.card\`, attributes \`[type="text"]\`, pseudo-classes \`:hover\` ($0,0,1,0$)
  - $d =$ Elements \`div\`, \`h1\`, pseudo-elements \`::before\` ($0,0,0,1$)
- **Box Model Rendered Width:**
  - \`box-sizing: content-box\` (default): $\\text{Total Width} = \\text{width} + 2(\\text{padding}) + 2(\\text{border})$
  - \`box-sizing: border-box\`: $\\text{Total Width} = \\text{width}$ (includes padding and border).

### 2. HTTP Status Codes & REST Semantics
- **Status Classes:** \`200 OK\`, \`201 Created\`, \`301 Moved Permanently\`, \`304 Not Modified\`, \`400 Bad Request\`, \`401 Unauthorized\`, \`403 Forbidden\`, \`404 Not Found\`, \`500 Internal Server Error\`.
- **Idempotency:** \`GET\`, \`PUT\`, and \`DELETE\` are **idempotent**; \`POST\` is **not idempotent**.

### 3. JavaScript Event Loop, DOM & Async Fetch Pattern
\`\`\`javascript
async function loadStudentProfile(id) {
  try {
    const res = await fetch(\`/api/students/\${id}\`);
    if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
    const data = await res.json();
    document.querySelector("#name").textContent = data.name;
  } catch (err) {
    console.error("Request failed:", err);
  }
}
\`\`\``,
    vivaFlashcards: [
      {
        id: "web-v1",
        tag: "CSS • Specificity",
        question: "Between '#header .nav li.active a' and '#header ul li a:hover', which selector has higher specificity?",
        answer: "Both have 1 ID (#header → 100), 2 classes/pseudo-classes (.nav + .active vs :hover? Wait: first has 2 classes = 20, 2 elements = 2 → (0,1,2,2); second has 1 pseudo-class = 10, 3 elements = 3 → (0,1,1,3)). Thus '#header .nav li.active a' (0,1,2,2) wins!",
      },
      {
        id: "web-v2",
        tag: "DOM Events",
        question: "What is the difference between event.stopPropagation() and event.preventDefault()?",
        answer: "preventDefault() stops the browser's default action (e.g., form page reload or link navigation). stopPropagation() stops the event from bubbling up (or capturing down) to parent DOM elements.",
      },
      {
        id: "web-v3",
        tag: "JavaScript • Scope & Hoisting",
        question: "Compare var, let, and const in terms of scope and Temporal Dead Zone (TDZ).",
        answer: "'var' is function-scoped and hoisted with initial value undefined. 'let' and 'const' are block-scoped ({ ... }) and stay in the Temporal Dead Zone (throwing ReferenceError if accessed) until their declaration line.",
      },
      {
        id: "web-v4",
        tag: "Web Storage",
        question: "Compare cookies, localStorage, and sessionStorage.",
        answer: "localStorage (~5MB) persists across browser restarts and is never sent in HTTP headers. sessionStorage (~5MB) clears when the tab closes. Cookies (~4KB) are sent with every matching HTTP request and support HttpOnly/Secure flags.",
      },
      {
        id: "web-v5",
        tag: "JavaScript Event Loop",
        question: "Which queue runs first after the call stack empties: Microtask Queue (Promises) or Macrotask Queue (setTimeout)?",
        answer: "The Microtask Queue (Promise.then / async-await continuations) is completely drained before the Event Loop picks the next Macrotask (setTimeout / setInterval).",
      },
      {
        id: "web-v6",
        tag: "HTML5 Semantics",
        question: "Why do we use semantic tags (<main>, <article>, <nav>, <header>) instead of generic <div> elements?",
        answer: "Semantic tags provide built-in accessibility landmarks for screen readers (ARIA tree), improve SEO crawler indexing, and make document structure machine-readable.",
      },
    ],
  },

  "python-programming": {
    subjectSlug: "python-programming",
    subjectCode: "CSE1005",
    subjectTitle: "Python Programming",
    crashSummary:
      "60-Minute Night-Before-Exam Sheet covering Slicing, Mutability, LEGB Scope, Recursion, File Handling, OOP Magic Methods, and NumPy Broadcasting.",
    formulaSheetMarkdown: `### 1. Core Data Structures & Mutability Table
| Type | Mutable? | Ordered? | Hashable (Dict Key)? | Average Lookup Time |
| :--- | :--- | :--- | :--- | :--- |
| \`list\` | Yes | Yes | No | $O(n)$ |
| \`tuple\` | No | Yes | Yes (if elements hashable) | $O(n)$ |
| \`set\` | Yes | No | No (\`frozenset\` is) | $O(1)$ |
| \`dict\` | Yes | Yes (3.7+) | No | $O(1)$ |
| \`str\` | No | Yes | Yes | $O(n)$ |

### 2. Slicing, List Comprehensions & LEGB Rule
- **Slicing \`s[start:stop:step]\`:** \`s[::-1]\` reverses sequence; \`s[:]\` creates a shallow copy.
- **LEGB Name Resolution Order:** **L**ocal $\\to$ **E**nclosing (nonlocal) $\\to$ **G**lobal $\\to$ **B**uilt-in.
- **Safe File Context Manager:**
\`\`\`python
with open("marks.txt", "r", encoding="utf-8") as f:
    scores = [int(line.strip()) for line in f if line.strip()]
\`\`\`

### 3. OOP & NumPy Vectorization
- **Dunder Methods:** \`__init__(self, ...)\` (initializer), \`__str__(self)\` (user display), \`__eq__(self, other)\`, \`__add__(self, other)\` (operator overloading).
- **NumPy Broadcasting Rule:** Align shapes from the **trailing (rightmost) dimension**; two dimensions are compatible if they are **equal** or **one of them is $1$**.`,
    vivaFlashcards: [
      {
        id: "py-v1",
        tag: "Lab Viva • Mutability Trap",
        question: "What is the output of: a = [[0]*2]*3; a[0][0] = 9; print(a)?",
        answer: "Output is [[9, 0], [9, 0], [9, 0]] because *3 creates 3 references to the exact same inner list object! Use [[0]*2 for _ in range(3)] for independent rows.",
      },
      {
        id: "py-v2",
        tag: "Functions • *args & **kwargs",
        question: "What is the difference between *args and **kwargs in a Python function signature?",
        answer: "*args collects extra positional arguments into a tuple, while **kwargs collects extra keyword (named) arguments into a dictionary.",
      },
      {
        id: "py-v3",
        tag: "Copy Semantics",
        question: "What is the difference between copy.copy() (shallow copy) and copy.deepcopy()?",
        answer: "A shallow copy creates a new outer container but shares references to nested mutable objects. deepcopy() recursively clones both the outer container and all nested objects.",
      },
      {
        id: "py-v4",
        tag: "Exception Handling",
        question: "In a try-except-else-finally block, when does the 'else' block execute vs 'finally'?",
        answer: "'else' executes ONLY if no exception was raised in the 'try' block. 'finally' executes ALWAYS (even if an exception occurs or a return statement is hit).",
      },
      {
        id: "py-v5",
        tag: "OOP • Inheritance",
        question: "What is MRO (Method Resolution Order) in Python multiple inheritance and which algorithm computes it?",
        answer: "MRO defines the deterministic order in which base classes are searched for a method (inspected via Class.__mro__). Python 3 uses the C3 Linearization algorithm.",
      },
      {
        id: "py-v6",
        tag: "NumPy vs Python Lists",
        question: "Why are NumPy arrays 10x–50x faster than standard Python lists for numerical matrix operations?",
        answer: "NumPy stores homogeneous unboxed C data types in contiguous memory blocks and executes vectorized loops in compiled C/SIMD without Python per-element type-checking overhead.",
      },
    ],
  },

  "indian-science-engineering-and-technology": {
    subjectSlug: "indian-science-engineering-and-technology",
    subjectCode: "CSE1006",
    subjectTitle: "Indian Science, Engineering and Technology (IKS)",
    crashSummary:
      "60-Minute Night-Before-Exam Sheet covering Chaturdasha Vidyasthanas, Sulbasutras, Pingala Binary Meru Prastara, Aryabhata/Madhava Calculus, and Wootz Metallurgy.",
    formulaSheetMarkdown: `### 1. Chaturdasha Vidyasthanas (14 Pillars of Classical Knowledge)
- **4 Vedas:** Rigveda, Yajurveda, Samaveda, Atharvaveda.
- **6 Vedangas:** Shiksha (Phonetics), Kalpa (Ritual Geometry / *Sulbasutras*), Vyakarana (Panini's Algorithmic Grammar — *Ashtadhyayi*), Nirukta (Etymology), Chandas (Pingala's Binary Prosody), Jyotisha (Astronomy).
- **4 Upangas:** Nyaya (Logic & Epistemology), Mimamsa, Dharmashastra, Purana/Itihasa.

### 2. Classical Indian Mathematics & Algorithmic Milestones
- **Baudhayana Sulbasutra (~800 BCE):** Geometric Pythagorean theorem + rational approximation of $\\sqrt{2}$:
  $$\\sqrt{2} \\approx 1 + \\frac{1}{3} + \\frac{1}{3 \\times 4} - \\frac{1}{3 \\times 4 \\times 34} = \\frac{577}{408} \\approx 1.4142156$$
- **Pingala's *Chandas Shastra* (~200 BCE):** Binary representation of Laghu ($1$) and Guru ($0$), powers of $2^{n}$, and *Meru Prastara* (Pascal's Triangle / Binomial Coefficients $\\binom{n}{k}$).
- **Aryabhata (499 CE) & Brahmagupta (628 CE):** Place-value decimal notation, $\\pi \\approx \\frac{62832}{20000} = 3.1416$, *Kuttaka* (linear Diophantine solver $ax + by = c$), and formal arithmetic laws of *Shunya* ($0$).
- **Kerala School — Madhava of Sangamagrama (~1340–1425 CE):** Infinite power series for $\\arctan(x)$, $\\sin(x)$, $\\cos(x)$, and $\\pi$:
  $$\\frac{\\pi}{4} = 1 - \\frac{1}{3} + \\frac{1}{5} - \\frac{1}{7} + \\cdots$$

### 3. Metallurgy, Town Planning & Ayurveda
- **Delhi Iron Pillar (Mehrauli, ~400 CE):** $98\\%$ wrought iron with high phosphorus ($0.25\\%$) forming a protective passive crystalline *misawite* ($\\delta\\text{-FeOOH}$) layer.
- **Zawar Zinc Retort Distillation (Rajasthan):** World's first industrial **downward reductive distillation** (*Tiryakpatana Yantra*) condensing zinc vapor below $907^\\circ\\text{C}$.`,
    vivaFlashcards: [
      {
        id: "iks-v1",
        tag: "Algorithmic Linguistics",
        question: "Why is Panini's Ashtadhyayi (~500 BCE) considered a precursor to modern computer science and BNF grammar?",
        answer: "Ashtadhyayi encodes ~3,959 generative rules using metalinguistic markers (anubandhas), context-sensitive production rules, and recursion—structurally identical to Backus-Naur Form (BNF) used in compiler design.",
      },
      {
        id: "iks-v2",
        tag: "Combinatorics • Pingala",
        question: "What is 'Meru Prastara' in Pingala's Chandas Shastra and what modern structure does it correspond to?",
        answer: "Meru Prastara is the staircase table of binomial coefficients C(n, k) used to count prosodic meters with k short syllables—known in Western math 1,800 years later as Pascal's Triangle.",
      },
      {
        id: "iks-v3",
        tag: "Metallurgy • Corrosion Resistance",
        question: "What chemical mechanism prevents the 1,600-year-old Delhi Iron Pillar from rusting?",
        answer: "Absence of manganese combined with high phosphorus (~0.25%) catalyzes the formation of a dense, non-porous protective passive film of crystalline iron hydrogen phosphate hydrate (misawite) on the surface.",
      },
      {
        id: "iks-v4",
        tag: "Chemical Engineering • Zinc",
        question: "Why did ancient Indian metallurgists at Zawar use downward distillation (Adhahpatana) to extract metallic Zinc?",
        answer: "Zinc boils at 907°C, which is lower than the temperature needed to smelt its ore (~1000°C). In an open furnace, zinc vapor immediately re-oxidizes to ZnO; sealing the retort and condensing downward into a cool chamber prevented re-oxidation.",
      },
      {
        id: "iks-v5",
        tag: "Kerala School • Calculus",
        question: "Which Indian mathematician discovered the infinite power series for sin(x), cos(x), and arctan(x) nearly 250 years before Gregory, Leibniz, and Newton?",
        answer: "Madhava of Sangamagrama (c. 1340–1425 CE), documented with full geometric proofs in Jyesthadeva's Malayalam treatise 'Yuktibhasa' (~1530 CE).",
      },
      {
        id: "iks-v6",
        tag: "Hydraulic Engineering",
        question: "How did the Harappan port at Lothal and the stepwells (Rani ki Vav) manage seasonal water fluctuations?",
        answer: "Lothal used a 214m × 36m fired-brick tidal dockyard with a spill-channel sluice gate to maintain draft height at low tide; Rani ki Vav used a 7-tiered subterranean inverted stepwell to recharge aquifers and reduce evaporation.",
      },
    ],
  },
};
