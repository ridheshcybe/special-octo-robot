-- ============================================================================
-- Phase C0: Production Security Hardening for PrepMeUp AI
-- 
-- Covers:
-- 1. Persistent Razorpay Webhook Idempotency (pmu_webhook_events)
-- 2. Durable Distributed / Database-Backed Rate Limiting (pmu_rate_limit_events)
-- 3. Mentorship Rescheduling & Transition Audit Trail
-- 4. Explicit Separate Row-Level Security (RLS) policies for SELECT, INSERT, UPDATE, DELETE
-- ============================================================================

-- 1. Persistent Webhook Events (Idempotency)
CREATE TABLE IF NOT EXISTS public.pmu_webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'razorpay',
    event_id TEXT NOT NULL,
    event_type TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processing', 'processed', 'failed', 'ignored')),
    attempts INT NOT NULL DEFAULT 1,
    error_message TEXT,
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pmu_webhook_provider_event UNIQUE (provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_pmu_webhook_events_lookup 
    ON public.pmu_webhook_events(provider, event_id);
CREATE INDEX IF NOT EXISTS idx_pmu_webhook_events_status 
    ON public.pmu_webhook_events(status, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_pmu_webhook_events_received_at 
    ON public.pmu_webhook_events(received_at DESC);

-- Enable RLS on pmu_webhook_events
ALTER TABLE public.pmu_webhook_events ENABLE ROW LEVEL SECURITY;

-- Separate RLS policies for pmu_webhook_events
DROP POLICY IF EXISTS "pmu_webhook_events_select" ON public.pmu_webhook_events;
CREATE POLICY "pmu_webhook_events_select" ON public.pmu_webhook_events
    FOR SELECT USING (auth.role() = 'service_role' OR public.pmu_is_admin());

DROP POLICY IF EXISTS "pmu_webhook_events_insert" ON public.pmu_webhook_events;
CREATE POLICY "pmu_webhook_events_insert" ON public.pmu_webhook_events
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR public.pmu_is_admin());

DROP POLICY IF EXISTS "pmu_webhook_events_update" ON public.pmu_webhook_events;
CREATE POLICY "pmu_webhook_events_update" ON public.pmu_webhook_events
    FOR UPDATE USING (auth.role() = 'service_role' OR public.pmu_is_admin());

DROP POLICY IF EXISTS "pmu_webhook_events_delete" ON public.pmu_webhook_events;
CREATE POLICY "pmu_webhook_events_delete" ON public.pmu_webhook_events
    FOR DELETE USING (auth.role() = 'service_role' OR public.pmu_is_admin());


-- 2. Durable Rate Limiting (Sliding Window & Atomic Counter Events)
CREATE TABLE IF NOT EXISTS public.pmu_rate_limit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket_key TEXT NOT NULL,
    identifier TEXT NOT NULL,
    count INT NOT NULL DEFAULT 1,
    window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pmu_rate_limit_bucket_identifier UNIQUE (bucket_key, identifier)
);

CREATE INDEX IF NOT EXISTS idx_pmu_rate_limit_lookup 
    ON public.pmu_rate_limit_events(bucket_key, identifier);
CREATE INDEX IF NOT EXISTS idx_pmu_rate_limit_expiry 
    ON public.pmu_rate_limit_events(expires_at);

-- Enable RLS on pmu_rate_limit_events
ALTER TABLE public.pmu_rate_limit_events ENABLE ROW LEVEL SECURITY;

-- Separate RLS policies for pmu_rate_limit_events
DROP POLICY IF EXISTS "pmu_rate_limit_select" ON public.pmu_rate_limit_events;
CREATE POLICY "pmu_rate_limit_select" ON public.pmu_rate_limit_events
    FOR SELECT USING (auth.role() = 'service_role' OR public.pmu_is_admin());

DROP POLICY IF EXISTS "pmu_rate_limit_insert" ON public.pmu_rate_limit_events;
CREATE POLICY "pmu_rate_limit_insert" ON public.pmu_rate_limit_events
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR public.pmu_is_admin());

DROP POLICY IF EXISTS "pmu_rate_limit_update" ON public.pmu_rate_limit_events;
CREATE POLICY "pmu_rate_limit_update" ON public.pmu_rate_limit_events
    FOR UPDATE USING (auth.role() = 'service_role' OR public.pmu_is_admin());

DROP POLICY IF EXISTS "pmu_rate_limit_delete" ON public.pmu_rate_limit_events;
CREATE POLICY "pmu_rate_limit_delete" ON public.pmu_rate_limit_events
    FOR DELETE USING (auth.role() = 'service_role' OR public.pmu_is_admin());


-- 3. Mentorship Session Transition & State Auditing
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'pmu_mentorship_sessions'
    ) THEN
        ALTER TABLE public.pmu_mentorship_sessions
            ADD COLUMN IF NOT EXISTS is_refunded BOOLEAN NOT NULL DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS is_consumed BOOLEAN NOT NULL DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS rescheduled_from_slot_id UUID,
            ADD COLUMN IF NOT EXISTS last_rescheduled_at TIMESTAMPTZ;
    END IF;
END $$;

-- Audit table for state transitions
CREATE TABLE IF NOT EXISTS public.pmu_mentorship_session_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    actor_id TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    action TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmu_mentorship_session_audit_session
    ON public.pmu_mentorship_session_audit(session_id, created_at DESC);

ALTER TABLE public.pmu_mentorship_session_audit ENABLE ROW LEVEL SECURITY;

-- Separate RLS policies for pmu_mentorship_session_audit
DROP POLICY IF EXISTS "pmu_mentorship_audit_select" ON public.pmu_mentorship_session_audit;
CREATE POLICY "pmu_mentorship_audit_select" ON public.pmu_mentorship_session_audit
    FOR SELECT USING (auth.role() = 'service_role' OR public.pmu_is_admin());

DROP POLICY IF EXISTS "pmu_mentorship_audit_insert" ON public.pmu_mentorship_session_audit;
CREATE POLICY "pmu_mentorship_audit_insert" ON public.pmu_mentorship_session_audit
    FOR INSERT WITH CHECK (auth.role() = 'service_role' OR public.pmu_is_admin());

DROP POLICY IF EXISTS "pmu_mentorship_audit_update" ON public.pmu_mentorship_session_audit;
CREATE POLICY "pmu_mentorship_audit_update" ON public.pmu_mentorship_session_audit
    FOR UPDATE USING (auth.role() = 'service_role' OR public.pmu_is_admin());

DROP POLICY IF EXISTS "pmu_mentorship_audit_delete" ON public.pmu_mentorship_session_audit;
CREATE POLICY "pmu_mentorship_audit_delete" ON public.pmu_mentorship_session_audit
    FOR DELETE USING (auth.role() = 'service_role' OR public.pmu_is_admin());
