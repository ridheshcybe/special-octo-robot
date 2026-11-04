-- ============================================================================
-- Phase C1: CyberSecurity Track, Labs, CTF Framework & Ethical Safeguards
-- 
-- Tables:
-- 1. pmu_cyber_labs
-- 2. pmu_cyber_lab_tasks
-- 3. pmu_cyber_lab_attempts
-- 4. pmu_cyber_lab_progress
-- 5. pmu_cyber_incident_cases
-- 6. pmu_lab_acceptances
-- ============================================================================

-- 1. CyberSecurity Labs Table
CREATE TABLE IF NOT EXISTS public.pmu_cyber_labs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.pmu_courses(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.pmu_course_modules(id) ON DELETE SET NULL,
    lesson_id UUID REFERENCES public.pmu_course_lessons(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    lab_type TEXT NOT NULL CHECK (lab_type IN ('guided_lab', 'ctf_challenge', 'simulation', 'investigation')),
    environment_type TEXT NOT NULL DEFAULT 'browser_sandbox' CHECK (environment_type IN ('browser_sandbox', 'docker_sandbox', 'external_sandbox')),
    estimated_minutes INT NOT NULL DEFAULT 30,
    is_free_preview BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmu_cyber_labs_course ON public.pmu_cyber_labs(course_id);
CREATE INDEX IF NOT EXISTS idx_pmu_cyber_labs_module ON public.pmu_cyber_labs(module_id);
CREATE INDEX IF NOT EXISTS idx_pmu_cyber_labs_status ON public.pmu_cyber_labs(status);

-- 2. CyberSecurity Lab Tasks Table (CTF flag challenges & guided checkpoints)
CREATE TABLE IF NOT EXISTS public.pmu_cyber_lab_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID NOT NULL REFERENCES public.pmu_cyber_labs(id) ON DELETE CASCADE,
    task_number INT NOT NULL,
    title TEXT NOT NULL,
    instructions TEXT NOT NULL,
    hint TEXT,
    expected_flag_hash TEXT NOT NULL, -- SHA-256 hash of expected flag; never expose in cleartext
    flag_format TEXT DEFAULT 'PMU{...}',
    points INT NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmu_cyber_lab_tasks_lab ON public.pmu_cyber_lab_tasks(lab_id, task_number);

-- 3. CyberSecurity Lab Attempts Table
CREATE TABLE IF NOT EXISTS public.pmu_cyber_lab_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lab_id UUID NOT NULL REFERENCES public.pmu_cyber_labs(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.pmu_cyber_lab_tasks(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES public.pmu_profiles(id) ON DELETE CASCADE,
    submitted_flag TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    points_awarded INT NOT NULL DEFAULT 0,
    attempt_number INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmu_cyber_lab_attempts_user_lab ON public.pmu_cyber_lab_attempts(user_id, lab_id);
CREATE INDEX IF NOT EXISTS idx_pmu_cyber_lab_attempts_task ON public.pmu_cyber_lab_attempts(task_id);

-- 4. CyberSecurity Lab Progress Table
CREATE TABLE IF NOT EXISTS public.pmu_cyber_lab_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.pmu_profiles(id) ON DELETE CASCADE,
    lab_id UUID NOT NULL REFERENCES public.pmu_cyber_labs(id) ON DELETE CASCADE,
    completion_percentage NUMERIC NOT NULL DEFAULT 0.0,
    solved_tasks INT NOT NULL DEFAULT 0,
    total_tasks INT NOT NULL DEFAULT 0,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pmu_cyber_lab_progress_user_lab UNIQUE (user_id, lab_id)
);

CREATE INDEX IF NOT EXISTS idx_pmu_cyber_lab_progress_user ON public.pmu_cyber_lab_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_pmu_cyber_lab_progress_lab ON public.pmu_cyber_lab_progress(lab_id);

-- 5. CyberSecurity Incident Cases Table
CREATE TABLE IF NOT EXISTS public.pmu_cyber_incident_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.pmu_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    log_data JSONB NOT NULL DEFAULT '[]'::jsonb,
    network_capture_path TEXT,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'under_review', 'approved', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmu_cyber_incident_cases_course ON public.pmu_cyber_incident_cases(course_id, status);

-- 6. Ethical Use & Safety Acceptance Table
CREATE TABLE IF NOT EXISTS public.pmu_lab_acceptances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.pmu_profiles(id) ON DELETE CASCADE,
    lab_id UUID NOT NULL REFERENCES public.pmu_cyber_labs(id) ON DELETE CASCADE,
    accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    accepted_policy_version TEXT NOT NULL DEFAULT 'v1.0-ethical-use',
    CONSTRAINT uq_pmu_lab_acceptances_user_lab_ver UNIQUE (user_id, lab_id, accepted_policy_version)
);

CREATE INDEX IF NOT EXISTS idx_pmu_lab_acceptances_lookup ON public.pmu_lab_acceptances(user_id, lab_id);


-- ============================================================================
-- Row-Level Security (RLS) Configuration with Separate Policies
-- ============================================================================

ALTER TABLE public.pmu_cyber_labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmu_cyber_lab_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmu_cyber_lab_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmu_cyber_lab_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmu_cyber_incident_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmu_lab_acceptances ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS: pmu_cyber_labs
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_cyber_labs_select" ON public.pmu_cyber_labs;
CREATE POLICY "pmu_cyber_labs_select" ON public.pmu_cyber_labs
    FOR SELECT USING (
        status = 'published' OR
        public.pmu_is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pmu_courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "pmu_cyber_labs_insert" ON public.pmu_cyber_labs;
CREATE POLICY "pmu_cyber_labs_insert" ON public.pmu_cyber_labs
    FOR INSERT WITH CHECK (
        public.pmu_is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pmu_courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "pmu_cyber_labs_update" ON public.pmu_cyber_labs;
CREATE POLICY "pmu_cyber_labs_update" ON public.pmu_cyber_labs
    FOR UPDATE USING (
        public.pmu_is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pmu_courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "pmu_cyber_labs_delete" ON public.pmu_cyber_labs;
CREATE POLICY "pmu_cyber_labs_delete" ON public.pmu_cyber_labs
    FOR DELETE USING (
        public.pmu_is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pmu_courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- RLS: pmu_cyber_lab_tasks
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_cyber_lab_tasks_select" ON public.pmu_cyber_lab_tasks;
CREATE POLICY "pmu_cyber_lab_tasks_select" ON public.pmu_cyber_lab_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pmu_cyber_labs l
            WHERE l.id = lab_id AND (
                l.status = 'published' OR
                public.pmu_is_admin() OR
                EXISTS (
                    SELECT 1 FROM public.pmu_courses c
                    WHERE c.id = l.course_id AND c.instructor_id = auth.uid()
                )
            )
        )
    );

DROP POLICY IF EXISTS "pmu_cyber_lab_tasks_insert" ON public.pmu_cyber_lab_tasks;
CREATE POLICY "pmu_cyber_lab_tasks_insert" ON public.pmu_cyber_lab_tasks
    FOR INSERT WITH CHECK (
        public.pmu_is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pmu_cyber_labs l
            JOIN public.pmu_courses c ON c.id = l.course_id
            WHERE l.id = lab_id AND c.instructor_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "pmu_cyber_lab_tasks_update" ON public.pmu_cyber_lab_tasks;
CREATE POLICY "pmu_cyber_lab_tasks_update" ON public.pmu_cyber_lab_tasks
    FOR UPDATE USING (
        public.pmu_is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pmu_cyber_labs l
            JOIN public.pmu_courses c ON c.id = l.course_id
            WHERE l.id = lab_id AND c.instructor_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "pmu_cyber_lab_tasks_delete" ON public.pmu_cyber_lab_tasks;
CREATE POLICY "pmu_cyber_lab_tasks_delete" ON public.pmu_cyber_lab_tasks
    FOR DELETE USING (
        public.pmu_is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pmu_cyber_labs l
            JOIN public.pmu_courses c ON c.id = l.course_id
            WHERE l.id = lab_id AND c.instructor_id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- RLS: pmu_cyber_lab_attempts
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_cyber_lab_attempts_select" ON public.pmu_cyber_lab_attempts;
CREATE POLICY "pmu_cyber_lab_attempts_select" ON public.pmu_cyber_lab_attempts
    FOR SELECT USING (
        user_id = auth.uid() OR
        public.pmu_is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pmu_cyber_labs l
            JOIN public.pmu_courses c ON c.id = l.course_id
            WHERE l.id = lab_id AND c.instructor_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "pmu_cyber_lab_attempts_insert" ON public.pmu_cyber_lab_attempts;
CREATE POLICY "pmu_cyber_lab_attempts_insert" ON public.pmu_cyber_lab_attempts
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_lab_attempts_update" ON public.pmu_cyber_lab_attempts;
CREATE POLICY "pmu_cyber_lab_attempts_update" ON public.pmu_cyber_lab_attempts
    FOR UPDATE USING (public.pmu_is_admin());

DROP POLICY IF EXISTS "pmu_cyber_lab_attempts_delete" ON public.pmu_cyber_lab_attempts;
CREATE POLICY "pmu_cyber_lab_attempts_delete" ON public.pmu_cyber_lab_attempts
    FOR DELETE USING (public.pmu_is_admin());

-- ----------------------------------------------------------------------------
-- RLS: pmu_cyber_lab_progress
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_cyber_lab_progress_select" ON public.pmu_cyber_lab_progress;
CREATE POLICY "pmu_cyber_lab_progress_select" ON public.pmu_cyber_lab_progress
    FOR SELECT USING (
        user_id = auth.uid() OR
        public.pmu_is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pmu_cyber_labs l
            JOIN public.pmu_courses c ON c.id = l.course_id
            WHERE l.id = lab_id AND c.instructor_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "pmu_cyber_lab_progress_insert" ON public.pmu_cyber_lab_progress;
CREATE POLICY "pmu_cyber_lab_progress_insert" ON public.pmu_cyber_lab_progress
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_lab_progress_update" ON public.pmu_cyber_lab_progress;
CREATE POLICY "pmu_cyber_lab_progress_update" ON public.pmu_cyber_lab_progress
    FOR UPDATE USING (
        user_id = auth.uid() OR public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_lab_progress_delete" ON public.pmu_cyber_lab_progress;
CREATE POLICY "pmu_cyber_lab_progress_delete" ON public.pmu_cyber_lab_progress
    FOR DELETE USING (public.pmu_is_admin());

-- ----------------------------------------------------------------------------
-- RLS: pmu_cyber_incident_cases
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_cyber_incident_cases_select" ON public.pmu_cyber_incident_cases;
CREATE POLICY "pmu_cyber_incident_cases_select" ON public.pmu_cyber_incident_cases
    FOR SELECT USING (
        status = 'published' OR
        public.pmu_is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pmu_courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "pmu_cyber_incident_cases_insert" ON public.pmu_cyber_incident_cases;
CREATE POLICY "pmu_cyber_incident_cases_insert" ON public.pmu_cyber_incident_cases
    FOR INSERT WITH CHECK (
        public.pmu_is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pmu_courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "pmu_cyber_incident_cases_update" ON public.pmu_cyber_incident_cases;
CREATE POLICY "pmu_cyber_incident_cases_update" ON public.pmu_cyber_incident_cases
    FOR UPDATE USING (
        public.pmu_is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pmu_courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "pmu_cyber_incident_cases_delete" ON public.pmu_cyber_incident_cases;
CREATE POLICY "pmu_cyber_incident_cases_delete" ON public.pmu_cyber_incident_cases
    FOR DELETE USING (
        public.pmu_is_admin() OR
        EXISTS (
            SELECT 1 FROM public.pmu_courses c
            WHERE c.id = course_id AND c.instructor_id = auth.uid()
        )
    );

-- ----------------------------------------------------------------------------
-- RLS: pmu_lab_acceptances
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_lab_acceptances_select" ON public.pmu_lab_acceptances;
CREATE POLICY "pmu_lab_acceptances_select" ON public.pmu_lab_acceptances
    FOR SELECT USING (
        user_id = auth.uid() OR public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_lab_acceptances_insert" ON public.pmu_lab_acceptances;
CREATE POLICY "pmu_lab_acceptances_insert" ON public.pmu_lab_acceptances
    FOR INSERT WITH CHECK (
        user_id = auth.uid() OR public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_lab_acceptances_update" ON public.pmu_lab_acceptances;
CREATE POLICY "pmu_lab_acceptances_update" ON public.pmu_lab_acceptances
    FOR UPDATE USING (public.pmu_is_admin());

DROP POLICY IF EXISTS "pmu_lab_acceptances_delete" ON public.pmu_lab_acceptances;
CREATE POLICY "pmu_lab_acceptances_delete" ON public.pmu_lab_acceptances
    FOR DELETE USING (public.pmu_is_admin());
