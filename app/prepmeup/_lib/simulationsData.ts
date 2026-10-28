export interface SimulationMeta {
  slug: string;
  title: string;
  category: "bee" | "python";
  componentKey: string;
  summary: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedMinutes: number;
  subjectCode: string;
  subjectSlug: string;
  subjectName: string;
  theoryFormula: string;
  theoryGuide: string[];
}

export const SIMULATIONS_REGISTRY: Record<string, SimulationMeta> = {
  // --- Basic Electrical Engineering (BEE) ---
  "ohms-law": {
    slug: "ohms-law",
    title: "Ohm's Law & Power Dissipation",
    category: "bee",
    componentKey: "OhmsLawSim",
    summary: "Interact with voltage and resistance controls to observe dynamic electron flow and heat dissipation.",
    difficulty: "Beginner",
    estimatedMinutes: 10,
    subjectCode: "EE101",
    subjectSlug: "basic-electrical-engineering",
    subjectName: "Basic Electrical & Electronics Engineering",
    theoryFormula: "I = \\frac{V}{R}, \\quad P = V \\cdot I = I^2 \\cdot R = \\frac{V^2}{R}",
    theoryGuide: [
      "Ohm's Law states that electric current through a conductor is directly proportional to voltage and inversely proportional to resistance.",
      "Power dissipation ($P$) represents the rate at which electrical energy converts to thermal energy.",
      "Excessive power causes resistor overheating when current exceeds standard wattage ratings.",
    ],
  },
  "resistor-network": {
    slug: "resistor-network",
    title: "Series & Parallel Resistor Networks",
    category: "bee",
    componentKey: "ResistorNetworkSim",
    summary: "Construct multi-resistor combinations to inspect voltage drops and current branching across branches.",
    difficulty: "Intermediate",
    estimatedMinutes: 15,
    subjectCode: "EE101",
    subjectSlug: "basic-electrical-engineering",
    subjectName: "Basic Electrical & Electronics Engineering",
    theoryFormula: "R_{series} = \\sum R_i, \\quad \\frac{1}{R_{parallel}} = \\sum \\frac{1}{R_i}",
    theoryGuide: [
      "In a series circuit, current remains identical across all components while voltages add up: $V_{total} = V_1 + V_2 + ...$",
      "In parallel circuits, voltage is identical across all branches while total current divides according to branch conductance.",
    ],
  },
  "power-energy": {
    slug: "power-energy",
    title: "Electric Power & Energy Consumed",
    category: "bee",
    componentKey: "PowerEnergySim",
    summary: "Simulate electrical energy consumption in Joules and kilowatt-hours (kWh) with real-world appliance comparisons.",
    difficulty: "Beginner",
    estimatedMinutes: 10,
    subjectCode: "EE101",
    subjectSlug: "basic-electrical-engineering",
    subjectName: "Basic Electrical & Electronics Engineering",
    theoryFormula: "E = P \\times t = (V \\times I) \\times t \\quad [\\text{Joules or kWh}]",
    theoryGuide: [
      "1 Kilowatt-hour (kWh) equals $3.6 \\times 10^6$ Joules and represents standard utility billing units.",
      "Energy consumed is directly proportional to operating wattage and duration in hours.",
    ],
  },
  "ac-waveform": {
    slug: "ac-waveform",
    title: "AC Waveform & Phasor Oscilloscope",
    category: "bee",
    componentKey: "ACWaveformSim",
    summary: "Adjust peak amplitude, angular frequency, and phase shift on an animated virtual oscilloscope display.",
    difficulty: "Intermediate",
    estimatedMinutes: 15,
    subjectCode: "EE101",
    subjectSlug: "basic-electrical-engineering",
    subjectName: "Basic Electrical & Electronics Engineering",
    theoryFormula: "v(t) = V_m \\sin(\\omega t + \\phi), \\quad V_{rms} = \\frac{V_m}{\\sqrt{2}} \\approx 0.707 V_m",
    theoryGuide: [
      "RMS (Root Mean Square) voltage represents the equivalent DC heating capability of a periodic alternating signal.",
      "Angular frequency $\\omega = 2\\pi f$ dictates the oscillation rate in radians per second.",
    ],
  },
  "kirchhoff-laws": {
    slug: "kirchhoff-laws",
    title: "Kirchhoff's Laws (KCL & KVL) Practice",
    category: "bee",
    componentKey: "KirchhoffSim",
    summary: "Solve two-mesh circuits interactively by verifying nodal current sums and closed-loop mesh equations.",
    difficulty: "Advanced",
    estimatedMinutes: 20,
    subjectCode: "EE101",
    subjectSlug: "basic-electrical-engineering",
    subjectName: "Basic Electrical & Electronics Engineering",
    theoryFormula: "\\sum I_{node} = 0 \\quad (\\text{KCL}), \\quad \\sum V_{loop} = 0 \\quad (\\text{KVL})",
    theoryGuide: [
      "Kirchhoff's Current Law (KCL) is based on the conservation of electric charge at any junction node.",
      "Kirchhoff's Voltage Law (KVL) is based on the conservation of energy around any closed loop.",
    ],
  },

  // --- Python Programming ---
  "variable-memory": {
    slug: "variable-memory",
    title: "Variable Identity & Memory Stack/Heap",
    category: "python",
    componentKey: "VariableMemorySim",
    summary: "Visualize Python stack references pointing to heap memory objects, variable ids, and mutability behavior.",
    difficulty: "Beginner",
    estimatedMinutes: 12,
    subjectCode: "CS101",
    subjectSlug: "python-programming",
    subjectName: "Python Programming & Algorithmic Thinking",
    theoryFormula: "\\text{Stack} \\to \\text{Pointer} \\to \\text{Heap Object}(\\text{Type}, \\text{Value}, \\text{id})",
    theoryGuide: [
      "In Python, variables are named references (pointers) stored on the call stack that point to allocated objects in heap memory.",
      "Immutable types (int, float, str, tuple) allocate new heap objects on reassignment.",
      "Mutable objects (list, dict, set) can be modified in-place without altering their memory address `id()`.",
    ],
  },
  "loop-tracer": {
    slug: "loop-tracer",
    title: "Interactive Loop State Tracer",
    category: "python",
    componentKey: "LoopExecutionSim",
    summary: "Step forward, step back, and inspect variable accumulator states through for-loops and while-loops.",
    difficulty: "Beginner",
    estimatedMinutes: 10,
    subjectCode: "CS101",
    subjectSlug: "python-programming",
    subjectName: "Python Programming & Algorithmic Thinking",
    theoryFormula: "\\text{for } i \\in \\text{range}(a, b, step): \\; S_{k+1} = f(S_k, i)",
    theoryGuide: [
      "A loop consists of initialization, condition evaluation, loop body execution, and state step progression.",
      "Step-by-step tracing allows inspection of off-by-one errors and loop invariants.",
    ],
  },
  "call-stack": {
    slug: "call-stack",
    title: "Function Call Stack & Recursion Visualizer",
    category: "python",
    componentKey: "CallStackSim",
    summary: "Inspect activation frame allocation, argument binding, stack growth, and unwind behavior during recursion.",
    difficulty: "Intermediate",
    estimatedMinutes: 18,
    subjectCode: "CS101",
    subjectSlug: "python-programming",
    subjectName: "Python Programming & Algorithmic Thinking",
    theoryFormula: "\\text{Base Case}: T(0)=c, \\quad \\text{Recursive Step}: T(n) = T(n-1) + O(1)",
    theoryGuide: [
      "Each function call creates a new stack frame storing local variables, formal parameters, and return address.",
      "When the base case is reached, stack frames pop in Last-In-First-Out (LIFO) order.",
    ],
  },
  "data-structures": {
    slug: "data-structures",
    title: "List Indexing & Dictionary Hash Buckets",
    category: "python",
    componentKey: "DataStructureSim",
    summary: "Explore dynamic array resizing, negative index mapping (-1, -2), and key-value hash bucket collisions.",
    difficulty: "Intermediate",
    estimatedMinutes: 15,
    subjectCode: "CS101",
    subjectSlug: "python-programming",
    subjectName: "Python Programming & Algorithmic Thinking",
    theoryFormula: "\\text{Index Mapping}: -k \\iff n - k, \\quad \\text{Bucket} = \\text{hash}(key) \\pmod m",
    theoryGuide: [
      "Python lists are contiguous arrays of pointers supporting O(1) random access and amortized O(1) appends.",
      "Negative indices access items relative to list end without calculating `len(lst) - 1` manually.",
      "Dictionaries map keys to hash buckets with average O(1) lookup time.",
    ],
  },
  "code-tracing": {
    slug: "code-tracing",
    title: "Code Tracing & Output Prediction Challenge",
    category: "python",
    componentKey: "CodeTracingSim",
    summary: "Predict the exact terminal output of exam-standard Python snippets before stepping through line execution.",
    difficulty: "Advanced",
    estimatedMinutes: 15,
    subjectCode: "CS101",
    subjectSlug: "python-programming",
    subjectName: "Python Programming & Algorithmic Thinking",
    theoryFormula: "\\text{Execution Trace} = \\langle (\\text{Line } L_i, \\text{Env}_i) \\rangle_{i=1}^N",
    theoryGuide: [
      "Semester exam questions often test tricky operator precedence, variable scope masking, and short-circuit evaluation.",
      "Predicting output builds mental compiler accuracy.",
    ],
  },
};
