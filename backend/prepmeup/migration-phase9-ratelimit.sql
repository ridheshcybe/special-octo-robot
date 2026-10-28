-- Phase 9: Distributed Rate Limiting Table Fallback
-- Keeps track of API consumption when Upstash Redis credentials are omitted.

CREATE TABLE IF NOT EXISTS pmu_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    limit_type TEXT NOT NULL,
    count INT NOT NULL DEFAULT 1,
    first_request_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmu_rate_limits_key ON pmu_rate_limits(identifier, limit_type);

-- RLS: Service role only
ALTER TABLE pmu_rate_limits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'pmu_rate_limits' AND policyname = 'Service role full access on pmu_rate_limits'
    ) THEN
        CREATE POLICY "Service role full access on pmu_rate_limits"
            ON pmu_rate_limits
            FOR ALL
            USING (auth.role() = 'service_role')
            WITH CHECK (auth.role() = 'service_role');
    END IF;
END $$;
