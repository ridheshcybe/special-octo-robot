-- ============================================================================
-- Seed Data: CyberSecurity Track, Course, Modules, Lessons, Labs & CTF Challenges
-- Phase C1: PrepMeUp AI
-- ============================================================================

-- 1. Ensure CyberSecurity Track is Live
INSERT INTO public.pmu_tracks (id, slug, title, description, icon, status, display_order, created_at, updated_at)
VALUES (
    '11111111-2222-3333-4444-555555550003',
    'cybersecurity',
    'CyberSecurity',
    'Defensive security engineering, ethical hacking concepts, SOC investigations, and browser-sandboxed CTF challenges.',
    'shield',
    'published',
    3,
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    status = 'published',
    description = EXCLUDED.description,
    updated_at = NOW();

-- 2. Instructor: Dr. Marcus Weber, PhD
INSERT INTO public.pmu_instructors (id, slug, full_name, title, bio, qualifications, expertise, status, rating, students_mentored, created_at, updated_at)
VALUES (
    'e0000000-0000-0000-0000-000000000003',
    'dr-marcus-weber',
    'Dr. Marcus Weber, PhD',
    'Principal Security Architect & Offensive Security Specialist',
    'Ph.D. in Information Security & Applied Cryptography from ETH Zurich. Former senior security engineer at Red Hat and lead technical auditor for cloud native infrastructure. Dedicated to training the next generation of ethical security engineers with rigorous hands-on browser labs.',
    'Ph.D. in Computer Science (Applied Cryptography), OSCP, CISSP',
    ARRAY['Network Security', 'SOC Operations', 'Penetration Testing Concepts', 'Applied Cryptography', 'Incident Response'],
    'active',
    4.96,
    980,
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    title = EXCLUDED.title,
    bio = EXCLUDED.bio,
    expertise = EXCLUDED.expertise,
    updated_at = NOW();

-- 3. CyberSecurity Foundations Course
INSERT INTO public.pmu_courses (
    id, track_id, instructor_id, slug, title, subtitle, description,
    level, language, format, prerequisite, thumbnail_url,
    status, is_free_preview_enabled, duration_hours, created_at, updated_at
)
VALUES (
    'c0000000-0000-0000-0000-000000000003',
    '11111111-2222-3333-4444-555555550003',
    'e0000000-0000-0000-0000-000000000003',
    'cybersecurity-foundations-ethical-hacking-soc-ctf',
    'CyberSecurity Foundations: Ethical Hacking, SOC & CTF',
    'Master defensive security, ethical reconnaissance, web vulnerabilities, SOC triage, and CTF solving in safe browser sandboxes.',
    'A comprehensive, hands-on path from security fundamentals to active defense. Learn ethical reconnaissance, inspect network telemetry, analyze synthetic SOC alerts, and capture flags in strictly controlled browser sandboxes.',
    'beginner',
    'English',
    'hybrid',
    'Basic networking concepts and terminal/Linux familiarity',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
    'published',
    TRUE,
    24,
    NOW(),
    NOW()
)
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    is_free_preview_enabled = TRUE,
    updated_at = NOW();

-- 4. 5 Course Modules
INSERT INTO public.pmu_course_modules (id, course_id, module_number, title, description, duration_hours, created_at, updated_at)
VALUES
    ('m0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000003', 1, 'Cybersecurity Mindset and Ethics', 'CIA triad, threat actor models, attack surface reduction, legal boundaries, and responsible disclosure.', 4, NOW(), NOW()),
    ('m0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000003', 2, 'Networking and Reconnaissance', 'IP, DNS, TCP three-way handshake, port states, safe scanning theory, and Nmap concepts.', 5, NOW(), NOW()),
    ('m0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000003', 3, 'Web Application Security', 'HTTP request structures, session fixation, OWASP Top 10 vulnerabilities, and defensive input sanitization.', 5, NOW(), NOW()),
    ('m0000000-0000-0000-0000-000000000014', 'c0000000-0000-0000-0000-000000000003', 4, 'SOC and Incident Investigation', 'Log analysis, SIEM correlation, alert triaging, email headers, and malware sandbox triage concepts.', 5, NOW(), NOW()),
    ('m0000000-0000-0000-0000-000000000015', 'c0000000-0000-0000-0000-000000000003', 5, 'CTF Problem Solving', 'Forensic data extraction, Base64/XOR cryptography, web flags, and systematic problem solving methodologies.', 5, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. CyberSecurity Course Lessons (Lesson 1.1 is the Free Preview)
INSERT INTO public.pmu_course_lessons (id, module_id, lesson_number, title, slug, description, content_markdown, is_free_preview, duration, created_at, updated_at)
VALUES
    ('lesson-c1-01', 'm0000000-0000-0000-0000-000000000011', 1, 'The Ethical Hacker Mindset & Legal Boundaries', 'the-ethical-hacker-mindset-and-legal-boundaries', 'Understanding the boundary between authorized security auditing and illegal computer trespass under IT Act & international laws.', '# The Ethical Hacker Mindset\n\nSecurity is fundamentally about authorization and intent...', TRUE, '20 min', NOW(), NOW()),
    ('lesson-c1-02', 'm0000000-0000-0000-0000-000000000011', 2, 'The CIA Triad & Threat Modeling', 'the-cia-triad-and-threat-modeling', 'Confidentiality, Integrity, and Availability alongside STRIDE threat modeling framework.', '# CIA Triad in Production Systems\n\nSecurity controls must be measured against business impact...', FALSE, '25 min', NOW(), NOW()),
    ('lesson-c1-03', 'm0000000-0000-0000-0000-000000000012', 1, 'TCP/IP Handshake & Packet Inspection', 'tcp-ip-handshake-and-packet-inspection', 'Deep dive into SYN, SYN-ACK, ACK and Wireshark dissection of standard network traffic.', '# TCP Mechanics\n\nEvery network interaction begins with state synchronization...', FALSE, '30 min', NOW(), NOW()),
    ('lesson-c1-04', 'm0000000-0000-0000-0000-000000000013', 1, 'OWASP Top 10: Injection and Broken Access Control', 'owasp-top-10-injection-and-broken-access-control', 'Understanding the mechanics of SQL Injection and IDOR vulnerabilities and parameterized remediation.', '# Web Vulnerability Taxonomy\n\nWeb applications process untrusted user input...', FALSE, '35 min', NOW(), NOW()),
    ('lesson-c1-05', 'm0000000-0000-0000-0000-000000000014', 1, 'SOC Operations & Event Log Correlation', 'soc-operations-and-event-log-correlation', 'How Security Operations Center analysts parse auth.log, Windows Event IDs, and detect lateral movement.', '# SOC Telemetry & Triage\n\nDetecting anomalies requires establishing clean baselines...', FALSE, '30 min', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. CyberSecurity Labs (Lab 1 is the Free Preview)
INSERT INTO public.pmu_cyber_labs (
    id, course_id, module_id, title, slug, description, difficulty,
    lab_type, environment_type, estimated_minutes, is_free_preview, status, created_at, updated_at
)
VALUES
    (
        'a0000000-0000-0000-0000-000000000001',
        'c0000000-0000-0000-0000-000000000003',
        'm0000000-0000-0000-0000-000000000011',
        'HTTP Header & Cookie Security Analyzer',
        'http-header-and-cookie-security-analyzer',
        'Inspect synthetic HTTP response headers, identify missing CSP/HSTS/SameSite protections, and capture the security audit flag.',
        'beginner',
        'guided_lab',
        'browser_sandbox',
        25,
        TRUE,
        'published',
        NOW(),
        NOW()
    ),
    (
        'a0000000-0000-0000-0000-000000000002',
        'c0000000-0000-0000-0000-000000000003',
        'm0000000-0000-0000-0000-000000000012',
        'Nmap & Port Reconnaissance Simulator',
        'nmap-and-port-reconnaissance-simulator',
        'Simulate safe port discovery across a sandbox subnet, analyze service banners, and locate unauthorized listening services.',
        'beginner',
        'simulation',
        'browser_sandbox',
        30,
        FALSE,
        'published',
        NOW(),
        NOW()
    ),
    (
        'a0000000-0000-0000-0000-000000000003',
        'c0000000-0000-0000-0000-000000000003',
        'm0000000-0000-0000-0000-000000000013',
        'Web Defense: SQL Injection & Sanitization Sandbox',
        'web-defense-sql-injection-and-sanitization-sandbox',
        'Analyze how unsanitized string concatenation allows auth bypass and rewrite the query using parameterized statements to extract the flag.',
        'intermediate',
        'ctf_challenge',
        'browser_sandbox',
        40,
        FALSE,
        'published',
        NOW(),
        NOW()
    ),
    (
        'a0000000-0000-0000-0000-000000000004',
        'c0000000-0000-0000-0000-000000000003',
        'm0000000-0000-0000-0000-000000000014',
        'SOC Analyst Incident Log Investigation',
        'soc-analyst-incident-log-investigation',
        'Investigate an alert surge in synthetic Apache & SSH logs, identify the attacker brute-force IP, and uncover the exfiltrated credential flag.',
        'intermediate',
        'investigation',
        'browser_sandbox',
        35,
        FALSE,
        'published',
        NOW(),
        NOW()
    ),
    (
        'a0000000-0000-0000-0000-000000000005',
        'c0000000-0000-0000-0000-000000000003',
        'm0000000-0000-0000-0000-000000000015',
        'Steganography & Crypto Flag Hunter',
        'steganography-and-crypto-flag-hunter',
        'Decode nested Base64 strings, reverse XOR byte masking, and recover the CTF master flag from synthetic forensic artifacts.',
        'intermediate',
        'ctf_challenge',
        'browser_sandbox',
        35,
        FALSE,
        'published',
        NOW(),
        NOW()
    )
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    is_free_preview = EXCLUDED.is_free_preview,
    updated_at = NOW();

-- 7. Lab Tasks with SHA-256 Hashed Flags
INSERT INTO public.pmu_cyber_lab_tasks (
    id, lab_id, task_number, title, instructions, hint,
    expected_flag_hash, flag_format, points, created_at
)
VALUES
    (
        'b0000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        1,
        'Identify Missing Security Headers',
        'Inspect the simulated HTTP response from the payment gateway demo. Identify which header fails the Strict-Transport-Security test and submit the discovered remediation flag.',
        'Check the response headers tab in the interactive inspector. The flag is formatted as PMU{...}',
        '7ae84c24d75b847f4f52c15576e62f6db9b9f253950d703131eeec6b13783e55',
        'PMU{h3ad3r_s3cur1ty_mast3r}',
        25,
        NOW()
    ),
    (
        'b0000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000002',
        1,
        'Discover Unauthorized Listening Ports',
        'Execute safe SYN scan simulation across the subnet to locate unauthorized listening ports and capture the service discovery flag.',
        'Run nmap -sV 10.0.0.1 in the terminal prompt.',
        '7b27724f73b46b564dd6bfa27d5aed954c7e475aa1a2eb18d2b4ad2813ce46c9',
        'PMU{p0rt_22_80_d1sc0v3r3d}',
        35,
        NOW()
    ),
    (
        'b0000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000003',
        1,
        'Neutralize SQL Injection with Prepared Statements',
        'Test authentication bypass payload and implement parameterized statements to neutralize the injection and extract defense flag.',
        'Toggle Prepared Statements mode and test parameterized input query.',
        'e7779ef46508dface08e68c5a3350525b6915bf999d93941bbfaa335e335a1e1',
        'PMU{s4n1t1z3_y0ur_1nputs_4lw4ys}',
        50,
        NOW()
    ),
    (
        'b0000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000004',
        1,
        'Triage Incident & Isolate Compromised Node',
        'Analyze SIEM authentication events, identify brute force source IP, and execute isolation playbook to reveal the analyst flag.',
        'Filter by CRITICAL events and isolate malicious IP 192.168.1.105.',
        '2555876d84702c38a6112e06789bf334b3475bc6cd1a4beffc589757b1e2a77c',
        'PMU{s0c_1nc1d3nt_1s0l4t3d}',
        40,
        NOW()
    ),
    (
        'b0000000-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-000000000005',
        1,
        'Crack Single-Byte XOR Ciphertext',
        'Inspect encrypted hex dump artifact, analyze byte frequencies or brute-force the single-byte key to reveal the hidden flag.',
        'Try XOR key 0x30 or click Auto Brute-Force Key in the tool.',
        '34d3193c57c713022ada9e7f9365e45f05569a965a68fb0fe341dd02438276a6',
        'PMU{x0r_b4s364_cr4ck3d}',
        50,
        NOW()
    )
ON CONFLICT (id) DO NOTHING;

-- 8. CyberSecurity Incident Case: Case 1 is Free Preview
INSERT INTO public.pmu_cyber_incident_cases (
    id, course_id, title, description, difficulty, log_data, questions, status, created_at, updated_at
)
VALUES
    (
        'case-c1-01',
        'c0000000-0000-0000-0000-000000000003',
        'Incident Investigation 101: SSH Brute Force Surge',
        'A sudden spike in failed SSH authentications was alerted by the IDS. Review the raw syslog lines, find the offending external IP address, identify the compromised account, and submit the remediation flag.',
        'beginner',
        '[
            {"timestamp": "2026-11-04T02:14:01Z", "service": "sshd", "status": "Failed password for root from 198.51.100.42 port 49152 ssh2"},
            {"timestamp": "2026-11-04T02:14:03Z", "service": "sshd", "status": "Failed password for admin from 198.51.100.42 port 49153 ssh2"},
            {"timestamp": "2026-11-04T02:14:07Z", "service": "sshd", "status": "Failed password for deploy from 198.51.100.42 port 49154 ssh2"},
            {"timestamp": "2026-11-04T02:14:15Z", "service": "sshd", "status": "Accepted password for devops from 198.51.100.42 port 49155 ssh2"},
            {"timestamp": "2026-11-04T02:14:18Z", "service": "sudo", "status": "devops : TTY=pts/0 ; PWD=/home/devops ; USER=root ; COMMAND=/bin/cat /etc/shadow"}
        ]'::jsonb,
        '[
            {"id": "q1", "prompt": "What is the source IP of the attacker?", "correctAnswer": "198.51.100.42"},
            {"id": "q2", "prompt": "Which username was successfully compromised?", "correctAnswer": "devops"}
        ]'::jsonb,
        'published',
        NOW(),
        NOW()
    )
ON CONFLICT (id) DO NOTHING;
