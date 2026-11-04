-- ============================================================================
-- PrepMeUp AI — Seed Data for Semester 1 (Phase 1)
-- Populates Semester 1, 4 Core Subjects, Modules, Topics, Sample Notes & PYQs
-- ============================================================================

do $$
declare
  v_sem_id uuid;
  v_sub_acm uuid;
  v_sub_pyt uuid;
  v_sub_bee uuid;
  v_sub_coa uuid;

  -- Modules
  v_mod_acm_1 uuid; v_mod_acm_2 uuid; v_mod_acm_3 uuid; v_mod_acm_4 uuid;
  v_mod_pyt_1 uuid; v_mod_pyt_2 uuid; v_mod_pyt_3 uuid; v_mod_pyt_4 uuid;
  v_mod_bee_1 uuid; v_mod_bee_2 uuid; v_mod_bee_3 uuid; v_mod_bee_4 uuid;
  v_mod_coa_1 uuid; v_mod_coa_2 uuid; v_mod_coa_3 uuid; v_mod_coa_4 uuid;

  -- Sample topic ids
  v_top_acm_sample uuid;
  v_top_pyt_sample uuid;
  v_top_bee_sample uuid;
  v_top_coa_sample uuid;

  -- Draft question targets
  v_paper_acm uuid;
begin

  -- 1. Insert Semester 1
  insert into public.pmu_semesters (number, title, branch, is_active)
  values (1, 'Semester 1 — B.Tech CSE AI/ML', 'B.Tech CSE AI/ML', true)
  on conflict (number) do update set title = excluded.title
  returning id into v_sem_id;

  -- 2. Insert 4 Core Subjects
  insert into public.pmu_subjects (semester_id, code, title, slug, description, credit_units, icon, is_published)
  values
    (v_sem_id, 'ACM-101', 'Applied Computational Mathematics', 'applied-computational-mathematics',
     'Calculus, Linear Algebra, Matrix Decompositions, and Numerical Optimisation for AI/ML foundations.', 4, '📐', true)
  on conflict (code) do update set title = excluded.title returning id into v_sub_acm;

  insert into public.pmu_subjects (semester_id, code, title, slug, description, credit_units, icon, is_published)
  values
    (v_sem_id, 'PYT-102', 'Python Programming', 'python-programming',
     'Modern Python 3, object-oriented software design, recursion, NumPy vectorisation, and algorithm analysis.', 4, '🐍', true)
  on conflict (code) do update set title = excluded.title returning id into v_sub_pyt;

  insert into public.pmu_subjects (semester_id, code, title, slug, description, credit_units, icon, is_published)
  values
    (v_sem_id, 'BEE-103', 'Basic Electrical Engineering', 'basic-electrical-engineering',
     'DC circuit theorems, steady-state sinusoidal AC analysis, transformers, and electrical machines.', 4, '⚡', true)
  on conflict (code) do update set title = excluded.title returning id into v_sub_bee;

  insert into public.pmu_subjects (semester_id, code, title, slug, description, credit_units, icon, is_published)
  values
    (v_sem_id, 'COA-104', 'Computer Organisation and Architecture', 'computer-organisation-and-architecture',
     'Instruction Set Architecture, pipelined data paths, cache coherence, and memory hierarchy design.', 3, '💻', true)
  on conflict (code) do update set title = excluded.title returning id into v_sub_coa;

  -- 3. Modules for ACM-101 (Applied Computational Mathematics)
  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_acm, 1, 'Linear Algebra & Matrix Decompositions', 'Vector spaces, eigenvalues, eigenvectors, Cayley-Hamilton theorem, and SVD basics.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_acm_1;

  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_acm, 2, 'Differential Calculus & Optimisation', 'Partial derivatives, Taylor series, gradient vectors, and Lagrange multipliers.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_acm_2;

  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_acm, 3, 'Multiple Integrals & Vector Calculus', 'Double and triple integrals, Green theorem, Stokes theorem, and Divergence theorem.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_acm_3;

  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_acm, 4, 'Numerical Methods for Machine Learning', 'Newton-Raphson, Euler method, Runge-Kutta 4th order, and gradient descent formulations.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_acm_4;

  -- Topics for ACM Module 1
  insert into public.pmu_topics (module_id, topic_number, title, slug, description, estimated_reading_minutes, is_sample, is_published)
  values
    (v_mod_acm_1, 1, 'Vector Spaces & Subspaces', 'vector-spaces-subspaces', 'Linear independence, spanning sets, basis, and dimension.', 20, false, true),
    (v_mod_acm_1, 2, 'Eigenvalues & Diagonalization', 'eigenvalues-and-diagonalization', 'Characteristic equation, algebraic/geometric multiplicity, and matrix diagonalization.', 25, true, true),
    (v_mod_acm_1, 3, 'Singular Value Decomposition (SVD)', 'svd-foundations', 'Geometric interpretation of SVD and low-rank matrix approximation.', 30, false, true)
  on conflict (module_id, slug) do update set title = excluded.title;

  -- Grab sample topic for note seeding
  select id into v_top_acm_sample from public.pmu_topics where module_id = v_mod_acm_1 and slug = 'eigenvalues-and-diagonalization';

  -- Topics for ACM Module 2, 3, 4
  insert into public.pmu_topics (module_id, topic_number, title, slug, description, estimated_reading_minutes, is_sample, is_published) values
    (v_mod_acm_2, 1, 'Partial Derivatives & Chain Rule', 'partial-derivatives', 'Multivariable differentiation rules.', 15, false, true),
    (v_mod_acm_2, 2, 'Maxima & Minima of Two Variables', 'maxima-minima-2var', 'Hessian matrix test and saddle points.', 20, false, true),
    (v_mod_acm_2, 3, 'Lagrange Multipliers with Constraints', 'lagrange-multipliers', 'Constrained optimisation with equality conditions.', 25, false, true),
    (v_mod_acm_3, 1, 'Double Integrals in Cartesian & Polar', 'double-integrals', 'Area calculation and changing order of integration.', 20, false, true),
    (v_mod_acm_3, 2, 'Gradient, Divergence & Curl', 'vector-differential-operators', 'Physical interpretations in 3D fields.', 20, false, true),
    (v_mod_acm_3, 3, 'Gauss Divergence Theorem', 'gauss-divergence-theorem', 'Volume integrals to surface fluxes.', 25, false, true),
    (v_mod_acm_4, 1, 'Newton-Raphson Method', 'newton-raphson', 'Root finding with convergence analysis.', 15, false, true),
    (v_mod_acm_4, 2, 'Runge-Kutta 4th Order (RK4)', 'runge-kutta-rk4', 'Numerical solutions to initial value ODEs.', 20, false, true),
    (v_mod_acm_4, 3, 'Gradient Descent Algorithm', 'gradient-descent-algorithm', 'Learning rate tuning, convexity, and convergence.', 25, false, true)
  on conflict (module_id, slug) do update set title = excluded.title;

  -- 4. Modules for PYT-102 (Python Programming)
  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_pyt, 1, 'Control Structures & Data Collections', 'Conditionals, loops, lists, tuples, sets, and dictionary comprehensions.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_pyt_1;

  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_pyt, 2, 'Functions, Recursion & Scope', 'First-class functions, closures, recursion trees, and memoisation.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_pyt_2;

  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_pyt, 3, 'Object-Oriented Programming (OOP)', 'Classes, inheritance, polymorphism, dunder methods, and dataclasses.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_pyt_3;

  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_pyt, 4, 'Scientific Computing with NumPy', 'N-dimensional arrays, vectorised broadcasting, linear algebra, and masking.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_pyt_4;

  -- Topics for Python Module 1
  insert into public.pmu_topics (module_id, topic_number, title, slug, description, estimated_reading_minutes, is_sample, is_published)
  values
    (v_mod_pyt_1, 1, 'Pythonic Idioms & Comprehensions', 'pythonic-comprehensions', 'List, dict, and set comprehensions with performance benefits.', 15, true, true),
    (v_mod_pyt_1, 2, 'Mutable vs Immutable Data Structures', 'mutability-in-python', 'Memory references, shallow vs deep copying.', 20, false, true),
    (v_mod_pyt_1, 3, 'Iterators & Generator Functions', 'iterators-generators', 'Memory-efficient streaming with the yield keyword.', 25, false, true)
  on conflict (module_id, slug) do update set title = excluded.title;

  select id into v_top_pyt_sample from public.pmu_topics where module_id = v_mod_pyt_1 and slug = 'pythonic-comprehensions';

  -- Topics for Python Module 2, 3, 4
  insert into public.pmu_topics (module_id, topic_number, title, slug, description, estimated_reading_minutes, is_sample, is_published) values
    (v_mod_pyt_2, 1, 'Arbitrary Arguments (*args, **kwargs)', 'args-kwargs-unpacking', 'Dynamic function signatures.', 15, false, true),
    (v_mod_pyt_2, 2, 'Recursive Divide-and-Conquer Patterns', 'recursion-patterns', 'Base cases, call stack traces, and memoisation.', 20, false, true),
    (v_mod_pyt_2, 3, 'Decorators & Higher-Order Functions', 'decorators-closures', 'Wrapping functions with execution timers.', 25, false, true),
    (v_mod_pyt_3, 1, 'Encapsulation & Property Decorators', 'encapsulation-properties', 'Getters, setters, and private name mangling.', 20, false, true),
    (v_mod_pyt_3, 2, 'Class Hierarchy & Multiple Inheritance', 'multiple-inheritance-mro', 'Method Resolution Order (MRO) and super().', 25, false, true),
    (v_mod_pyt_3, 3, 'Special Dunder Methods (__repr__, __add__)', 'dunder-methods', 'Operator overloading and clean representations.', 20, false, true),
    (v_mod_pyt_4, 1, 'NumPy Array Memory Layout & Slicing', 'numpy-memory-slicing', 'Contiguous memory, strides, and zero-copy views.', 20, false, true),
    (v_mod_pyt_4, 2, 'Broadcasting Semantics', 'numpy-broadcasting', 'Dimension alignment rules without loop overhead.', 25, false, true),
    (v_mod_pyt_4, 3, 'Vectorised Matrix Computations', 'vectorised-linear-algebra', 'Dot products, eigenvalues, and inversions.', 25, false, true)
  on conflict (module_id, slug) do update set title = excluded.title;

  -- 5. Modules for BEE-103 (Basic Electrical Engineering)
  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_bee, 1, 'DC Circuit Analysis & Theorems', 'KCL, KVL, Mesh analysis, Nodal analysis, Thevenin theorem, Norton theorem, and Superposition.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_bee_1;

  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_bee, 2, 'AC Steady-State Analysis', 'Phasors, complex impedance, sinusoidal steady-state, resonance in RLC circuits, and power factor.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_bee_2;

  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_bee, 3, 'Three-Phase Systems & Magnetic Circuits', 'Star and Delta configurations, line vs phase relations, B-H curve, and reluctance.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_bee_3;

  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_bee, 4, 'Transformers & Electrical Machines', 'Ideal transformer equations, equivalent circuits, efficiency, and basic induction motor concepts.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_bee_4;

  -- Topics for BEE Module 1
  insert into public.pmu_topics (module_id, topic_number, title, slug, description, estimated_reading_minutes, is_sample, is_published)
  values
    (v_mod_bee_1, 1, 'Thevenin & Norton Equivalent Circuits', 'thevenin-norton-theorems', 'Step-by-step calculation of Vth, Rth, and load power delivery.', 25, true, true),
    (v_mod_bee_1, 2, 'Maximum Power Transfer Theorem', 'maximum-power-transfer', 'Proof for DC circuits and matching internal impedance.', 15, false, true),
    (v_mod_bee_1, 3, 'Superposition Theorem with Dependent Sources', 'superposition-theorem', 'Analyzing independent vs dependent current/voltage supplies.', 20, false, true)
  on conflict (module_id, slug) do update set title = excluded.title;

  select id into v_top_bee_sample from public.pmu_topics where module_id = v_mod_bee_1 and slug = 'thevenin-norton-theorems';

  -- Topics for BEE Module 2, 3, 4
  insert into public.pmu_topics (module_id, topic_number, title, slug, description, estimated_reading_minutes, is_sample, is_published) values
    (v_mod_bee_2, 1, 'Phasor Representation & Impedance Triangles', 'phasors-impedance', 'Converting sinusoidal voltages to complex algebra.', 20, false, true),
    (v_mod_bee_2, 2, 'Series & Parallel RLC Resonance', 'rlc-resonance', 'Resonant frequency, quality factor Q, and bandwidth.', 25, false, true),
    (v_mod_bee_2, 3, 'Power Factor Correction', 'power-factor-correction', 'Active, reactive, and apparent power in industrial loads.', 20, false, true),
    (v_mod_bee_3, 1, 'Balanced Star & Delta Three-Phase Connections', 'star-delta-connections', 'Line voltage vs phase voltage calculations.', 25, false, true),
    (v_mod_bee_3, 2, 'Two-Wattmeter Power Measurement', 'two-wattmeter-method', 'Total active power and power factor derivation.', 20, false, true),
    (v_mod_bee_3, 3, 'Magnetic Circuits & Hysteresis Loss', 'magnetic-circuits-hysteresis', 'MMF, flux, reluctance, and Eddy current losses.', 20, false, true),
    (v_mod_bee_4, 1, 'Single-Phase Transformer Equivalent Circuit', 'transformer-equivalent-circuit', 'Winding resistance, leakage reactance, and core losses.', 25, false, true),
    (v_mod_bee_4, 2, 'Transformer Efficiency & Voltage Regulation', 'transformer-efficiency', 'Condition for maximum efficiency and all-day regulation.', 20, false, true),
    (v_mod_bee_4, 3, 'Principles of Three-Phase Induction Motors', 'induction-motor-principles', 'Rotating magnetic field, slip, and torque-speed curves.', 25, false, true)
  on conflict (module_id, slug) do update set title = excluded.title;

  -- 6. Modules for COA-104 (Computer Organisation and Architecture)
  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_coa, 1, 'Computer Evolution & Machine Instructions', 'Von Neumann machine, Harvard architecture, addressing modes, and bus structures.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_coa_1;

  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_coa, 2, 'Central Processing Unit & Arithmetic Unit', 'ALU design, Booth multiplication algorithm, restoring/non-restoring division, and IEEE 754 float.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_coa_2;

  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_coa, 3, 'Pipelining & Control Unit Design', 'Hardwired vs microprogrammed control unit, 5-stage instruction pipeline, and pipeline hazards.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_coa_3;

  insert into public.pmu_modules (subject_id, module_number, title, description, is_published)
  values (v_sub_coa, 4, 'Memory Hierarchy & I/O Organization', 'Cache mapping (direct, associative, set-associative), cache coherence, virtual memory, and DMA.', true)
  on conflict (subject_id, module_number) do update set title = excluded.title returning id into v_mod_coa_4;

  -- Topics for COA Module 1
  insert into public.pmu_topics (module_id, topic_number, title, slug, description, estimated_reading_minutes, is_sample, is_published)
  values
    (v_mod_coa_1, 1, 'Von Neumann vs Harvard Architectures', 'von-neumann-vs-harvard', 'Stored-program concept and the memory bottleneck trade-off.', 20, true, true),
    (v_mod_coa_1, 2, 'CPU Addressing Modes', 'addressing-modes', 'Immediate, direct, indirect, register relative, and base-index modes.', 25, false, true),
    (v_mod_coa_1, 3, 'Instruction Cycle (Fetch, Decode, Execute)', 'instruction-cycle', 'Sub-cycles, timing diagrams, and program counter increments.', 15, false, true)
  on conflict (module_id, slug) do update set title = excluded.title;

  select id into v_top_coa_sample from public.pmu_topics where module_id = v_mod_coa_1 and slug = 'von-neumann-vs-harvard';

  -- Topics for COA Module 2, 3, 4
  insert into public.pmu_topics (module_id, topic_number, title, slug, description, estimated_reading_minutes, is_sample, is_published) values
    (v_mod_coa_2, 1, 'Booth Multiplication Algorithm for Signed Numbers', 'booth-multiplication', 'Bit-pair recoding and shift-add hardware realization.', 25, false, true),
    (v_mod_coa_2, 2, 'Restoring vs Non-Restoring Division', 'division-algorithms', 'Quotient registers, remainder recovery, and hardware costs.', 25, false, true),
    (v_mod_coa_2, 3, 'IEEE 754 Floating-Point Standard', 'ieee-754-floating-point', 'Sign bit, biased exponent, mantissa, and normalized numbers.', 20, false, true),
    (v_mod_coa_3, 1, '5-Stage Classic RISC Pipeline', 'five-stage-pipeline', 'IF, ID, EX, MEM, WB microarchitectural phases.', 25, false, true),
    (v_mod_coa_3, 2, 'Structural, Data & Control Hazards', 'pipeline-hazards', 'Forwarding logic, stall bubbles, and branch prediction.', 30, false, true),
    (v_mod_coa_3, 3, 'Hardwired vs Microprogrammed Control', 'control-unit-design', 'Speed vs flexibility and micro-instruction sequencing.', 20, false, true),
    (v_mod_coa_4, 1, 'Cache Mapping Techniques', 'cache-mapping-techniques', 'Direct mapping, fully associative, and N-way set associative.', 30, false, true),
    (v_mod_coa_4, 2, 'Cache Replacement Policies (LRU, FIFO)', 'cache-replacement-policies', 'Hit rates, miss penalties, and write-through vs write-back.', 20, false, true),
    (v_mod_coa_4, 3, 'Direct Memory Access (DMA) Controllers', 'dma-transfer-modes', 'Burst mode, cycle stealing, and bus arbitration.', 20, false, true)
  on conflict (module_id, slug) do update set title = excluded.title;

  -- 7. Sample Published Notes (One per Subject)
  insert into public.pmu_notes (topic_id, title, content, reading_time_min, status, is_sample)
  values
  (
    v_top_acm_sample,
    'High-Yield Notes: Eigenvalues, Eigenvectors & Diagonalization',
    E'# Eigenvalues, Eigenvectors & Diagonalization\n\n## 1. Core Definition\nFor any square matrix **A** of order $n \\times n$, a non-zero column vector **x** is an **eigenvector** corresponding to eigenvalue $\\lambda$ if:\n\n$$A\\mathbf{x} = \\lambda\\mathbf{x} \\implies (A - \\lambda I)\\mathbf{x} = 0$$\n\nBecause $\\mathbf{x} \\neq 0$, the characteristic equation is:\n\n$$\\det(A - \\lambda I) = 0$$\n\n---\n\n## 2. Properties Crucial for University Exams\n- The **Sum of eigenvalues** equals the **Trace of matrix A** (sum of main diagonal entries).\n- The **Product of eigenvalues** equals the **Determinant of matrix A** ($\\det(A)$).\n- A matrix **A** is invertible if and only if **0 is not an eigenvalue**.\n- If **A** is a symmetric matrix, all its eigenvalues are strictly **real**.\n\n---\n\n## 3. Step-by-Step Diagonalization Procedure\nA matrix $A$ is diagonalizable if there exists an invertible matrix $P$ such that:\n\n$$P^{-1}AP = D$$\n\nwhere $D$ is a diagonal matrix containing the eigenvalues $\\lambda_1, \\lambda_2, \\dots, \\lambda_n$ along its diagonal.',
    20,
    'published',
    true
  );

  insert into public.pmu_notes (topic_id, title, content, reading_time_min, status, is_sample)
  values
  (
    v_top_pyt_sample,
    'High-Yield Notes: Pythonic Idioms & Vectorised Comprehensions',
    E'# Pythonic Idioms & Comprehensions\n\n## 1. Why Comprehensions Beat For-Loops\nIn CPython, list comprehensions execute at the bytecode level (`LIST_APPEND`), avoiding the overhead of re-resolving the `append` method on every iteration.\n\n```python\n# Standard slow loop\nsquares = []\nfor x in range(10):\n    if x % 2 == 0:\n        squares.append(x ** 2)\n\n# Optimized Pythonic comprehension\nsquares = [x ** 2 for x in range(10) if x % 2 == 0]\n```\n\n---\n\n## 2. Dictionary & Set Comprehensions\n```python\n# Dictionary comprehension (inverting key-value pairs)\noriginal = {"a": 1, "b": 2, "c": 3}\ninverted = {v: k for k, v in original.items()}\n```\n\n---\n\n## 3. Exam Tip: Memory Footprint\nWhen working with massive datasets, prefer **Generator Expressions** over list comprehensions to save memory:\n\n```python\n# Returns generator object (lazy evaluation, O(1) memory)\ngen = (x ** 2 for x in range(10_000_000))\n```',
    15,
    'published',
    true
  );

  insert into public.pmu_notes (topic_id, title, content, reading_time_min, status, is_sample)
  values
  (
    v_top_bee_sample,
    'High-Yield Notes: Thevenin & Norton Equivalent Circuits',
    E'# Thevenin & Norton Equivalent Circuit Theorems\n\n## 1. Thevenin’s Theorem Statement\nAny linear, bidirectional DC network with voltage sources, current sources, and resistors can be replaced across two terminals by an equivalent circuit containing:\n1. A single independent voltage source $V_{th}$ in series with\n2. A single internal equivalent resistance $R_{th}$.\n\n---\n\n## 2. Method of Derivation for University Numericals\n1. **Find $V_{th}$ (Open-Circuit Voltage):** Disconnect the load resistor $R_L$. Calculate the open-circuit potential across terminals A and B using Nodal or Mesh analysis.\n2. **Find $R_{th}$ (Internal Resistance):** Deactivate all independent sources:\n   - Replace independent Voltage Sources with **Short Circuits**.\n   - Replace independent Current Sources with **Open Circuits**.\n   - Calculate equivalent resistance looking into terminals A-B.\n3. **Load Current ($I_L$):**\n   $$I_L = \\frac{V_{th}}{R_{th} + R_L}$$\n\n---\n\n## 3. Maximum Power Transfer Condition\nMaximum power is delivered to the load when $R_L = R_{th}$, where maximum power is given by:\n$$P_{max} = \\frac{V_{th}^2}{4 R_{th}}$$',
    25,
    'published',
    true
  );

  insert into public.pmu_notes (topic_id, title, content, reading_time_min, status, is_sample)
  values
  (
    v_top_coa_sample,
    'High-Yield Notes: Von Neumann vs Harvard Architecture',
    E'# Computer Evolution: Von Neumann vs Harvard Architecture\n\n## 1. Fundamental Differences\n\n| Parameter | Von Neumann Architecture | Harvard Architecture |\n| :--- | :--- | :--- |\n| **Memory Bus** | Single shared bus for data and instructions | Separate physical buses for data and instructions |\n| **Instruction Fetch** | Cannot fetch data & instruction simultaneously | Can fetch instruction & read data simultaneously |\n| **Bottleneck** | Severe "Von Neumann Bottleneck" | Much higher throughput, zero bus contention |\n| **Cost & Complexity** | Simpler hardware and lower pin count | Complex controller, higher board pin requirements |\n| **Modern Application** | General desktop computers (x86, ARM OS cores) | High-speed DSPs, microcontrollers (AVR, PIC) |\n\n---\n\n## 2. The Von Neumann Bottleneck\nBecause CPU clock speeds increase far faster than memory bus bandwidth, CPU execution units waste clock cycles waiting for memory operands to cross the shared bus. This led to modern multi-level caching (L1/L2/L3).',
    20,
    'published',
    true
  );

  -- 8. Sample Past Papers (1 per subject)
  insert into public.pmu_past_papers (subject_id, exam_year, exam_type, title, question_paper_url, solution_url, is_published)
  values
    (v_sub_acm, 2025, 'End-Semester Exam', 'Winter 2025 ACM-101 End-Sem Question Paper & Verified Solutions', 'https://example.com/acm-2025.pdf', 'https://example.com/acm-2025-sol.pdf', true)
  returning id into v_paper_acm;

  insert into public.pmu_past_papers (subject_id, exam_year, exam_type, title, question_paper_url, solution_url, is_published)
  values
    (v_sub_pyt, 2025, 'Mid-Semester Test 1', 'Winter 2025 PYT-102 Mid-Sem Test 1 Paper & Model Solutions', 'https://example.com/pyt-2025.pdf', 'https://example.com/pyt-2025-sol.pdf', true);

  insert into public.pmu_past_papers (subject_id, exam_year, exam_type, title, question_paper_url, solution_url, is_published)
  values
    (v_sub_bee, 2024, 'End-Semester Exam', 'Winter 2024 BEE-103 End-Sem Complete Question Paper', 'https://example.com/bee-2024.pdf', 'https://example.com/bee-2024-sol.pdf', true);

  insert into public.pmu_past_papers (subject_id, exam_year, exam_type, title, question_paper_url, solution_url, is_published)
  values
    (v_sub_coa, 2024, 'End-Semester Exam', 'Winter 2024 COA-104 End-Sem Solved Paper', 'https://example.com/coa-2024.pdf', 'https://example.com/coa-2024-sol.pdf', true);

  -- 9. Create DRAFT Questions (Explicitly marked as 'draft' so students cannot see them under RLS)
  insert into public.pmu_questions (
    subject_id,
    module_id,
    past_paper_id,
    question_type,
    difficulty,
    question_text,
    options,
    correct_answer,
    explanation,
    marks,
    source,
    status
  ) values (
    v_sub_acm,
    v_mod_acm_1,
    v_paper_acm,
    'mcq_single',
    'easy',
    'What is the sum of eigenvalues of the matrix A = [[3, 2], [1, 4]]?',
    '[{"id":"a","text":"5"},{"id":"b","text":"7"},{"id":"c","text":"10"},{"id":"d","text":"12"}]'::jsonb,
    '{"id":"b"}'::jsonb,
    'The sum of eigenvalues is equal to the trace of matrix A: Trace(A) = 3 + 4 = 7.',
    2.0,
    'past_paper',
    'draft' -- DRAFT STATUS: Students cannot read this under RLS
  );

  insert into public.pmu_questions (
    subject_id,
    module_id,
    question_type,
    difficulty,
    question_text,
    options,
    correct_answer,
    explanation,
    marks,
    source,
    status
  ) values (
    v_sub_pyt,
    v_mod_pyt_1,
    'mcq_single',
    'medium',
    'Which of the following creates a generator expression in Python?',
    '[{"id":"a","text":"[x**2 for x in range(5)]"},{"id":"b","text":"(x**2 for x in range(5))"},{"id":"c","text":"{x**2 for x in range(5)}"},{"id":"d","text":"{x: x**2 for x in range(5)}"}]'::jsonb,
    '{"id":"b"}'::jsonb,
    'Parentheses syntax (x for x in iterable) generates a memory-efficient generator object, not a tuple.',
    2.0,
    'syllabus',
    'draft' -- DRAFT STATUS
  );

end $$;
