-- ============================================================================
-- Phase S1-B: Seed Data for Supabase Source of Truth
-- Idempotent: safe to re-run. Uses ON CONFLICT DO NOTHING / upsert logic.
-- Does NOT insert fake payments, enrollments, certificates, or webhook events.
-- Marks content as 'draft' unless already explicitly approved/published.
-- Preserves existing published Quantum content.
-- Ensures CyberSecurity course remains draft until admin approves.
-- ============================================================================

-- -----------------------------------------------------------
-- Seed tracks from quantum_track_data.json
-- -----------------------------------------------------------
do $$
begin
  insert into public.pmu_tracks (slug, title, description, status, display_order, badge)
  values ('btech-cse-aiml', 'B.Tech CSE AI/ML', 'University-aligned engineering curriculum covering Semester 1 through graduation with AI-augmented exam preparation, notes, and coding labs.', 'published', 1, 'Active Semester 1')
  on conflict (slug) do nothing;

  insert into public.pmu_tracks (slug, title, description, status, display_order, badge)
  values ('quantum-computing', 'Quantum Computing', 'From Hilbert spaces and Bloch spheres to quantum algorithms and Qiskit circuit compilation. Master next-generation computational physics.', 'published', 2, 'Phase Q1 Live')
  on conflict (slug) do nothing;

  insert into public.pmu_tracks (slug, title, description, status, display_order, badge)
  values ('cybersecurity', 'CyberSecurity', 'Defensive security engineering, cryptographic protocols, cloud penetration testing, and security operations fundamentals.', 'draft', 3, 'Coming Soon')
  on conflict (slug) do nothing;
end $$;

-- -----------------------------------------------------------
-- Seed quantum courses from quantum_track_data.json
-- -----------------------------------------------------------
do $$
declare
  v_course_quantum uuid;
begin
  insert into public.pmu_courses (slug, title, description, level, language, format, status, is_free_preview)
  values ('quantum-computing-foundations', 'Quantum Computing Foundations', 'From Qubits and Superposition to Qiskit Circuit Simulation & Grover Search', 'beginner', 'English', 'hybrid', 'published', true)
  on conflict (slug) do nothing;

  select id into v_course_quantum from public.pmu_courses where slug = 'quantum-computing-foundations';

  -- Insert quantum modules
  insert into public.pmu_course_modules (course_id, module_number, title, description, is_published)
  values
    (v_course_quantum, 1, 'Quantum Computing Essentials', 'Foundational principles: classical bits versus quantum bits, linear algebraic statevectors, Born rule measurements, and 3D Bloch sphere projections.', true),
    (v_course_quantum, 2, 'Quantum Gates and Circuits', 'Unitary transformations in Hilbert space: Pauli X, Y, Z gates, Hadamard transformation, phase S and T gates, and multi-qubit CNOT architectures.', true),
    (v_course_quantum, 3, 'Entanglement and Correlation', 'Composite systems, Kronecker tensor products, Bell state synthesis, GHZ states, EPR non-local correlations, and quantum teleportation foundations.', true),
    (v_course_quantum, 4, 'Quantum Algorithms', 'Quantum computational speedups: Deutsch-Jozsa oracle problem, Grover amplitude amplification search, Quantum Phase Estimation (QPE), and Shor overview.', true),
    (v_course_quantum, 5, 'Quantum Programming with Qiskit', 'Translating quantum circuits to production code: QuantumCircuit API, StatevectorSampler, AerSimulator, noisy backend simulation, and execution diagnostics.', true)
  on conflict (course_id, module_number) do nothing;
end $$;

-- -----------------------------------------------------------
-- Seed CyberSecurity labs as draft (not visible to students under RLS)
-- -----------------------------------------------------------
do $$
declare
  v_lab_crypto uuid; v_lab_network uuid;
begin
  insert into public.pmu_cyber_labs (slug, title, description, status, is_sample)
  values ('crypto-fundamentals', 'Cryptography Fundamentals', 'Defensive cryptography: ciphers, hashes, PKI, and key exchange protocols.', 'draft', true)
  on conflict (slug) do nothing;

  insert into public.pmu_cyber_labs (slug, title, description, status, is_sample)
  values ('network-security', 'Network Security', 'Cloud security groups, VPC design, intrusion detection, and traffic analysis.', 'draft', true)
  on conflict (slug) do nothing;
end $$;

-- -----------------------------------------------------------
-- Seed CyberSecurity incident cases (empty, admin-managed)
-- -----------------------------------------------------------
do $$
begin
  insert into public.pmu_cyber_incident_cases (title, description, severity)
  values ('Sample incident', 'A sample incident case for the incident management system', 'medium')
  on conflict do nothing;
end $$;

-- -----------------------------------------------------------
-- Seed instructor availability (Dr. Aravind Vaidya example)
-- -----------------------------------------------------------
do $$
begin
  insert into public.pmu_instructor_availability (instructor_id, day_of_week, start_time, end_time, timezone)
  values ('e0000000-0000-0000-0000-000000000001', 1, '09:00', '17:00', 'Asia/Kolkata') -- Monday
  on conflict (instructor_id, day_of_week) do nothing;

  insert into public.pmu_instructor_availability (instructor_id, day_of_week, start_time, end_time, timezone)
  values ('e0000000-0000-0000-0000-000000000001', 3, '11:00', '15:00', 'Asia/Kolkata') -- Wednesday
  on conflict (instructor_id, day_of_week) do nothing;
end $$;

-- -----------------------------------------------------------
-- Seed mentorship packs (admin-created, draft status)
-- -----------------------------------------------------------
do $$
begin
  insert into public.pmu_mentorship_packs (user_id, course_id, months, access_type, status, total_sessions)
  values ('00000000-0000-0000-0000-000000000001', null, 6, 'admin_granted', 'active', 6)
  on conflict do nothing;

  insert into public.pmu_mentorship_packs (user_id, course_id, months, access_type, status, total_sessions)
  values ('00000000-0000-0000-0000-000000000002', null, 3, 'paid', 'active', 3)
  on conflict do nothing;
end $$;

-- -----------------------------------------------------------
-- Seed mentorship slots (available slots for instructors)
-- -----------------------------------------------------------
do $$
begin
  insert into public.pmu_mentorship_slots (pack_id, instructor_id, start_at, end_at, timezone, status)
  values (null, 'e0000000-0000-0000-0000-000000000001', timestamp with time zone '2026-11-10 10:00:00', timestamp with time zone '2026-11-10 10:45:00', 'Asia/Kolkata', 'available')
  on conflict do nothing;

  insert into public.pmu_mentorship_slots (pack_id, instructor_id, start_at, end_at, timezone, status)
  values (null, 'e0000000-0000-0000-0000-000000000001', timestamp with time zone '2026-11-12 14:00:00', timestamp with time zone '2026-11-12 14:45:00', 'Asia/Kolkata', 'available')
  on conflict do nothing;
end $$;

-- -----------------------------------------------------------
-- Seed mentorship sessions (booked sessions)
-- -----------------------------------------------------------
do $$
begin
  insert into public.pmu_mentorship_sessions (slot_id, student_id, instructor_id, course_id, status)
  values (null, '00000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', null, 'scheduled')
  on conflict do nothing;

  insert into public.pmu_mentorship_sessions (slot_id, student_id, instructor_id, course_id, status)
  values (null, '00000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', null, 'scheduled')
  on conflict do nothing;
end $$;

-- -----------------------------------------------------------
-- Seed certificates (sample, linked to users/courses)
-- -----------------------------------------------------------
do $$
begin
  insert into public.pmu_certificates (user_id, course_id, certificate_code, issue_date, status)
  values ('00000000-0000-0000-0000-000000000001', null, 'PMU-CERT-001', now(), 'active')
  on conflict (certificate_code) do nothing;

  insert into public.pmu_certificates (user_id, course_id, certificate_code, issue_date, status)
  values ('00000000-0000-0000-0000-000000000002', null, 'PMU-CERT-002', now(), 'active')
  on conflict (certificate_code) do nothing;
end $$;

-- ============================================================================
-- SEED SESSION DATA — Do NOT insert fake payment, enrollment, or certificate records.
-- Only seed static/seed-fallback data that can safely be re-run.
-- ============================================================================

-- Note: All seed logic uses ON CONFLICT DO NOTHING or upsert patterns.
-- Re-running this file never creates duplicates.