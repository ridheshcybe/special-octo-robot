-- ============================================================================
-- PrepMeUp AI — Phase Q1: Quantum Computing Track Seed Data
-- Seed file for Tracks, Quantum Foundations Course, Modules, Lessons, Quizzes & Simulations
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Seed Tracks
-- ----------------------------------------------------------------------------
insert into public.pmu_tracks (id, slug, title, description, icon, status, display_order)
values
  (
    '11111111-2222-3333-4444-555555550001',
    'btech-cse-aiml',
    'B.Tech CSE AI/ML',
    'University-aligned engineering curriculum covering Semester 1 through graduation with AI-augmented exam preparation, notes, and coding labs.',
    'terminal',
    'published',
    1
  ),
  (
    '11111111-2222-3333-4444-555555550002',
    'quantum-computing',
    'Quantum Computing',
    'From Hilbert spaces and Bloch spheres to quantum algorithms and Qiskit circuit compilation. Master next-generation computational physics.',
    'cpu',
    'published',
    2
  ),
  (
    '11111111-2222-3333-4444-555555550003',
    'cybersecurity',
    'CyberSecurity — Coming Soon',
    'Defensive security engineering, cryptographic protocols, cloud penetration testing, and security operations fundamentals.',
    'shield',
    'published',
    3
  )
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status,
  display_order = excluded.display_order;

-- ----------------------------------------------------------------------------
-- 2. Seed Instructor (PhD Instructor)
-- ----------------------------------------------------------------------------
-- If auth.users user exists or for standalone local seed:
insert into public.pmu_instructors (
  id,
  full_name,
  title,
  bio,
  qualifications,
  expertise,
  avatar_url,
  linkedin_url,
  github_url,
  website_url,
  status
)
values (
  'e0000000-0000-0000-0000-000000000001',
  'Dr. Aravind Vaidya, PhD',
  'Lead Quantum Information Scientist & Curriculum Director',
  'Ph.D. in Quantum Information and Condensed Matter Physics. Over a decade of research across superconducting circuit electrodynamics, variational quantum algorithms, and Qiskit quantum compilation.',
  'Ph.D. in Quantum Information Science, M.Sc. Theoretical Physics',
  array['Quantum Computing', 'Qiskit', 'Cirq', 'PennyLane', 'Bloch Sphere Geometry', 'Superconducting Qubits'],
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  'https://linkedin.com/in/dr-aravind-vaidya-quantum',
  'https://github.com/dr-vaidya-quantum',
  'https://quantum-foundations.prepmeupai.in',
  'active'
)
on conflict (id) do update set
  full_name = excluded.full_name,
  title = excluded.title,
  bio = excluded.bio,
  qualifications = excluded.qualifications,
  expertise = excluded.expertise,
  status = excluded.status;

-- ----------------------------------------------------------------------------
-- 3. Seed Course: Quantum Computing Foundations
-- ----------------------------------------------------------------------------
insert into public.pmu_courses (
  id,
  track_id,
  instructor_id,
  slug,
  title,
  subtitle,
  description,
  level,
  language,
  format,
  prerequisite,
  thumbnail_url,
  status,
  is_free_preview_enabled
)
values (
  'c0000000-0000-0000-0000-000000000001',
  '11111111-2222-3333-4444-555555550002',
  'e0000000-0000-0000-0000-000000000001',
  'quantum-computing-foundations',
  'Quantum Computing Foundations',
  'From Qubits and Superposition to Qiskit Circuit Simulation & Grover Search',
  'Master quantum computational principles from foundational linear algebra to practical quantum circuit development. Learn statevectors, unitary transformations, multi-qubit entanglement, Deutsch-Jozsa and Grover search algorithms with interactive browser simulations and guided Qiskit labs.',
  'beginner',
  'English',
  'hybrid',
  'Basic Python & High-School Linear Algebra (Vectors & Matrices)',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
  'published',
  true
)
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  prerequisite = excluded.prerequisite,
  status = excluded.status,
  is_free_preview_enabled = excluded.is_free_preview_enabled;

-- Instructor course access permission
insert into public.pmu_instructor_course_access (
  id,
  instructor_id,
  course_id,
  permission_level
)
values (
  'a0000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000001',
  'owner'
)
on conflict (instructor_id, course_id) do nothing;

-- ----------------------------------------------------------------------------
-- 4. Seed 5 Course Modules
-- ----------------------------------------------------------------------------
insert into public.pmu_course_modules (id, course_id, module_number, title, description, status)
values
  (
    'm0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    1,
    'Quantum Computing Essentials',
    'Foundational principles: classical bits versus quantum bits, linear algebraic statevectors, Born rule measurements, and 3D Bloch sphere projections.',
    'published'
  ),
  (
    'm0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    2,
    'Quantum Gates and Circuits',
    'Unitary transformations in Hilbert space: Pauli X, Y, Z gates, Hadamard transformation, phase S and T gates, and multi-qubit CNOT architectures.',
    'published'
  ),
  (
    'm0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000003',
    3,
    'Entanglement and Correlation',
    'Composite systems, Kronecker tensor products, Bell state synthesis, GHZ states, EPR non-local correlations, and quantum teleportation foundations.',
    'published'
  ),
  (
    'm0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000004',
    4,
    'Quantum Algorithms',
    'Quantum computational speedups: Deutsch-Jozsa oracle problem, Grover amplitude amplification search, Quantum Phase Estimation (QPE), and Shor overview.',
    'published'
  ),
  (
    'm0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000005',
    5,
    'Quantum Programming with Qiskit',
    'Translating quantum circuits to production code: QuantumCircuit API, StatevectorSampler, AerSimulator, noisy backend simulation, and execution diagnostics.',
    'published'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  status = excluded.status;

-- ----------------------------------------------------------------------------
-- 5. Seed Course Lessons (Exact 1 Free Preview Lesson for Course)
-- ----------------------------------------------------------------------------

-- Module 1 Lessons
insert into public.pmu_course_lessons (
  id, course_id, module_id, lesson_number, title, description, lesson_type, is_free_preview, status
)
values
  (
    'l0000000-0000-0000-0001-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'm0000000-0000-0000-0000-000000000001',
    1,
    'Classical vs Quantum Computing: The Paradigm Shift',
    'Compare discrete classical bits with two-state quantum physical systems. Understand why state superposition unlocks exponential Hilbert state dimensions.',
    'video',
    true, -- FREE PREVIEW LESSON
    'published'
  ),
  (
    'l0000000-0000-0000-0001-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'm0000000-0000-0000-0000-000000000001',
    2,
    'Qubits, Superposition & Normalization',
    'Dirac Bra-Ket notation, statevectors |ψ⟩ = α|0⟩ + β|1⟩, and the fundamental normalization condition |α|² + |β|² = 1.',
    'pdf',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0001-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'm0000000-0000-0000-0000-000000000001',
    3,
    'The Measurement Postulate & Born Rule',
    'Wavefunction collapse under projective Hermitian observables. Calculating probabilities and expected values.',
    'pdf',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0001-000000000004',
    'c0000000-0000-0000-0000-000000000001',
    'm0000000-0000-0000-0000-000000000001',
    4,
    'The Bloch Sphere Geometry',
    'Map any pure single-qubit state to the surface of a unit 3D sphere parameterized by polar angle θ and azimuthal phase φ.',
    'simulation',
    false,
    'published'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  is_free_preview = excluded.is_free_preview;

-- Module 2 Lessons
insert into public.pmu_course_lessons (
  id, course_id, module_id, lesson_number, title, description, lesson_type, is_free_preview, status
)
values
  (
    'l0000000-0000-0000-0002-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'm0000000-0000-0000-0000-000000000002',
    1,
    'Single-Qubit Unitary Rotations',
    'Mathematical constraints on quantum gates: unitarity U†U = I and probability preservation.',
    'video',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0002-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    2,
    'Pauli Operators (X, Y, Z) and the Hadamard Transform',
    'Bit flips, phase flips, and the creation of unbiased superpositions with the Hadamard matrix.',
    'simulation',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0002-000000000003',
    'c0000000-0000-0000-0000-000000000002',
    3,
    'Phase Gates: S Gate and T Gate',
    'Quarter-turn π/2 and eighth-turn π/4 Z-rotations and their role in universal quantum gate synthesis.',
    'pdf',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0002-000000000004',
    'c0000000-0000-0000-0000-000000000002',
    4,
    'Multi-Qubit Gates & Controlled-NOT (CNOT)',
    '2-qubit tensor operators, reversible XOR logic, and entangling gate truth tables.',
    'video',
    false,
    'published'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description;

-- Module 3 Lessons
insert into public.pmu_course_lessons (
  id, course_id, module_id, lesson_number, title, description, lesson_type, is_free_preview, status
)
values
  (
    'l0000000-0000-0000-0003-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'm0000000-0000-0000-0000-000000000003',
    1,
    'Composite Quantum Registers & Tensor Products',
    'Formulating state space of N qubits with 2^N dimensional complex vectors.',
    'pdf',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0003-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    2,
    'The Four Canonical Bell States',
    'Constructing maximally entangled bipartite pairs |Φ+⟩, |Φ-⟩, |Ψ+⟩, and |Ψ-⟩.',
    'simulation',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0003-000000000003',
    'c0000000-0000-0000-0000-000000000003',
    3,
    'EPR Paradox and Bell Inequality Violation',
    'Einstein-Podolsky-Rosen argument, hidden variables, and experimental proof of non-locality.',
    'video',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0003-000000000004',
    'c0000000-0000-0000-0000-000000000003',
    4,
    'Multi-Party GHZ and W Entangled States',
    'Tripartite and N-qubit genuine entanglement configurations and their quantum communication roles.',
    'pdf',
    false,
    'published'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description;

-- Module 4 Lessons
insert into public.pmu_course_lessons (
  id, course_id, module_id, lesson_number, title, description, lesson_type, is_free_preview, status
)
values
  (
    'l0000000-0000-0000-0004-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'm0000000-0000-0000-0000-000000000004',
    1,
    'The Deutsch-Jozsa Quantum Oracle Algorithm',
    'Proving quantum speedup: evaluating whether an unknown function is constant or balanced in a single evaluation.',
    'video',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0004-000000000002',
    'c0000000-0000-0000-0000-000000000004',
    2,
    'Grover’s Amplitude Amplification Algorithm',
    'Searching unsorted databases with quadratic speedup O(√N). The Phase Oracle and Grover Diffusion Operator.',
    'simulation',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0004-000000000003',
    'c0000000-0000-0000-0000-000000000004',
    3,
    'Quantum Phase Estimation (QPE) Principles',
    'Estimating the phase corresponding to an eigenvalue of a unitary operator with high precision.',
    'pdf',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0004-000000000004',
    'c0000000-0000-0000-0000-000000000004',
    4,
    'Shor’s Factoring Algorithm Architectural Overview',
    'Polynomial-time prime factorization: period finding via Quantum Fourier Transform (QFT).',
    'video',
    false,
    'published'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description;

-- Module 5 Lessons
insert into public.pmu_course_lessons (
  id, course_id, module_id, lesson_number, title, description, lesson_type, is_free_preview, status
)
values
  (
    'l0000000-0000-0000-0005-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'm0000000-0000-0000-0000-000000000005',
    1,
    'Introduction to Qiskit SDK & Circuit Architecture',
    'Installing Qiskit, importing QuantumCircuit, allocating quantum and classical registers, and compiling gates.',
    'coding_lab',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0005-000000000002',
    'c0000000-0000-0000-0000-000000000005',
    2,
    'Building & Visualizing Circuits in Code',
    'Draw circuits in ASCII, LaTeX, and Matplotlib. Inspect unitary matrices and circuit depth analysis.',
    'coding_lab',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0005-000000000003',
    'c0000000-0000-0000-0000-000000000005',
    3,
    'Executing on AerSimulator & Statevector Sampler',
    'Configuring shots, extracting measurement counts dictionaries, and plotting probability histograms.',
    'coding_lab',
    false,
    'published'
  ),
  (
    'l0000000-0000-0000-0005-000000000004',
    'c0000000-0000-0000-0000-000000000004',
    4,
    'Analyzing Quantum Noise & Hardware Topology',
    'Thermal relaxation T1, dephasing T2, CNOT gate error rates, and quantum volume metrics overview.',
    'video',
    false,
    'published'
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description;

-- ----------------------------------------------------------------------------
-- 6. Seed 5 Module Quizzes in Draft Status (Module 1 marked as Free Preview Draft)
-- ----------------------------------------------------------------------------
-- Note: Do NOT auto-publish quizzes; per rule, quizzes remain draft until reviewed.
insert into public.pmu_quizzes (
  id,
  subject_id,
  title,
  description,
  duration_minutes,
  total_marks,
  passing_marks,
  is_active
)
values
  (
    'q0000000-0000-0000-0001-000000000001',
    null,
    'Module 1 Diagnostic: Quantum Essentials & Bloch Geometry (Free Preview)',
    '5 conceptual questions covering Dirac notation, statevector normalization, measurement probabilities, and the Bloch sphere.',
    15,
    5,
    3,
    false -- draft status
  ),
  (
    'q0000000-0000-0000-0002-000000000001',
    null,
    'Module 2 Assessment: Unitary Gates & Circuit Construction',
    'Pauli transformations, Hadamard rotation matrices, phase logic, and CNOT reversible matrix calculations.',
    20,
    5,
    3,
    false -- draft status
  ),
  (
    'q0000000-0000-0000-0003-000000000001',
    null,
    'Module 3 Assessment: Entanglement, Bell States & Non-Locality',
    'Testing Kronecker tensor multiplication, Bell basis state projection, and CHSH inequality concepts.',
    20,
    5,
    3,
    false -- draft status
  ),
  (
    'q0000000-0000-0000-0004-000000000001',
    null,
    'Module 4 Assessment: Quantum Oracles & Search Algorithms',
    'Evaluating Deutsch-Jozsa phase kickback and Grover iteration counting for optimal target amplification.',
    25,
    5,
    3,
    false -- draft status
  ),
  (
    'q0000000-0000-0000-0005-000000000001',
    null,
    'Module 5 Practical Assessment: Qiskit Circuit Engineering',
    'Syntax diagnostic on QuantumCircuit methods, StatevectorSampler execution, and measurement histogram decoding.',
    25,
    5,
    3,
    false -- draft status
  )
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description;
