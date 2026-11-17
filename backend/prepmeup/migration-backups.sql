-- ============================================================================
-- PrepMeUp AI & Portfolio: Automated Weekly Supabase Backups Migration
-- Policy: Delete stale backups older than 7 days (1 week) and insert the
--         fresh backup package generated from code & live platform state.
-- ============================================================================

-- 1. Create Supabase Storage Bucket for Backups (Private, Admin/Service-Role Only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'pmu-backups',
    'pmu-backups',
    false,
    52428800, -- 50 MB limit per backup package
    ARRAY['application/json', 'application/gzip']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 52428800;

-- 2. Create System Backups Table
CREATE TABLE IF NOT EXISTS public.pmu_system_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    backup_key TEXT NOT NULL UNIQUE,
    week_identifier TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '1.0.0',
    storage_path TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'code_package',
    size_bytes INT NOT NULL DEFAULT 0 CHECK (size_bytes >= 0),
    checksum_sha256 TEXT NOT NULL,
    summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'stale', 'deleted')),
    created_by TEXT NOT NULL DEFAULT 'system-weekly-cron',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_pmu_system_backups_created_at ON public.pmu_system_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pmu_system_backups_week ON public.pmu_system_backups(week_identifier, status);
CREATE INDEX IF NOT EXISTS idx_pmu_system_backups_expires_at ON public.pmu_system_backups(expires_at);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.pmu_system_backups ENABLE ROW LEVEL SECURITY;

-- Separate Admin-Only RLS Policies for SELECT, INSERT, UPDATE, DELETE
DROP POLICY IF EXISTS pmu_system_backups_select_admin ON public.pmu_system_backups;
CREATE POLICY pmu_system_backups_select_admin
    ON public.pmu_system_backups
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.pmu_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

DROP POLICY IF EXISTS pmu_system_backups_insert_admin ON public.pmu_system_backups;
CREATE POLICY pmu_system_backups_insert_admin
    ON public.pmu_system_backups
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pmu_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

DROP POLICY IF EXISTS pmu_system_backups_update_admin ON public.pmu_system_backups;
CREATE POLICY pmu_system_backups_update_admin
    ON public.pmu_system_backups
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.pmu_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pmu_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

DROP POLICY IF EXISTS pmu_system_backups_delete_admin ON public.pmu_system_backups;
CREATE POLICY pmu_system_backups_delete_admin
    ON public.pmu_system_backups
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.pmu_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- 4. Atomic Weekly Backup Rotation Function
-- Deletes stale backups (> 7 days old or from prior weeks) and inserts the new code backup package
CREATE OR REPLACE FUNCTION public.rotate_weekly_pmu_backups(
    p_backup_key TEXT,
    p_week_identifier TEXT,
    p_storage_path TEXT,
    p_size_bytes INT,
    p_checksum_sha256 TEXT,
    p_summary JSONB,
    p_payload JSONB,
    p_created_by TEXT DEFAULT 'system-weekly-rotation'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INT := 0;
    v_new_id UUID;
BEGIN
    -- Delete stale backups older than 7 days OR from previous weeks
    WITH deleted_rows AS (
        DELETE FROM public.pmu_system_backups
        WHERE created_at < (NOW() - INTERVAL '7 days')
           OR expires_at <= NOW()
           OR week_identifier <> p_week_identifier
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted_count FROM deleted_rows;

    -- Insert the new weekly backup package from code
    INSERT INTO public.pmu_system_backups (
        backup_key,
        week_identifier,
        storage_path,
        source,
        size_bytes,
        checksum_sha256,
        summary,
        payload,
        status,
        created_by,
        created_at,
        expires_at
    ) VALUES (
        p_backup_key,
        p_week_identifier,
        p_storage_path,
        'code_package',
        p_size_bytes,
        p_checksum_sha256,
        p_summary,
        p_payload,
        'active',
        p_created_by,
        NOW(),
        NOW() + INTERVAL '7 days'
    )
    ON CONFLICT (backup_key) DO UPDATE SET
        size_bytes = EXCLUDED.size_bytes,
        checksum_sha256 = EXCLUDED.checksum_sha256,
        summary = EXCLUDED.summary,
        payload = EXCLUDED.payload,
        status = 'active',
        created_at = NOW(),
        expires_at = NOW() + INTERVAL '7 days'
    RETURNING id INTO v_new_id;

    RETURN jsonb_build_object(
        'ok', true,
        'backup_id', v_new_id,
        'backup_key', p_backup_key,
        'week_identifier', p_week_identifier,
        'stale_deleted_count', v_deleted_count
    );
END;
$$;

-- 5. Custom Notifications Table (Admin Notification Sender)
CREATE TABLE IF NOT EXISTS public.pmu_custom_notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'info' CHECK (category IN ('info', 'alert', 'success', 'mentorship')),
    audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'paid', 'free', 'specific_user')),
    recipient_target TEXT,
    cta_label TEXT,
    cta_href TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '3 days')
);

CREATE INDEX IF NOT EXISTS idx_pmu_custom_notifications_active ON public.pmu_custom_notifications(is_active, expires_at DESC);

ALTER TABLE public.pmu_custom_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pmu_custom_notifications_select_public ON public.pmu_custom_notifications;
CREATE POLICY pmu_custom_notifications_select_public
    ON public.pmu_custom_notifications
    FOR SELECT
    USING (is_active = true AND expires_at > NOW());

DROP POLICY IF EXISTS pmu_custom_notifications_manage_admin ON public.pmu_custom_notifications;
CREATE POLICY pmu_custom_notifications_manage_admin
    ON public.pmu_custom_notifications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.pmu_profiles
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

