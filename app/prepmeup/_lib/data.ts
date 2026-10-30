export interface PmuSubject {
  id: string;
  code: string;
  title: string;
  slug: string;
  description: string;
  credit_units: number;
  icon: string;
  is_published: boolean;
  module_count?: number;
}

export interface PmuModule {
  id: string;
  subject_id: string;
  module_number: number;
  title: string;
  description: string;
  is_published: boolean;
  topics?: PmuTopic[];
}

export interface PmuTopic {
  id: string;
  module_id: string;
  topic_number: number;
  title: string;
  slug: string;
  description: string;
  estimated_reading_minutes: number;
  is_sample: boolean;
  is_published: boolean;
  notes?: PmuNote[];
}

export interface PmuNote {
  id: string;
  topic_id: string;
  title: string;
  content: string;
  pdf_url: string | null;
  reading_time_min: number;
  status: "draft" | "under_review" | "approved" | "published" | "rejected" | "archived";
  is_sample: boolean;
}

export interface PmuPastPaper {
  id: string;
  subject_id: string;
  exam_year: number;
  exam_type: string;
  title: string;
  question_paper_url: string;
  solution_url: string | null;
  is_published: boolean;
}

/**
 * Official DYPIU Semester 1 Curriculum (AY 2026-27).
 * Verbatim alignment with School of Computer Science, Engineering & Applications.
 */
export const FALLBACK_SUBJECTS: PmuSubject[] = [
  {
    id: "sub-cse1001",
    code: "CSE1001",
    title: "Applied Computational Mathematics",
    slug: "applied-computational-mathematics",
    description: "Linear Algebra, Rank & Echelon forms, Multivariable Calculus, Ordinary Differential Equations, and Vector Calculus.",
    credit_units: 3,
    icon: "📐",
    is_published: true,
    module_count: 5,
  },
  {
    id: "sub-cse1002",
    code: "CSE1002",
    title: "Basic Electrical and Electronics Engineering",
    slug: "basic-electrical-and-electronics-engineering",
    description: "DC/AC circuit theorems, PN diodes, rectifiers, BJT & MOSFET switches/amplifiers, Op-Amps, and hardware lab practicals.",
    credit_units: 4,
    icon: "⚡",
    is_published: true,
    module_count: 5,
  },
  {
    id: "sub-cse1003",
    code: "CSE1003",
    title: "Computer Organization and Architecture",
    slug: "computer-organization-and-architecture",
    description: "Von Neumann vs Harvard, 8 Great Ideas, Booth multiplication, instruction pipelining, cache memory hierarchy, and DMA.",
    credit_units: 3,
    icon: "💻",
    is_published: true,
    module_count: 5,
  },
  {
    id: "sub-cse1004",
    code: "CSE1004",
    title: "Fundamentals of Web Technologies",
    slug: "fundamentals-of-web-technologies",
    description: "Internet architecture, HTTP/HTTPS, semantic HTML5, modern CSS3 flexbox/grid, client JavaScript, and full-stack deployment.",
    credit_units: 4,
    icon: "🌐",
    is_published: true,
    module_count: 5,
  },
  {
    id: "sub-cse1005",
    code: "CSE1005",
    title: "Python Programming",
    slug: "python-programming",
    description: "Control flow, functions, sequences & dictionaries, regex, OOP design, and scientific libraries NumPy & Pandas.",
    credit_units: 4,
    icon: "🐍",
    is_published: true,
    module_count: 5,
  },
  {
    id: "sub-cse1006",
    code: "CSE1006",
    title: "Indian Science, Engineering and Technology (IKS)",
    slug: "indian-science-engineering-and-technology",
    description: "Ancient Indian mathematics, Sulba Sutras geometry, Panini formal linguistics, metallurgy, Wootz steel, and sustainable water systems.",
    credit_units: 1,
    icon: "🏛️",
    is_published: true,
    module_count: 4,
  },
];

// Detail records mapped by slug
const acmDetail = {
  subject: FALLBACK_SUBJECTS[0],
  modules: [
    {
      id: "m-acm-1",
      subject_id: "sub-cse1001",
      module_number: 1,
      title: "Module I: Linear Algebra – I (Matrices & Operations)",
      description: "Elementary row operations, row echelon form, system of linear equations, and matrix decompositions.",
      is_published: true,
      topics: [
        { id: "t-acm-1", module_id: "m-acm-1", topic_number: 1, title: "Matrices & Matrix Operations", slug: "matrices-matrix-operations", description: "Addition, multiplication, transpose, and determinant properties.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-acm-2", module_id: "m-acm-1", topic_number: 2, title: "Elementary Row Operations & Echelon Form", slug: "elementary-row-operations", description: "Row equivalence, pivot elements, and reduced row echelon form (RREF).", estimated_reading_minutes: 25, is_sample: true, is_published: true },
        { id: "t-acm-3", module_id: "m-acm-1", topic_number: 3, title: "Vector Spaces & Subspaces", slug: "vector-spaces-subspaces", description: "Linear independence, spanning sets, basis, and dimension.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-acm-2",
      subject_id: "sub-cse1001",
      module_number: 2,
      title: "Module II: Linear Algebra – II (Rank & Linear Systems)",
      description: "Rank and inverse using row operations, consistency of AX=B, and Gauss elimination.",
      is_published: true,
      topics: [
        { id: "t-acm-4", module_id: "m-acm-2", topic_number: 1, title: "Rank & Inverse by Row Transformations", slug: "rank-and-inverse-matrix", description: "Computing rank rho(A) and inverse A^-1 using [A | I] Gauss-Jordan.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-acm-5", module_id: "m-acm-2", topic_number: 2, title: "System of Linear Equations (AX = B)", slug: "system-linear-equations", description: "Rouché-Capelli consistency theorem and Gauss elimination method.", estimated_reading_minutes: 30, is_sample: false, is_published: true },
        { id: "t-acm-6", module_id: "m-acm-2", topic_number: 3, title: "Eigenvalues, Eigenvectors & Diagonalization", slug: "eigenvalues-and-diagonalization", description: "Characteristic equation, Cayley-Hamilton theorem, and matrix diagonalization.", estimated_reading_minutes: 30, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-acm-3",
      subject_id: "sub-cse1001",
      module_number: 3,
      title: "Module III: Differential Calculus (Multivariable)",
      description: "Functions of several variables, partial derivatives, Euler's theorem, Taylor series, and Lagrange multipliers.",
      is_published: true,
      topics: [
        { id: "t-acm-7", module_id: "m-acm-3", topic_number: 1, title: "Partial Derivatives & Chain Rule", slug: "partial-derivatives", description: "Higher-order partial derivatives and multivariable chain rule.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-acm-8", module_id: "m-acm-3", topic_number: 2, title: "Euler's Theorem on Homogeneous Functions", slug: "eulers-theorem-homogeneous", description: "First and second order Euler identities with exam proofs.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-acm-9", module_id: "m-acm-3", topic_number: 3, title: "Maxima & Minima of Two Variables", slug: "maxima-minima-2var", description: "Stationary points, Hessian discriminant (rt - s^2), and saddle points.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-acm-10", module_id: "m-acm-3", topic_number: 4, title: "Lagrange Multipliers for Constrained Extrema", slug: "lagrange-multipliers", description: "Constrained optimization of functions under auxiliary conditions.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-acm-4",
      subject_id: "sub-cse1001",
      module_number: 4,
      title: "Module IV: Differential Equations",
      description: "Ordinary differential equations, linear 1st order equations, Bernoulli's equation, and exact differential equations.",
      is_published: true,
      topics: [
        { id: "t-acm-11", module_id: "m-acm-4", topic_number: 1, title: "First Order Linear ODEs", slug: "first-order-linear-odes", description: "Standard form dy/dx + Py = Q and Integrating Factor e^(int P dx).", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-acm-12", module_id: "m-acm-4", topic_number: 2, title: "Bernoulli's Differential Equations", slug: "bernoulli-differential-equations", description: "Non-linear substitution u = y^(1-n) reduction to linear form.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-acm-13", module_id: "m-acm-4", topic_number: 3, title: "Exact Differential Equations & Integrating Factors", slug: "exact-differential-equations", description: "Condition dM/dy = dN/dx and 4 standard integrating factor rules.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-acm-5",
      subject_id: "sub-cse1001",
      module_number: 5,
      title: "Module V: Integral & Vector Calculus",
      description: "Double integrals over regions, vector differential operators (Gradient, Divergence, Curl), and physical interpretations.",
      is_published: true,
      topics: [
        { id: "t-acm-14", module_id: "m-acm-5", topic_number: 1, title: "Double Integrals over Rectangular Regions", slug: "double-integrals", description: "Iterated integrals, change of order, and geometric area/volume.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-acm-15", module_id: "m-acm-5", topic_number: 2, title: "Vector Differential Operator: Del (∇)", slug: "vector-differential-operators", description: "Gradient of scalar fields, directional derivatives, and normal surfaces.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-acm-16", module_id: "m-acm-5", topic_number: 3, title: "Divergence & Curl of Vector Fields", slug: "divergence-and-curl", description: "Solenoidal (div V = 0) and irrotational (curl V = 0) vector fields.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
  ],
  sampleNote: {
    id: "n-acm-1",
    topic_id: "t-acm-2",
    title: "Elementary Row Operations & Echelon Form — Model Lecture Note",
    reading_time_min: 25,
    status: "published" as const,
    is_sample: true,
    pdf_url: null,
    content: `### 1. Elementary Row Operations (ERO)
On any matrix $A \in \mathbb{R}^{m \times n}$, three elementary operations preserve row equivalence ($A \sim B$):
1. **$R_i \leftrightarrow R_j$**: Interchange of any two rows.
2. **$R_i \to k R_i$** ($k \neq 0$): Multiplication of row $i$ by a non-zero scalar $k$.
3. **$R_i \to R_i + k R_j$**: Adding $k$ times row $j$ to row $i$.

---

### 2. Row Echelon Form (REF) Criteria
A matrix is in **Row Echelon Form** if:
- All zero rows (if any) are strictly at the bottom.
- The leading entry (pivot) of each non-zero row is strictly to the right of the pivot in the row above it.
- All entries in a column below a leading pivot are zero.

**Rank of Matrix $\rho(A)$:**
$$\rho(A) = \text{Number of non-zero rows in its Row Echelon Form}$$

---

### 3. Step-by-Step Gauss Elimination Example
Solve the system:
$$\begin{bmatrix} 1 & 2 & 1 \\ 2 & 5 & 3 \\ 1 & 1 & 2 \end{bmatrix} \begin{bmatrix} x \\ y \\ z \end{bmatrix} = \begin{bmatrix} 4 \\ 9 \\ 6 \end{bmatrix}$$

Augmented matrix $[A | B]$:
$$\begin{bmatrix} 1 & 2 & 1 & | & 4 \\ 2 & 5 & 3 & | & 9 \\ 1 & 1 & 2 & | & 6 \end{bmatrix} \\xrightarrow{R_2 \to R_2 - 2R_1, \; R_3 \to R_3 - R_1} \begin{bmatrix} 1 & 2 & 1 & | & 4 \\ 0 & 1 & 1 & | & 1 \\ 0 & -1 & 1 & | & 2 \end{bmatrix}$$

$$\\xrightarrow{R_3 \to R_3 + R_2} \begin{bmatrix} 1 & 2 & 1 & | & 4 \\ 0 & 1 & 1 & | & 1 \\ 0 & 0 & 2 & | & 3 \end{bmatrix}$$

By back substitution:
$$2z = 3 \implies z = 1.5$$
$$y + z = 1 \implies y = -0.5$$
$$x + 2(-0.5) + 1.5 = 4 \implies x = 3.5$$`,
  },
  pastPapers: [
    {
      id: "p-acm-1",
      subject_id: "sub-cse1001",
      exam_year: 2026,
      exam_type: "Mid-Term Examination (AY 2026-27)",
      title: "DYPIU Mid-Term Exam Paper: Linear Algebra & Differential Calculus",
      question_paper_url: "#",
      solution_url: null,
      is_published: true,
    },
    {
      id: "p-acm-2",
      subject_id: "sub-cse1001",
      exam_year: 2025,
      exam_type: "End-Semester Examination",
      title: "Winter End-Sem Exam Paper & Complete Analytical Solutions",
      question_paper_url: "#",
      solution_url: null,
      is_published: true,
    },
  ],
};

const beeeDetail = {
  subject: FALLBACK_SUBJECTS[1],
  modules: [
    {
      id: "m-bee-1",
      subject_id: "sub-cse1002",
      module_number: 1,
      title: "Module I: Fundamentals of Electrical Circuits",
      description: "Ohm's law, KCL, KVL, Mesh and Nodal analysis, Thevenin's, Norton's, and Superposition theorems.",
      is_published: true,
      topics: [
        { id: "t-bee-1", module_id: "m-bee-1", topic_number: 1, title: "Kirchhoff's Laws (KCL & KVL)", slug: "kirchhoffs-laws", description: "Node current sums and mesh voltage loops in resistive networks.", estimated_reading_minutes: 20, is_sample: true, is_published: true },
        { id: "t-bee-2", module_id: "m-bee-1", topic_number: 2, title: "Thevenin & Norton Equivalent Circuits", slug: "thevenin-norton-theorems", description: "Calculation of open-circuit voltage Vth, internal resistance Rth, and Norton current In.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-bee-3", module_id: "m-bee-1", topic_number: 3, title: "Superposition & Maximum Power Transfer", slug: "superposition-and-mpt", description: "Linear multi-source superposition and condition RL = Rth for Pmax.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-bee-2",
      subject_id: "sub-cse1002",
      module_number: 2,
      title: "Module II: Semiconductor Devices & Applications",
      description: "PN junction diodes, V-I characteristics, Half-Wave and Full-Wave Bridge rectifiers, and Zener regulators.",
      is_published: true,
      topics: [
        { id: "t-bee-4", module_id: "m-bee-2", topic_number: 1, title: "PN Junction Diode V-I Characteristics", slug: "pn-junction-characteristics", description: "Depletion region, forward bias cut-in voltage (0.7V Si), reverse saturation, and breakdown.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-bee-5", module_id: "m-bee-2", topic_number: 2, title: "Half-Wave & Full-Wave Bridge Rectifiers", slug: "rectifiers-and-filters", description: "AC-DC rectification, ripple factor (1.21 vs 0.482), efficiency (40.6% vs 81.2%), and filter capacitors.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-bee-6", module_id: "m-bee-2", topic_number: 3, title: "Zener Diode as a Voltage Regulator", slug: "zener-voltage-regulator", description: "Avalanche vs Zener breakdown, reverse knee voltage Vz, and line/load regulation.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-bee-3",
      subject_id: "sub-cse1002",
      module_number: 3,
      title: "Module III: Bipolar Junction Transistors (BJT) & MOSFET",
      description: "BJT construction, CE/CB/CC configurations, active/cutoff/saturation regions, CE amplifier, and MOSFET fundamentals.",
      is_published: true,
      topics: [
        { id: "t-bee-7", module_id: "m-bee-3", topic_number: 1, title: "BJT Configurations & Characteristics", slug: "bjt-configurations", description: "Common Emitter (CE), Common Base (CB), alpha vs beta relationship beta = alpha / (1 - alpha).", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-bee-8", module_id: "m-bee-3", topic_number: 2, title: "BJT as an Electronic Switch & Amplifier", slug: "bjt-switch-amplifier", description: "Saturation/cutoff switching and small-signal Common Emitter amplification.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-bee-9", module_id: "m-bee-3", topic_number: 3, title: "MOSFET Fundamentals & CMOS Logic", slug: "mosfet-and-cmos", description: "Enhancement vs Depletion N-channel MOSFET and basic CMOS inverter architecture.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-bee-4",
      subject_id: "sub-cse1002",
      module_number: 4,
      title: "Module IV: Operational Amplifiers (Op-Amps)",
      description: "Ideal Op-Amp golden rules, inverting & non-inverting configurations, summing amplifier, integrator, differentiator, comparator.",
      is_published: true,
      topics: [
        { id: "t-bee-10", module_id: "m-bee-4", topic_number: 1, title: "Ideal Op-Amp Characteristics & Virtual Ground", slug: "ideal-opamp-characteristics", description: "Infinite input impedance, zero output impedance, infinite open-loop gain, and virtual short concept.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-bee-11", module_id: "m-bee-4", topic_number: 2, title: "Inverting & Non-Inverting Amplifiers", slug: "inverting-non-inverting-opamp", description: "Gain derivations: Av = -Rf/R1 and Av = 1 + Rf/R1.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-bee-12", module_id: "m-bee-4", topic_number: 3, title: "Summing, Integrator & Differentiator Circuits", slug: "opamp-applications", description: "Linear mathematical computing circuits and voltage comparator design.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-bee-5",
      subject_id: "sub-cse1002",
      module_number: 5,
      title: "Module V: Hardware Lab Manual (CSE1002P Practicals 1–5)",
      description: "Full experimental manuals, circuit diagrams, observation tables, and calculations for Experiments 1 through 5.",
      is_published: true,
      topics: [
        { id: "t-bee-13", module_id: "m-bee-5", topic_number: 1, title: "Exp 1: Electronic Components & Multimeter Testing", slug: "beee-lab-exp-1", description: "Color coding of resistors, multimeter voltage/current/resistance calibration.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-bee-14", module_id: "m-bee-5", topic_number: 2, title: "Exp 2: Verification of KVL & KCL", slug: "beee-lab-exp-2", description: "Series and parallel breadboard circuits with theoretical vs measured validation.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-bee-15", module_id: "m-bee-5", topic_number: 3, title: "Exp 3: PN Junction Diode V-I Curve", slug: "beee-lab-exp-3", description: "Forward cut-in voltage measurement and dynamic resistance calculation.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-bee-16", module_id: "m-bee-5", topic_number: 4, title: "Exp 4: Half-Wave Rectifier with Capacitor Filter", slug: "beee-lab-exp-4", description: "CRO waveform observations, Vdc, Vrms, and ripple factor determination.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-bee-17", module_id: "m-bee-5", topic_number: 5, title: "Exp 5: Center-Tap & Bridge Full-Wave Rectifiers", slug: "beee-lab-exp-5", description: "Comparative ripple factor, PIV rating, and rectification efficiency analysis.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
  ],
  sampleNote: {
    id: "n-bee-1",
    topic_id: "t-bee-1",
    title: "Kirchhoff's Laws (KCL & KVL) — Theory, Derivations & Lab Circuit",
    reading_time_min: 20,
    status: "published" as const,
    is_sample: true,
    pdf_url: null,
    content: `### 1. Kirchhoff's Current Law (KCL)
**Statement:** The algebraic sum of currents entering and leaving any electrical node is strictly zero (Law of Conservation of Electric Charge):
$$\sum_{k=1}^{n} I_k = 0 \implies I_{entering} = I_{leaving}$$

---

### 2. Kirchhoff's Voltage Law (KVL)
**Statement:** The algebraic sum of all voltages (potential drops and electromotive forces) around any closed loop is zero (Law of Conservation of Energy):
$$\sum_{k=1}^{m} V_k = 0 \implies \sum E - \sum I R = 0$$

---

### 3. Verification Circuit (Experiment 2 Lab Manual)
For a two-loop circuit powered by source $V_S = 12\text{V}$ with branch resistors $R_1 = 1\text{k}\Omega, R_2 = 2.2\text{k}\Omega, R_3 = 3.3\text{k}\Omega$:
1. Calculate nodal potential $V_A$ at common junction:
   $$\frac{V_A - 12}{1000} + \frac{V_A}{2200} + \frac{V_A}{3300} = 0$$
   $$V_A \left( \frac{1}{1000} + \frac{1}{2200} + \frac{1}{3300} \right) = \frac{12}{1000}$$
   $$V_A (10^{-3} + 0.4545 \times 10^{-3} + 0.3030 \times 10^{-3}) = 0.012 \implies V_A = \frac{0.012}{0.0017575} \approx 6.828\text{ V}$$
2. Branch currents:
   $$I_1 = \frac{12 - 6.828}{1000} = 5.172\text{ mA}$$
   $$I_2 = \frac{6.828}{2200} = 3.104\text{ mA}, \quad I_3 = \frac{6.828}{3300} = 2.069\text{ mA}$$
   $$I_2 + I_3 = 3.104 + 2.069 = 5.173\text{ mA} \approx I_1 \quad \text{(KCL Verified)}$$`,
  },
  pastPapers: [
    {
      id: "p-bee-1",
      subject_id: "sub-cse1002",
      exam_year: 2026,
      exam_type: "Official Lab Manual (AY 2026-27)",
      title: "BEEE Complete Lab Manual: Experiments 1 to 5 with Calculations",
      question_paper_url: "#",
      solution_url: null,
      is_published: true,
    },
    {
      id: "p-bee-2",
      subject_id: "sub-cse1002",
      exam_year: 2025,
      exam_type: "Mid-Term Examination",
      title: "Mid-Term Theory & Circuit Numerical Question Paper",
      question_paper_url: "#",
      solution_url: null,
      is_published: true,
    },
  ],
};

const coaDetail = {
  subject: FALLBACK_SUBJECTS[2],
  modules: [
    {
      id: "m-coa-1",
      subject_id: "sub-cse1003",
      module_number: 1,
      title: "Module I: Introduction to Computer Architecture & Data Representation",
      description: "Von Neumann vs Harvard, 8 Great Ideas, performance metrics, number systems, and Booth's multiplication algorithm.",
      is_published: true,
      topics: [
        { id: "t-coa-1", module_id: "m-coa-1", topic_number: 1, title: "Von Neumann vs Harvard Architecture", slug: "von-neumann-vs-harvard", description: "Stored-program concept, memory bottle-neck, and architectural comparison.", estimated_reading_minutes: 20, is_sample: true, is_published: true },
        { id: "t-coa-2", module_id: "m-coa-1", topic_number: 2, title: "Eight Great Ideas in Computer Architecture", slug: "eight-great-ideas-architecture", description: "Moore's Law, abstraction, common case fast, parallelism, pipelining, prediction, memory hierarchy, redundancy.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-coa-3", module_id: "m-coa-1", topic_number: 3, title: "Booth's Multiplication Algorithm", slug: "booths-multiplication-algorithm", description: "Signed 2's complement multiplication algorithm with arithmetic right shifts.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-coa-4", module_id: "m-coa-1", topic_number: 4, title: "Floating-Point Representation (IEEE 754)", slug: "ieee-754-floating-point", description: "Sign bit, 8-bit biased exponent (bias 127), and 23-bit mantissa normalization.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-coa-2",
      subject_id: "sub-cse1003",
      module_number: 2,
      title: "Module II: Processor Architecture & Instruction-Level Parallelism",
      description: "Instruction set architecture (ISA), addressing modes, instruction cycle, pipelining, and hazards.",
      is_published: true,
      topics: [
        { id: "t-coa-5", module_id: "m-coa-2", topic_number: 1, title: "Instruction Set Architecture (ISA) & Types", slug: "isa-and-instruction-types", description: "Zero, one, two, and three-address instructions; Stack vs GPR architectures.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-coa-6", module_id: "m-coa-2", topic_number: 2, title: "CPU Addressing Modes & RTL", slug: "addressing-modes-and-rtl", description: "Immediate, direct, indirect, register, displacement, and Register Transfer Language (RTL).", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-coa-7", module_id: "m-coa-2", topic_number: 3, title: "RISC vs CISC Architecture", slug: "risc-vs-cisc-architecture", description: "Single-cycle execution, load-store model vs multi-cycle complex instructions.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-coa-8", module_id: "m-coa-2", topic_number: 4, title: "5-Stage Pipelining & Pipeline Hazards", slug: "pipelining-and-hazards", description: "IF-ID-EX-MEM-WB stages, structural hazards, data hazards (RAW, WAR, WAW), and branch penalties.", estimated_reading_minutes: 30, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-coa-3",
      subject_id: "sub-cse1003",
      module_number: 3,
      title: "Module III: Memory Systems & Cache Organization",
      description: "Memory hierarchy, cache mapping techniques, replacement policies (LRU/FIFO), write policies, and virtual memory.",
      is_published: true,
      topics: [
        { id: "t-coa-9", module_id: "m-coa-3", topic_number: 1, title: "Memory Hierarchy Architecture", slug: "memory-hierarchy-design", description: "Registers, L1/L2/L3 cache, main memory, SSD/HDD speed, cost, and capacity trade-offs.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-coa-10", module_id: "m-coa-3", topic_number: 2, title: "Cache Mapping Techniques", slug: "cache-mapping-techniques", description: "Direct mapping, fully associative mapping, and set-associative cache design.", estimated_reading_minutes: 30, is_sample: false, is_published: true },
        { id: "t-coa-11", module_id: "m-coa-3", topic_number: 3, title: "Cache Replacement & Write Policies", slug: "cache-replacement-and-write-policies", description: "LRU, FIFO, LFU, Write-Through vs Write-Back, and cache hit/miss ratio calculations.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-coa-12", module_id: "m-coa-3", topic_number: 4, title: "Virtual Memory & Paging (TLB)", slug: "virtual-memory-and-tlb", description: "Logical to physical address translation, Page Tables, Translation Lookaside Buffer, and Page Faults.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-coa-4",
      subject_id: "sub-cse1003",
      module_number: 4,
      title: "Module IV: Input/Output Systems",
      description: "I/O organization, programmed I/O, interrupt-driven I/O, Direct Memory Access (DMA), and bus arbitration.",
      is_published: true,
      topics: [
        { id: "t-coa-13", module_id: "m-coa-4", topic_number: 1, title: "Programmed I/O vs Interrupt-Driven I/O", slug: "programmed-vs-interrupt-io", description: "Polling overhead vs hardware interrupt vectors and ISR execution.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-coa-14", module_id: "m-coa-4", topic_number: 2, title: "Direct Memory Access (DMA) & Transfer Modes", slug: "dma-controllers-modes", description: "DMA controller architecture, Burst mode, Cycle Stealing, and Transparent DMA.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-coa-15", module_id: "m-coa-4", topic_number: 3, title: "Bus Structures & Arbitration", slug: "bus-structures-arbitration", description: "System bus (Data, Address, Control), centralized daisy chaining vs distributed arbitration.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-coa-5",
      subject_id: "sub-cse1003",
      module_number: 5,
      title: "Module V: Multiprocessors & Parallel Processing",
      description: "Flynn's taxonomy, UMA vs NUMA shared memory systems, multicore processors, and cache coherence.",
      is_published: true,
      topics: [
        { id: "t-coa-16", module_id: "m-coa-5", topic_number: 1, title: "Flynn's Classification of Computers", slug: "flynns-classification", description: "SISD, SIMD (vector processing/GPUs), MISD, and MIMD systems.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-coa-17", module_id: "m-coa-5", topic_number: 2, title: "Multicore Processors & Shared Memory", slug: "multicore-and-shared-memory", description: "Symmetric Multiprocessors (SMP), UMA vs Non-Uniform Memory Access (NUMA).", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-coa-18", module_id: "m-coa-5", topic_number: 3, title: "Cache Coherence & MESI Protocol", slug: "cache-coherence-mesi", description: "Snooping vs Directory-based coherence, Modified, Exclusive, Shared, Invalid states.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
  ],
  sampleNote: {
    id: "n-coa-1",
    topic_id: "t-coa-1",
    title: "Von Neumann vs Harvard Architecture & 8 Great Ideas — Official Assignment 1 Note",
    reading_time_min: 20,
    status: "published" as const,
    is_sample: true,
    pdf_url: null,
    content: `### 1. Von Neumann vs Harvard Architecture (COA Assignment 1, Q2)

| Parameter | Von Neumann Architecture | Harvard Architecture |
| :--- | :--- | :--- |
| **Bus Architecture** | Single shared bus for instructions and data | Separate physical buses for instruction memory and data memory |
| **Simultaneous Access** | Cannot fetch instruction & operand at the same time | Fetches next instruction while executing data read/write |
| **Memory Structure** | Unified address space for code and data | Distinct address spaces for programs and data |
| **Bottleneck** | **Von Neumann Bottleneck** limits processor throughput | Eliminated data/instruction bus contention |
| **Implementation Cost** | Simpler control circuitry, lower pin count | Higher pin count and more complex circuit routing |
| **Usage** | General-purpose computing (x86, modern PCs) | DSPs, embedded microcontrollers (AVR, PIC, ARM Cortex-M) |

---

### 2. Eight Great Ideas in Computer Architecture (COA Assignment 1, Q3)
1. **Design for Moore's Law:** Anticipate where silicon technology will be when chip development finishes.
2. **Use Abstraction to Simplify Design:** Design in modular hierarchical layers to hide lower-level silicon complexities.
3. **Make the Common Case Fast:** Optimize frequently executed instructions (e.g. integer adds, branch handling).
4. **Performance via Parallelism:** Execute multiple operations concurrently using superscalar ALUs and multicore units.
5. **Performance via Pipelining:** Overlap instruction execution stages (Fetch, Decode, Execute, Memory, Write-back).
6. **Performance via Prediction:** Speculatively guess branch outcomes and start work earlier rather than stalling.
7. **Hierarchy of Memories:** Exploit temporal and spatial locality with fast, small caches backed by larger, slower RAM.
8. **Dependability via Redundancy:** Include spare modules (ECC parity, RAID) to recover transparently from hardware failures.`,
  },
  pastPapers: [
    {
      id: "p-coa-1",
      subject_id: "sub-cse1003",
      exam_year: 2026,
      exam_type: "Official Assignment 1 & 2 (AY 2026-27)",
      title: "DYPIU COA Assignment 1 & 2 Questions with Model Solutions",
      question_paper_url: "#",
      solution_url: null,
      is_published: true,
    },
    {
      id: "p-coa-2",
      subject_id: "sub-cse1003",
      exam_year: 2025,
      exam_type: "Mid-Term Examination",
      title: "COA Mid-Term Question Paper: Pipelining & Cache Mapping",
      question_paper_url: "#",
      solution_url: null,
      is_published: true,
    },
  ],
};

const fwtDetail = {
  subject: FALLBACK_SUBJECTS[3],
  modules: [
    {
      id: "m-fwt-1",
      subject_id: "sub-cse1004",
      module_number: 1,
      title: "Module I: Introduction to Web & Internet Fundamentals",
      description: "ARPANET evolution, client-server architecture, DNS resolution, HTTP vs HTTPS, and status codes.",
      is_published: true,
      topics: [
        { id: "t-fwt-1", module_id: "m-fwt-1", topic_number: 1, title: "Evolution of Web & ARPANET", slug: "web-evolution-and-arpanet", description: "Packet switching, Tim Berners-Lee, Web 1.0 (static), Web 2.0 (social/interactive), Web 3.0.", estimated_reading_minutes: 20, is_sample: true, is_published: true },
        { id: "t-fwt-2", module_id: "m-fwt-1", topic_number: 2, title: "Client-Server Architecture & DNS", slug: "client-server-and-dns", description: "IP addressing, TCP three-way handshake, and recursive/iterative DNS lookup.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-fwt-3", module_id: "m-fwt-1", topic_number: 3, title: "HTTP/HTTPS Protocols & Status Codes", slug: "http-https-status-codes", description: "GET vs POST, headers, cookies, TLS/SSL handshake, and status codes (200, 301, 400, 404, 500).", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-fwt-2",
      subject_id: "sub-cse1004",
      module_number: 2,
      title: "Module II: HTML5 & Web Page Structuring",
      description: "Semantic elements, lists, tables, forms, input validation, audio/video multimedia, and accessibility.",
      is_published: true,
      topics: [
        { id: "t-fwt-4", module_id: "m-fwt-2", topic_number: 1, title: "Semantic HTML5 Structure", slug: "html5-semantic-elements", description: "header, nav, main, article, section, aside, footer elements for SEO and accessibility.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-fwt-5", module_id: "m-fwt-2", topic_number: 2, title: "HTML Lists, Tables & Forms (Practical 2)", slug: "html-lists-tables-forms", description: "Ordered/unordered lists, table rows/headers/cells (colspan/rowspan), and form input controls.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-fwt-6", module_id: "m-fwt-2", topic_number: 3, title: "HTML5 Multimedia & Canvas (Practical 3)", slug: "html5-multimedia-elements", description: "audio, video tags with controls/autoplay, SVG vector graphics, and 2D canvas drawing.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-fwt-3",
      subject_id: "sub-cse1004",
      module_number: 3,
      title: "Module III: Styling with CSS3",
      description: "CSS box model, selectors, Flexbox layout, CSS Grid, media queries, animations, and responsive design.",
      is_published: true,
      topics: [
        { id: "t-fwt-7", module_id: "m-fwt-3", topic_number: 1, title: "CSS Box Model & Selectors", slug: "css-box-model-selectors", description: "Content, padding, border, margin; specificity hierarchy, pseudo-classes (:hover, :focus).", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-fwt-8", module_id: "m-fwt-3", topic_number: 2, title: "Modern Flexbox & CSS Grid Layouts", slug: "css-flexbox-and-grid", description: "Flex containers, justify-content, align-items, grid-template-columns, and fractional units.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-fwt-9", module_id: "m-fwt-3", topic_number: 3, title: "Responsive Web Design & Media Queries (Practical 4)", slug: "responsive-css-media-queries", description: "Mobile-first design, viewport meta tags, breakpoints, transitions, and keyframe animations.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-fwt-4",
      subject_id: "sub-cse1004",
      module_number: 4,
      title: "Module IV: Client-Side Scripting with JavaScript",
      description: "Modern JavaScript (ES6+), DOM manipulation, event listeners, asynchronous JS, Promises, and Fetch API.",
      is_published: true,
      topics: [
        { id: "t-fwt-10", module_id: "m-fwt-4", topic_number: 1, title: "JavaScript Fundamentals & ES6+ Features", slug: "javascript-es6-fundamentals", description: "let/const vs var, arrow functions, template literals, destructuring, and spread operator.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-fwt-11", module_id: "m-fwt-4", topic_number: 2, title: "DOM Manipulation & Event Handling", slug: "dom-manipulation-events", description: "querySelector, createElement, addEventListener, event bubbling, and form validation.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-fwt-12", module_id: "m-fwt-4", topic_number: 3, title: "Async JavaScript, Promises & Fetch API", slug: "async-javascript-fetch-api", description: "Callback hell, Promise chaining, async/await syntax, and fetching JSON from REST APIs.", estimated_reading_minutes: 30, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-fwt-5",
      subject_id: "sub-cse1004",
      module_number: 5,
      title: "Module V: Server-Side Fundamentals, Tools & Deployment",
      description: "Introduction to Node.js/Express, RESTful APIs, Git/GitHub version control, npm, and deployment pipelines.",
      is_published: true,
      topics: [
        { id: "t-fwt-13", module_id: "m-fwt-5", topic_number: 1, title: "Introduction to Node.js & REST APIs", slug: "nodejs-rest-apis", description: "V8 engine, non-blocking I/O event loop, Express routing, and JSON request/response.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-fwt-14", module_id: "m-fwt-5", topic_number: 2, title: "Git, GitHub & Version Control Workflows", slug: "git-github-workflows", description: "git init, add, commit, branch, merge, pull requests, and merge conflict resolution.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-fwt-15", module_id: "m-fwt-5", topic_number: 3, title: "Modern Web Deployment & Cloudflare Tunnels", slug: "web-deployment-cloudflare", description: "Production builds, static hosting, Docker containers, reverse proxies, and edge SSL tunnels.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
  ],
  sampleNote: {
    id: "n-fwt-1",
    topic_id: "t-fwt-1",
    title: "Web & Internet Fundamentals, HTTP vs HTTPS & DNS — Model Lecture Note",
    reading_time_min: 20,
    status: "published" as const,
    is_sample: true,
    pdf_url: null,
    content: `### 1. Evolution of the Web
- **ARPANET (1969):** Created by US DoD DARPA; introduced packet switching rather than circuit switching.
- **World Wide Web (1989):** Invented by Tim Berners-Lee at CERN using three core technologies:
  1. **HTML:** HyperText Markup Language for formatting.
  2. **URI/URL:** Uniform Resource Identifier for addressing.
  3. **HTTP:** HyperText Transfer Protocol for transport.
- **Web 1.0 (Read-Only):** Static HTML pages, centralized publishing.
- **Web 2.0 (Read-Write / Social):** Dynamic user-generated content, AJAX, social media, single-page apps.
- **Web 3.0 (Read-Write-Execute):** Semantic web, distributed systems, decentralized protocols.

---

### 2. HTTP vs. HTTPS & TLS Handshake
| Feature | HTTP (Port 80) | HTTPS (Port 443) |
| :--- | :--- | :--- |
| **Security** | Plaintext transmission, vulnerable to sniffing & MITM | Encrypted with TLS (Transport Layer Security) |
| **Handshake** | 3-way TCP handshake ($SYN \to SYN-ACK \to ACK$) | TCP Handshake + TLS Cryptographic Handshake |
| **Certificate** | No digital certificate required | Signed X.509 SSL/TLS certificate from CA |
| **Integrity** | Payloads can be tampered in transit | HMAC SHA-256 message authentication ensures tamper-proof delivery |

---

### 3. HTTP Request-Response Lifecycle
1. **Client DNS Resolution:** Client queries local cache, then ISP recursive resolver, Root nameserver, TLD (.org), and Authoritative nameserver to resolve IP.
2. **TCP Connection:** 3-way handshake on port 443.
3. **HTTP GET Request:**
   \`\`\`http
   GET /index.html HTTP/1.1
   Host: example.com
   User-Agent: Mozilla/5.0
   Accept: text/html
   \`\`\`
4. **Server Response:**
   \`\`\`http
   HTTP/1.1 200 OK
   Content-Type: text/html; charset=UTF-8
   Content-Length: 1024
   \`\`\``,
  },
  pastPapers: [
    {
      id: "p-fwt-1",
      subject_id: "sub-cse1004",
      exam_year: 2026,
      exam_type: "Official Practicals 1–4 Manual (AY 2026-27)",
      title: "FWT Lab Manual & Source Code Solutions for Practicals 1, 2, 3 & 4",
      question_paper_url: "#",
      solution_url: null,
      is_published: true,
    },
    {
      id: "p-fwt-2",
      subject_id: "sub-cse1004",
      exam_year: 2025,
      exam_type: "End-Semester Examination",
      title: "Fundamentals of Web Technologies End-Sem Solved Paper",
      question_paper_url: "#",
      solution_url: null,
      is_published: true,
    },
  ],
};

const pythonDetail = {
  subject: FALLBACK_SUBJECTS[4],
  modules: [
    {
      id: "m-pyt-1",
      subject_id: "sub-cse1005",
      module_number: 1,
      title: "Module I: Introduction to Python",
      description: "Features of Python, dynamic typing, operators, input/output, and fundamental data types.",
      is_published: true,
      topics: [
        { id: "t-pyt-1", module_id: "m-pyt-1", topic_number: 1, title: "Python Architecture & Features", slug: "python-architecture-features", description: "Interpreted bytecode (.pyc), dynamic typing, automatic memory management, garbage collection.", estimated_reading_minutes: 15, is_sample: true, is_published: true },
        { id: "t-pyt-2", module_id: "m-pyt-1", topic_number: 2, title: "Variables, Expressions & Operators", slug: "variables-and-operators", description: "Arithmetic, relational, logical, bitwise, identity (is), and membership (in) operators.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-pyt-3", module_id: "m-pyt-1", topic_number: 3, title: "Standard I/O & Type Casting", slug: "python-io-type-casting", description: "input(), print() with sep/end, implicit vs explicit type casting (int, float, str).", estimated_reading_minutes: 15, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-pyt-2",
      subject_id: "sub-cse1005",
      module_number: 2,
      title: "Module II: Control Structures & Functions",
      description: "Conditional branching (if-elif-else), loops (for, while), loop control statements, functions, and lambda.",
      is_published: true,
      topics: [
        { id: "t-pyt-4", module_id: "m-pyt-2", topic_number: 1, title: "Conditional Statements & Ternary Operator", slug: "conditional-statements-ternary", description: "Nested if-else, truthy/falsy evaluation, and inline ternary conditional expressions.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-pyt-5", module_id: "m-pyt-2", topic_number: 2, title: "Loops & Loop Control (break, continue, pass)", slug: "loops-and-control-flow", description: "for loops with range(), while loops, loop else clauses, break, continue, and pass.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-pyt-6", module_id: "m-pyt-2", topic_number: 3, title: "Functions, Parameters (*args, **kwargs) & Recursion", slug: "functions-args-kwargs-recursion", description: "Default arguments, variable length arguments, recursion depth, and LEGB variable scope.", estimated_reading_minutes: 30, is_sample: false, is_published: true },
        { id: "t-pyt-7", module_id: "m-pyt-2", topic_number: 4, title: "Lambda Functions & Higher-Order Functions", slug: "lambda-map-filter-reduce", description: "Anonymous functions, map(), filter(), reduce() from functools, and closures.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-pyt-3",
      subject_id: "sub-cse1005",
      module_number: 3,
      title: "Module III: Data Structures in Python",
      description: "Strings, Lists, Tuples, Sets, Dictionaries, List Comprehensions, and Regular Expressions (re).",
      is_published: true,
      topics: [
        { id: "t-pyt-8", module_id: "m-pyt-3", topic_number: 1, title: "Strings & String Slicing Methods", slug: "strings-and-string-methods", description: "Immutability, slicing s[start:stop:step], split(), join(), format(), f-strings.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-pyt-9", module_id: "m-pyt-3", topic_number: 2, title: "Lists, Tuples & Comprehensions", slug: "lists-tuples-comprehensions", description: "List methods append/extend/sort, tuple packing/unpacking, and list comprehensions.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-pyt-10", module_id: "m-pyt-3", topic_number: 3, title: "Dictionaries & Sets", slug: "dictionaries-and-sets", description: "Hash tables, keys(), values(), items(), dictionary comprehension, set operations.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-pyt-11", module_id: "m-pyt-3", topic_number: 4, title: "Regular Expressions (re module)", slug: "python-regular-expressions", description: "Regex syntax, re.search(), re.match(), re.findall(), re.sub(), character classes, quantifiers.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-pyt-4",
      subject_id: "sub-cse1005",
      module_number: 4,
      title: "Module IV: Object-Oriented Programming & File Handling",
      description: "Classes, objects, constructors, inheritance, polymorphism, encapsulation, file I/O, and exceptions.",
      is_published: true,
      topics: [
        { id: "t-pyt-12", module_id: "m-pyt-4", topic_number: 1, title: "Classes, Objects & __init__ Constructor", slug: "classes-objects-constructors", description: "Instance variables vs class variables, self reference, methods.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-pyt-13", module_id: "m-pyt-4", topic_number: 2, title: "Inheritance, Polymorphism & MRO", slug: "inheritance-polymorphism-mro", description: "Single, multiple, multilevel inheritance, super(), Method Resolution Order, method overriding.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-pyt-14", module_id: "m-pyt-4", topic_number: 3, title: "File Handling & Exception Handling", slug: "file-handling-exceptions", description: "with open() text/CSV reading/writing, try-except-finally blocks, custom exceptions.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-pyt-5",
      subject_id: "sub-cse1005",
      module_number: 5,
      title: "Module V: Python Libraries & Applications (NumPy, Pandas)",
      description: "NumPy arrays, vectorization, Pandas Series and DataFrames, data cleaning, and basic visualization.",
      is_published: true,
      topics: [
        { id: "t-pyt-15", module_id: "m-pyt-5", topic_number: 1, title: "NumPy Basics & Vectorized Arrays", slug: "numpy-basics-vectorization", description: "ndarray creation, indexing, slicing, broadcasting, matrix arithmetic.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-pyt-16", module_id: "m-pyt-5", topic_number: 2, title: "Pandas Series & DataFrames", slug: "pandas-dataframes-operations", description: "Reading CSV/Excel, indexing with loc/iloc, filtering, groupby, and descriptive stats.", estimated_reading_minutes: 30, is_sample: false, is_published: true },
        { id: "t-pyt-17", module_id: "m-pyt-5", topic_number: 3, title: "Data Visualization with Matplotlib", slug: "matplotlib-data-visualization", description: "Line plots, bar charts, histograms, scatter plots, and formatting figures.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
      ],
    },
  ],
  sampleNote: {
    id: "n-pyt-1",
    topic_id: "t-pyt-1",
    title: "Python Architecture, Memory Model & Execution Pipeline — Verified Notes",
    reading_time_min: 15,
    status: "published" as const,
    is_sample: true,
    pdf_url: null,
    content: `### 1. Python Execution Pipeline
When a Python script \`program.py\` executes:
1. **Source Code Parsing:** Source is parsed into an Abstract Syntax Tree (AST).
2. **Bytecode Compilation:** Compiled into platform-independent intermediate bytecode (\`.pyc\` stored in \`__pycache__\`).
3. **Python Virtual Machine (PVM):** The PVM executes bytecode instructions using an evaluation loop.

---

### 2. Everything is an Object & Memory References
In Python, variables do not store values directly; they store **memory references (pointers)** to objects created in the heap memory:

\`\`\`python
a = [1, 2, 3]
b = a          # b points to the exact same object in memory!
b.append(4)
print(a)       # Output: [1, 2, 3, 4]

# To create an independent shallow copy:
c = a.copy()   # or a[:]
\`\`\`

---

### 3. Mutability vs Immutability
- **Immutable Types:** \`int\`, \`float\`, \`str\`, \`tuple\`, \`frozenset\`, \`bool\`. Modifying them creates a completely new object in memory.
- **Mutable Types:** \`list\`, \`dict\`, \`set\`, \`bytearray\`. Can be modified in place without changing memory address (\`id()\`).`,
  },
  pastPapers: [
    {
      id: "p-pyt-1",
      subject_id: "sub-cse1005",
      exam_year: 2026,
      exam_type: "Official Lab Notes & Exercises (AY 2026-27)",
      title: "Module 2 & 3 Python Lab Exercise Sheet with Faculty Solutions",
      question_paper_url: "#",
      solution_url: null,
      is_published: true,
    },
    {
      id: "p-pyt-2",
      subject_id: "sub-cse1005",
      exam_year: 2025,
      exam_type: "End-Semester Examination",
      title: "Python Programming End-Sem Coding & Theory Exam Solved",
      question_paper_url: "#",
      solution_url: null,
      is_published: true,
    },
  ],
};

const iksDetail = {
  subject: FALLBACK_SUBJECTS[5],
  modules: [
    {
      id: "m-iks-1",
      subject_id: "sub-cse1006",
      module_number: 1,
      title: "Module I: Introduction to IKS",
      description: "Framework of ancient Indian knowledge systems, Vedic and classical literature, epistemology, and oral traditions.",
      is_published: true,
      topics: [
        { id: "t-iks-1", module_id: "m-iks-1", topic_number: 1, title: "Framework of Ancient Indian Knowledge Systems", slug: "iks-framework-foundations", description: "Vedas, Upavedas, Vedangas, Darshanas (philosophical schools), and epistemic methods (Pramanas).", estimated_reading_minutes: 20, is_sample: true, is_published: true },
        { id: "t-iks-2", module_id: "m-iks-1", topic_number: 2, title: "Oral Transmission & Memorization Techniques", slug: "oral-transmission-vedic-chanting", description: "Patha techniques (Samhita, Pada, Krama, Jata, Ghana) ensuring error-free preservation over millennia.", estimated_reading_minutes: 15, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-iks-2",
      subject_id: "sub-cse1006",
      module_number: 2,
      title: "Module II: Language & Art Studies in India",
      description: "Panini's Sanskrit grammar as computational linguistics, acoustic phonetics, and traditional architecture (Vastu Shastra).",
      is_published: true,
      topics: [
        { id: "t-iks-3", module_id: "m-iks-2", topic_number: 1, title: "Panini's Ashtadhyayi & Computational Linguistics", slug: "panini-ashtadhyayi-linguistics", description: "Formal grammar, generative rules, auxiliary symbols (it markers), and equivalence to Backus-Naur Form.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-iks-4", module_id: "m-iks-2", topic_number: 2, title: "Classical Indian Architecture & Vastu Vidya", slug: "classical-architecture-vastu", description: "Town planning, temple geometry (mandala geometry, fractal shikharas), acoustic design.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-iks-3",
      subject_id: "sub-cse1006",
      module_number: 3,
      title: "Module III: Indian Science & Technology",
      description: "Mathematical references in Sulba Sutras, Baudhayana theorem, Aryabhata zero, astronomy, metallurgy, and Wootz steel.",
      is_published: true,
      topics: [
        { id: "t-iks-5", module_id: "m-iks-3", topic_number: 1, title: "Mathematics in Sulba Sutras & Aryabhata", slug: "sulba-sutras-and-aryabhata", description: "Baudhayana geometric theorem (pre-Pythagoras), invention of zero (Shunya), decimal place value, approximations of pi.", estimated_reading_minutes: 25, is_sample: false, is_published: true },
        { id: "t-iks-6", module_id: "m-iks-3", topic_number: 2, title: "Indian Metallurgy & Wootz Steel", slug: "indian-metallurgy-wootz-steel", description: "Crucible steel manufacturing, corrosion-resistant Delhi Iron Pillar, zinc smelting at Zawar.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
      ],
    },
    {
      id: "m-iks-4",
      subject_id: "sub-cse1006",
      module_number: 4,
      title: "Module IV: Indian Agriculture & Economy",
      description: "Ancient agricultural practices, Krishi Parashara, water harvesting stepwells, and historic trade routes.",
      is_published: true,
      topics: [
        { id: "t-iks-7", module_id: "m-iks-4", topic_number: 1, title: "Krishi Shastra & Traditional Water Harvesting", slug: "krishi-shastra-water-harvesting", description: "Rainwater management, stepwells (Baolis/Vavs), check dams, and organic soil ecology.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
        { id: "t-iks-8", module_id: "m-iks-4", topic_number: 2, title: "Economic Thought & Historic Trade Networks", slug: "arthashastra-and-trade-networks", description: "Kautilya's Arthashastra economic principles, guild systems (Shrenis), and maritime silk/spice routes.", estimated_reading_minutes: 20, is_sample: false, is_published: true },
      ],
    },
  ],
  sampleNote: {
    id: "n-iks-1",
    topic_id: "t-iks-1",
    title: "Indian Knowledge Systems (IKS) — Conceptual Overview & Epistemology",
    reading_time_min: 15,
    status: "published" as const,
    is_sample: true,
    pdf_url: null,
    content: `### 1. Framework of Indian Knowledge Systems (IKS)
The Indian Knowledge System is historically structured into **14 Vidyasthanas** (branches of knowledge):
1. **Four Vedas:** Rigveda, Yajurveda, Samaveda, Atharvaveda.
2. **Six Vedangas:** Shiksha (Phonetics), Kalpa (Ritual/Geometry), Vyakarana (Grammar), Nirukta (Etymology), Chandas (Metre), Jyotisha (Astronomy/Mathematics).
3. **Four Upangas:** Mimamsa (Interpretation), Nyaya (Logic & Epistemology), Purana (History/Cosmology), Dharma Shastra (Ethics & Law).

---

### 2. Computational Foundations: Panini's Ashtadhyayi
Written in the 4th century BCE, Panini's *Ashtadhyayi* contains approximately 4,000 algorithmic rules (*sutras*) that formalize Sanskrit syntax.
- **Formal Grammar Equivalence:** Renowned computer scientists (including Leonard Bloomfield and Noam Chomsky) recognize Panini's grammar as the world's first formal generative grammar, directly anticipating Backus-Naur Form (BNF) used in modern computer compiler construction.
- **Auxiliary Symbols (*It* Markers):** Used as meta-syntactic markers to control rule applications and scoping, identical to modern programming language compiler passes.`,
  },
  pastPapers: [
    {
      id: "p-iks-1",
      subject_id: "sub-cse1006",
      exam_year: 2026,
      exam_type: "Official Review Questions (AY 2026-27)",
      title: "IKS Semester 1 Question Bank with Complete Explanatory Answers",
      question_paper_url: "#",
      solution_url: null,
      is_published: true,
    },
  ],
};

export const FALLBACK_SUBJECT_DETAILS: Record<
  string,
  {
    subject: PmuSubject;
    modules: PmuModule[];
    sampleNote: PmuNote;
    pastPapers: PmuPastPaper[];
  }
> = {
  // CSE1001
  "applied-computational-mathematics": acmDetail,
  // CSE1002 (support canonical + legacy slug)
  "basic-electrical-and-electronics-engineering": beeeDetail,
  "basic-electrical-engineering": beeeDetail,
  // CSE1003 (support canonical + legacy slug)
  "computer-organization-and-architecture": coaDetail,
  "computer-organisation-and-architecture": coaDetail,
  // CSE1004
  "fundamentals-of-web-technologies": fwtDetail,
  // CSE1005
  "python-programming": pythonDetail,
  // CSE1006
  "indian-science-engineering-and-technology": iksDetail,
};
