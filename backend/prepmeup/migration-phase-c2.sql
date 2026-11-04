-- ============================================================================
-- Phase C2: CyberSecurity Commercial Enrollment, Razorpay, Mentorship & Certs
-- 
-- Tables:
-- 1. Extend pmu_course_enrollments (ensure access_type, status, expiration)
-- 2. pmu_cyber_orders
-- 3. pmu_cyber_payments
-- 4. pmu_cyber_mentorship_packs
-- 5. pmu_cyber_early_adopter_redemptions
-- ============================================================================

-- 1. Ensure pmu_course_enrollments supports CyberSecurity access types and status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'pmu_course_enrollments_access_type_check'
    ) THEN
        -- Allow free_preview, semester_pass, mentorship_pack, admin_granted
        ALTER TABLE public.pmu_course_enrollments 
            DROP CONSTRAINT IF EXISTS pmu_course_enrollments_access_type_check;
        ALTER TABLE public.pmu_course_enrollments 
            ADD CONSTRAINT pmu_course_enrollments_access_type_check 
            CHECK (access_type IN ('free_preview', 'semester_pass', 'mentorship_pack', 'admin_granted'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_pmu_course_enrollments_user_course_status 
    ON public.pmu_course_enrollments(user_id, course_id, status);

-- 2. CyberSecurity Orders Table
CREATE TABLE IF NOT EXISTS public.pmu_cyber_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.pmu_profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.pmu_courses(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL CHECK (product_type IN ('semester_pass', 'mentorship_pack')),
    razorpay_order_id TEXT NOT NULL UNIQUE,
    amount_in_paise INT NOT NULL CHECK (amount_in_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'paid', 'failed', 'expired', 'refunded')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmu_cyber_orders_user ON public.pmu_cyber_orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pmu_cyber_orders_rzp_id ON public.pmu_cyber_orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_pmu_cyber_orders_created ON public.pmu_cyber_orders(created_at DESC);

-- 3. CyberSecurity Payments Table
CREATE TABLE IF NOT EXISTS public.pmu_cyber_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.pmu_cyber_orders(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.pmu_profiles(id) ON DELETE CASCADE,
    razorpay_payment_id TEXT NOT NULL UNIQUE,
    razorpay_signature TEXT,
    amount_in_paise INT NOT NULL CHECK (amount_in_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'authorized', 'captured', 'failed', 'refunded')),
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    webhook_status TEXT NOT NULL DEFAULT 'pending' CHECK (webhook_status IN ('pending', 'received', 'processed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmu_cyber_payments_order ON public.pmu_cyber_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_pmu_cyber_payments_user ON public.pmu_cyber_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_pmu_cyber_payments_rzp ON public.pmu_cyber_payments(razorpay_payment_id);

-- 4. CyberSecurity Mentorship Packs Table
CREATE TABLE IF NOT EXISTS public.pmu_cyber_mentorship_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.pmu_profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.pmu_courses(id) ON DELETE CASCADE,
    pack_type TEXT NOT NULL DEFAULT 'single_session' CHECK (pack_type IN ('single_session', 'interview_prep', 'bundle_three')),
    total_sessions INT NOT NULL DEFAULT 1 CHECK (total_sessions > 0),
    used_sessions INT NOT NULL DEFAULT 0 CHECK (used_sessions >= 0),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'exhausted', 'expired', 'revoked')),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '90 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmu_cyber_mentorship_packs_user ON public.pmu_cyber_mentorship_packs(user_id, status);

-- 5. CyberSecurity Early Adopter Redemptions Table
CREATE TABLE IF NOT EXISTS public.pmu_cyber_early_adopter_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.pmu_profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.pmu_courses(id) ON DELETE CASCADE,
    redemption_number INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pmu_cyber_early_adopter_user_course UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_pmu_cyber_early_adopter_user ON public.pmu_cyber_early_adopter_redemptions(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_pmu_cyber_early_adopter_redemption_no ON public.pmu_cyber_early_adopter_redemptions(redemption_number);

-- ============================================================================
-- Row Level Security (RLS) Configuration with Separate Policies
-- ============================================================================

ALTER TABLE public.pmu_cyber_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmu_cyber_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmu_cyber_mentorship_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmu_cyber_early_adopter_redemptions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS: pmu_cyber_orders
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_cyber_orders_select" ON public.pmu_cyber_orders;
CREATE POLICY "pmu_cyber_orders_select" ON public.pmu_cyber_orders
    FOR SELECT USING (
        user_id = auth.uid() OR
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_orders_insert" ON public.pmu_cyber_orders;
CREATE POLICY "pmu_cyber_orders_insert" ON public.pmu_cyber_orders
    FOR INSERT WITH CHECK (
        public.pmu_is_admin() OR
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "pmu_cyber_orders_update" ON public.pmu_cyber_orders;
CREATE POLICY "pmu_cyber_orders_update" ON public.pmu_cyber_orders
    FOR UPDATE USING (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_orders_delete" ON public.pmu_cyber_orders;
CREATE POLICY "pmu_cyber_orders_delete" ON public.pmu_cyber_orders
    FOR DELETE USING (
        public.pmu_is_admin()
    );

-- ----------------------------------------------------------------------------
-- RLS: pmu_cyber_payments
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_cyber_payments_select" ON public.pmu_cyber_payments;
CREATE POLICY "pmu_cyber_payments_select" ON public.pmu_cyber_payments
    FOR SELECT USING (
        user_id = auth.uid() OR
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_payments_insert" ON public.pmu_cyber_payments;
CREATE POLICY "pmu_cyber_payments_insert" ON public.pmu_cyber_payments
    FOR INSERT WITH CHECK (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_payments_update" ON public.pmu_cyber_payments;
CREATE POLICY "pmu_cyber_payments_update" ON public.pmu_cyber_payments
    FOR UPDATE USING (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_payments_delete" ON public.pmu_cyber_payments;
CREATE POLICY "pmu_cyber_payments_delete" ON public.pmu_cyber_payments
    FOR DELETE USING (
        public.pmu_is_admin()
    );

-- ----------------------------------------------------------------------------
-- RLS: pmu_cyber_mentorship_packs
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_cyber_mentorship_packs_select" ON public.pmu_cyber_mentorship_packs;
CREATE POLICY "pmu_cyber_mentorship_packs_select" ON public.pmu_cyber_mentorship_packs
    FOR SELECT USING (
        user_id = auth.uid() OR
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_mentorship_packs_insert" ON public.pmu_cyber_mentorship_packs;
CREATE POLICY "pmu_cyber_mentorship_packs_insert" ON public.pmu_cyber_mentorship_packs
    FOR INSERT WITH CHECK (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_mentorship_packs_update" ON public.pmu_cyber_mentorship_packs;
CREATE POLICY "pmu_cyber_mentorship_packs_update" ON public.pmu_cyber_mentorship_packs
    FOR UPDATE USING (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_mentorship_packs_delete" ON public.pmu_cyber_mentorship_packs;
CREATE POLICY "pmu_cyber_mentorship_packs_delete" ON public.pmu_cyber_mentorship_packs
    FOR DELETE USING (
        public.pmu_is_admin()
    );

-- ----------------------------------------------------------------------------
-- RLS: pmu_cyber_early_adopter_redemptions
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_cyber_early_adopter_select" ON public.pmu_cyber_early_adopter_redemptions;
CREATE POLICY "pmu_cyber_early_adopter_select" ON public.pmu_cyber_early_adopter_redemptions
    FOR SELECT USING (
        user_id = auth.uid() OR
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_early_adopter_insert" ON public.pmu_cyber_early_adopter_redemptions;
CREATE POLICY "pmu_cyber_early_adopter_insert" ON public.pmu_cyber_early_adopter_redemptions
    FOR INSERT WITH CHECK (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_early_adopter_update" ON public.pmu_cyber_early_adopter_redemptions;
CREATE POLICY "pmu_cyber_early_adopter_update" ON public.pmu_cyber_early_adopter_redemptions
    FOR UPDATE USING (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_cyber_early_adopter_delete" ON public.pmu_cyber_early_adopter_redemptions;
CREATE POLICY "pmu_cyber_early_adopter_delete" ON public.pmu_cyber_early_adopter_redemptions
    FOR DELETE USING (
        public.pmu_is_admin()
    );
