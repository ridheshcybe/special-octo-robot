export interface MobileSubjectModule {
  number: number;
  title: string;
  topics: string[];
}

export interface MobileSubject {
  code: string;
  slug: string;
  title: string;
  shortTitle: string;
  credits: number;
  badge: string;
  description: string;
  moduleCount: number;
  topicCount: number;
  simulators: { title: string; slug: string }[];
  modules: MobileSubjectModule[];
}

export const SEMESTER_1_SUBJECTS: MobileSubject[] = [
  {
    code: "CSE1001",
    slug: "applied-computational-mathematics",
    title: "Applied Computational Mathematics",
    shortTitle: "Applied Maths",
    credits: 4,
    badge: "Semester 1 core",
    description:
      "Linear algebra, rank and echelon forms, eigenvalues, multivariable calculus, ordinary differential equations, and vector calculus.",
    moduleCount: 5,
    topicCount: 16,
    simulators: [
      { title: "Matrix Rank & Row Echelon Visualizer", slug: "matrix-row-echelon" },
      { title: "Gradient Descent & Partial Derivatives 3D", slug: "gradient-descent" },
    ],
    modules: [
      {
        number: 1,
        title: "Matrices & System of Linear Equations",
        topics: [
          "Rank of a Matrix & Echelon Form",
          "Gauss Elimination & Gauss-Jordan Method",
          "Consistency of Linear Systems (Rouche's Theorem)",
        ],
      },
      {
        number: 2,
        title: "Eigenvalues, Eigenvectors & Diagonalization",
        topics: [
          "Characteristic Equation & Eigen Spectrum",
          "Cayley-Hamilton Theorem & Matrix Inverse",
          "Orthogonal Transformation & Quadratic Forms",
        ],
      },
      {
        number: 3,
        title: "Differential Calculus of Several Variables",
        topics: [
          "Partial Derivatives & Euler's Theorem",
          "Total Derivative & Jacobian Determinants",
          "Taylor's Expansion & Maxima/Minima (Lagrange Multipliers)",
        ],
      },
      {
        number: 4,
        title: "Ordinary Differential Equations",
        topics: [
          "Exact First-Order ODEs & Integrating Factors",
          "Higher-Order Linear ODEs with Constant Coefficients",
          "Method of Variation of Parameters & Cauchy-Euler Equations",
        ],
      },
      {
        number: 5,
        title: "Vector Calculus & Integral Theorems",
        topics: [
          "Gradient, Divergence & Curl Operations",
          "Line, Surface & Volume Integrals",
          "Green's, Stokes' & Gauss Divergence Theorems",
        ],
      },
    ],
  },
  {
    code: "CSE1002",
    slug: "basic-electrical-and-electronics-engineering",
    title: "Basic Electrical & Electronics Engineering",
    shortTitle: "Basic Electrical (BEE)",
    credits: 4,
    badge: "Hardware labs",
    description:
      "DC/AC network theorems, resonance, PN junction diodes, rectifiers, BJT & MOSFET amplifiers, and operational amplifiers.",
    moduleCount: 5,
    topicCount: 17,
    simulators: [
      { title: "Ohm's Law & KCL/KVL Mesh Analyzer", slug: "kcl-kvl-mesh" },
      { title: "AC RLC Phasor & Resonance Oscilloscope", slug: "rlc-phasor" },
      { title: "PN Diode & Bridge Rectifier Waveform Lab", slug: "bridge-rectifier" },
    ],
    modules: [
      {
        number: 1,
        title: "DC Network Analysis & Theorems",
        topics: [
          "Ohm's Law, KCL & KVL Mesh/Nodal Analysis",
          "Superposition & Thevenin's / Norton's Theorems",
          "Maximum Power Transfer & Star-Delta Transformations",
        ],
      },
      {
        number: 2,
        title: "Single-Phase & Three-Phase AC Circuits",
        topics: [
          "RMS, Average Values, Form Factor & Phasor Representation",
          "Series & Parallel RLC Circuits & Resonance",
          "Real, Reactive & Apparent Power Factor Correction",
        ],
      },
      {
        number: 3,
        title: "Semiconductor Diodes & Rectifier Circuits",
        topics: [
          "PN Junction Energy Bands & V-I Characteristics",
          "Half-Wave, Center-Tapped & Bridge Full-Wave Rectifiers",
          "Zener Diode Voltage Regulator & Clipper/Clamper Circuits",
        ],
      },
      {
        number: 4,
        title: "Bipolar Junction Transistors & MOSFETs",
        topics: [
          "BJT CB, CE, CC Configurations & Load Line Biasing",
          "MOSFET Enhancement/Depletion Modes & CMOS Inverter",
          "Small-Signal Amplifier Gain Analysis",
        ],
      },
      {
        number: 5,
        title: "Operational Amplifiers & Digital Logic Basics",
        topics: [
          "Ideal Op-Amp Characteristics, Inverting & Non-Inverting Modes",
          "Op-Amp Summing, Integrator & Differentiator Circuits",
          "Boolean Algebra, Logic Gates & De Morgan's Theorems",
        ],
      },
    ],
  },
  {
    code: "CSE1003",
    slug: "computer-organization-and-architecture",
    title: "Computer Organization & Architecture",
    shortTitle: "Computer Architecture",
    credits: 4,
    badge: "Core architecture",
    description:
      "Von Neumann vs Harvard architecture, IEEE-754 floating point, Booth multiplication, 5-stage RISC pipelining, and cache memory.",
    moduleCount: 5,
    topicCount: 18,
    simulators: [
      { title: "5-Stage RISC Pipeline & Hazard Visualizer", slug: "risc-pipeline" },
      { title: "Cache Direct/Associative Mapping Simulator", slug: "cache-mapping" },
      { title: "Booth's Signed Multiplication Step Tracer", slug: "booth-multiplier" },
    ],
    modules: [
      {
        number: 1,
        title: "Computer Abstractions & ISA Foundations",
        topics: [
          "Von Neumann vs Harvard Architecture & 8 Great Ideas",
          "CPU Performance Equation, CPI & Amdahl's Law",
          "Instruction Formats & Addressing Modes",
        ],
      },
      {
        number: 2,
        title: "Computer Arithmetic & ALU Design",
        topics: [
          "2's Complement Carry-Lookahead Adder",
          "Booth's Multiplication & Restoring Division Algorithm",
          "IEEE 754 Single & Double Precision Floating-Point",
        ],
      },
      {
        number: 3,
        title: "Processor Datapath & Control Unit",
        topics: [
          "Single-Cycle vs Multi-Cycle Datapath Execution",
          "Hardwired vs Microprogrammed Control Unit",
          "Instruction Fetch, Decode, Execute & Writeback",
        ],
      },
      {
        number: 4,
        title: "Instruction Pipelining & Hazards",
        topics: [
          "5-Stage RISC Pipeline Throughput & Speedup",
          "Structural, Data (RAW/WAR/WAW) & Control Hazards",
          "Data Forwarding, Stall Insertion & Branch Prediction",
        ],
      },
      {
        number: 5,
        title: "Memory Hierarchy, Cache & I/O Organization",
        topics: [
          "Locality of Reference & Average Memory Access Time (AMAT)",
          "Direct, Fully Associative & Set-Associative Cache Mapping",
          "LRU/FIFO Replacement, Write-Back & DMA / Interrupt I/O",
        ],
      },
    ],
  },
  {
    code: "CSE1004",
    slug: "fundamentals-of-web-technologies",
    title: "Fundamentals of Web Technologies",
    shortTitle: "Web Technologies",
    credits: 3,
    badge: "Full-stack labs",
    description:
      "DNS, HTTP/HTTPS protocols, semantic HTML5, CSS3 Flexbox and Grid layouts, JavaScript DOM manipulation, async fetch, and REST APIs.",
    moduleCount: 5,
    topicCount: 15,
    simulators: [
      { title: "CSS Flexbox & Grid Interactive Sandbox", slug: "css-layout-sandbox" },
      { title: "HTTP Request/Response & DOM Event Loop Tracer", slug: "event-loop" },
    ],
    modules: [
      {
        number: 1,
        title: "Internet Architecture & HTTP Protocol",
        topics: [
          "DNS Resolution, TCP/IP Handshake & Client-Server Model",
          "HTTP/1.1 vs HTTP/2, Methods, Status Codes & Headers",
          "HTTPS TLS Encryption, Cookies & Web Sessions",
        ],
      },
      {
        number: 2,
        title: "Semantic HTML5 & Accessibility",
        topics: [
          "Document Structure, Semantic Tags & SEO Metadata",
          "HTML5 Forms, Input Validation & Multimedia Elements",
          "WCAG Accessibility & ARIA Roles",
        ],
      },
      {
        number: 3,
        title: "Modern CSS3, Box Model, Flexbox & Grid",
        topics: [
          "Selector Specificity, Cascade & CSS Box Model",
          "Responsive Design with Flexbox & CSS Grid",
          "Media Queries, Custom Properties & Keyframe Transitions",
        ],
      },
      {
        number: 4,
        title: "JavaScript ES6+ & DOM Manipulation",
        topics: [
          "Lexical Scope, Closures, Arrow Functions & Destructuring",
          "DOM Tree Traversal, Event Bubbling & Delegation",
          "Event Loop, Promises, Async/Await & Fetch API",
        ],
      },
      {
        number: 5,
        title: "REST APIs, JSON & Full-Stack Deployment",
        topics: [
          "RESTful Architecture, JSON Serialization & CORS",
          "Client Storage: LocalStorage, SessionStorage & Cookies",
          "Web Security Fundamentals (XSS, CSRF) & Cloud Hosting",
        ],
      },
    ],
  },
  {
    code: "CSE1005",
    slug: "python-programming",
    title: "Python Programming",
    shortTitle: "Python Programming",
    credits: 4,
    badge: "Coding lab",
    description:
      "Dynamic typing, control structures, recursion, list/dict comprehensions, file handling, OOP design, and NumPy/Pandas foundations.",
    moduleCount: 5,
    topicCount: 17,
    simulators: [
      { title: "Python Call Stack & Recursion Frame Tracer", slug: "python-call-stack" },
      { title: "List Slicing & Memory Reference Visualizer", slug: "python-memory" },
    ],
    modules: [
      {
        number: 1,
        title: "Python Foundations, Types & Control Flow",
        topics: [
          "Bytecode Execution, Dynamic Typing & Mutability",
          "Operators, Precedence & Conditional Branching",
          "While/For Loops, Break, Continue & Range Iterators",
        ],
      },
      {
        number: 2,
        title: "Functions, Recursion & Functional Tools",
        topics: [
          "Positional, Keyword, *args & **kwargs Parameters",
          "LEGB Scope Rule, Recursion & Call Stack Frames",
          "Lambda Expressions, Map, Filter & Generators",
        ],
      },
      {
        number: 3,
        title: "Core Data Structures & String Processing",
        topics: [
          "Lists, Slicing, Shallow vs Deep Copy & Comprehensions",
          "Tuples, Sets & Hash-Table Dictionary Operations",
          "String Formatting, Slicing & Regular Expressions (re)",
        ],
      },
      {
        number: 4,
        title: "File I/O, Exceptions & Object-Oriented Programming",
        topics: [
          "Context Managers (with), Text/CSV/JSON File I/O",
          "Try-Except-Else-Finally & Custom Exception Hierarchies",
          "Classes, __init__, Inheritance, Polymorphism & Dunder Methods",
        ],
      },
      {
        number: 5,
        title: "Scientific Computing with NumPy & Pandas",
        topics: [
          "NumPy N-Dimensional Arrays, Broadcasting & Vectorization",
          "Pandas Series, DataFrames, Indexing & GroupBy Aggregation",
          "Data Cleaning & Matplotlib Visualization Basics",
        ],
      },
    ],
  },
  {
    code: "CSE1006",
    slug: "indian-science-engineering-and-technology",
    title: "Indian Science, Engineering & Technology",
    shortTitle: "Indian Knowledge Systems",
    credits: 2,
    badge: "Knowledge systems",
    description:
      "Ancient Indian mathematics, Sulba Sutras geometry, Pingala binary prosody, Panini formal grammar, Wootz metallurgy, and astronomy.",
    moduleCount: 5,
    topicCount: 10,
    simulators: [
      { title: "Pingala Binary Chandas & Meru Prastara Explorer", slug: "pingala-binary" },
      { title: "Sulba Sutra Geometric Altar & √2 Approximation", slug: "sulba-geometry" },
    ],
    modules: [
      {
        number: 1,
        title: "Foundations of Indian Knowledge Systems (IKS)",
        topics: [
          "Classification of Chaturdasha Vidyasthanas & Darshanas",
          "Oral Transmission Mnemonics (Pathas) & Manuscript Traditions",
        ],
      },
      {
        number: 2,
        title: "Classical Indian Mathematics & Algorithmic Thought",
        topics: [
          "Decimal Place-Value System, Zero & Sulba Sutras Geometry",
          "Pingala's Binary Prosody, Meru Prastara & Kerala School Series",
        ],
      },
      {
        number: 3,
        title: "Paninian Formal Linguistics & Computation",
        topics: [
          "Ashtadhyayi Meta-Rules, Shiva Sutras & Context-Sensitive Grammar",
          "Backus-Naur Form (BNF) Parallels & Knowledge Representation",
        ],
      },
      {
        number: 4,
        title: "Ancient Metallurgy, Materials & Civil Engineering",
        topics: [
          "Wootz Crucible Steel, Delhi Iron Pillar & Zinc Distillation",
          "Harappan Urban Planning, Stepwells & Hydraulic Engineering",
        ],
      },
      {
        number: 5,
        title: "Indian Astronomy, Calendar Systems & Ecology",
        topics: [
          "Siddhantic Planetary Models, Yuga Cycles & Jantar Mantar Instruments",
          "Traditional Water Harvesting & Sustainable Agro-Ecology",
        ],
      },
    ],
  },
];

export interface MobileTrack {
  slug: string;
  title: string;
  badge: string;
  status: "live" | "coming_soon";
  courseCount: number;
  description: string;
  highlight: string;
}

export const LEARNING_TRACKS: MobileTrack[] = [
  {
    slug: "btech-cse-aiml",
    title: "B.Tech CSE AI/ML (Semester 1)",
    badge: "Free for everyone",
    status: "live",
    courseCount: 6,
    description:
      "Complete Semester 1 coursework across Applied Computational Mathematics, BEE, COA, Web Technologies, Python Programming, and IKS.",
    highlight: "6 core subjects • 30 modules • 93 topic notes • 17 interactive simulators",
  },
  {
    slug: "cybersecurity",
    title: "CyberSecurity Foundations & SOC",
    badge: "Under construction • Coming soon",
    status: "coming_soon",
    courseCount: 1,
    description:
      "Defensive security operations, HTTP/cookie header analysis, packet inspection, and browser sandbox CTF challenges.",
    highlight: "Currently under construction — check back soon",
  },
  {
    slug: "cloud-computing-aws",
    title: "Cloud Computing (AWS)",
    badge: "Under construction • Coming soon",
    status: "coming_soon",
    courseCount: 1,
    description:
      "Cloud architecture fundamentals, IAM security, VPC networking, EC2/S3/Lambda serverless deployment, and cost optimization.",
    highlight: "Currently under construction — check back soon",
  },
];
