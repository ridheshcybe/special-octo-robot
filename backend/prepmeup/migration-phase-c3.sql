-- ============================================================================
-- Phase C3: Unified PrepMeUp AI Pricing, All-Access Pass, Centralized Checkout
-- & Entitlement Management
-- 
-- Tables:
-- 1. pmu_products
-- 2. pmu_unified_orders
-- 3. pmu_unified_payments
-- 4. pmu_all_access_entitlements
-- 5. pmu_all_access_early_adopter_redemptions
-- ============================================================================

-- 1. Unified Products Catalog Table
CREATE TABLE IF NOT EXISTS public.pmu_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    product_type TEXT NOT NULL CHECK (product_type IN ('semester_pass', 'mentorship_pack', 'all_access_pass')),
    track_id UUID REFERENCES public.pmu_tracks(id) ON DELETE SET NULL,
    course_ids UUID[] DEFAULT ARRAY[]::UUID[],
    price_in_paise INT NOT NULL CHECK (price_in_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    duration_days INT NOT NULL DEFAULT 180 CHECK (duration_days > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_early_adopter_eligible BOOLEAN NOT NULL DEFAULT false,
    early_adopter_limit INT DEFAULT 10,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmu_products_type_active ON public.pmu_products(product_type, is_active);
CREATE INDEX IF NOT EXISTS idx_pmu_products_slug ON public.pmu_products(slug);

-- 2. Unified Orders Table
CREATE TABLE IF NOT EXISTS public.pmu_unified_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.pmu_profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.pmu_products(id) ON DELETE RESTRICT,
    razorpay_order_id TEXT NOT NULL UNIQUE,
    amount_in_paise INT NOT NULL CHECK (amount_in_paise >= 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'pending', 'paid', 'failed', 'expired', 'refunded')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmu_unified_orders_user ON public.pmu_unified_orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_pmu_unified_orders_rzp_id ON public.pmu_unified_orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_pmu_unified_orders_product ON public.pmu_unified_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_pmu_unified_orders_created ON public.pmu_unified_orders(created_at DESC);

-- 3. Unified Payments Table
CREATE TABLE IF NOT EXISTS public.pmu_unified_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.pmu_unified_orders(id) ON DELETE CASCADE,
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

CREATE INDEX IF NOT EXISTS idx_pmu_unified_payments_order ON public.pmu_unified_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_pmu_unified_payments_user ON public.pmu_unified_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_pmu_unified_payments_rzp ON public.pmu_unified_payments(razorpay_payment_id);

-- 4. All-Access Entitlements Table
CREATE TABLE IF NOT EXISTS public.pmu_all_access_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.pmu_profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.pmu_products(id) ON DELETE RESTRICT,
    included_track_ids UUID[] DEFAULT ARRAY[]::UUID[],
    included_course_ids UUID[] DEFAULT ARRAY[]::UUID[],
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '180 days'),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pmu_all_access_entitlements_user ON public.pmu_all_access_entitlements(user_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_pmu_all_access_entitlements_product ON public.pmu_all_access_entitlements(product_id);

-- 5. All-Access Early Adopter Redemptions Table
CREATE TABLE IF NOT EXISTS public.pmu_all_access_early_adopter_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.pmu_profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.pmu_products(id) ON DELETE CASCADE,
    redemption_number INT NOT NULL CHECK (redemption_number > 0),
    status TEXT NOT NULL DEFAULT 'claimed' CHECK (status IN ('claimed', 'revoked')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pmu_all_access_early_adopter_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_pmu_all_access_early_adopter_user ON public.pmu_all_access_early_adopter_redemptions(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_pmu_all_access_early_adopter_no ON public.pmu_all_access_early_adopter_redemptions(product_id, redemption_number);

-- ============================================================================
-- Row Level Security (RLS) Configuration with Separate Policies
-- ============================================================================

ALTER TABLE public.pmu_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmu_unified_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmu_unified_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmu_all_access_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pmu_all_access_early_adopter_redemptions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS: pmu_products
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_products_select" ON public.pmu_products;
CREATE POLICY "pmu_products_select" ON public.pmu_products
    FOR SELECT USING (
        is_active = true OR public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_products_insert" ON public.pmu_products;
CREATE POLICY "pmu_products_insert" ON public.pmu_products
    FOR INSERT WITH CHECK (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_products_update" ON public.pmu_products;
CREATE POLICY "pmu_products_update" ON public.pmu_products
    FOR UPDATE USING (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_products_delete" ON public.pmu_products;
CREATE POLICY "pmu_products_delete" ON public.pmu_products
    FOR DELETE USING (
        public.pmu_is_admin()
    );

-- ----------------------------------------------------------------------------
-- RLS: pmu_unified_orders
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_unified_orders_select" ON public.pmu_unified_orders;
CREATE POLICY "pmu_unified_orders_select" ON public.pmu_unified_orders
    FOR SELECT USING (
        user_id = auth.uid() OR public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_unified_orders_insert" ON public.pmu_unified_orders;
CREATE POLICY "pmu_unified_orders_insert" ON public.pmu_unified_orders
    FOR INSERT WITH CHECK (
        public.pmu_is_admin() OR
        (auth.uid() IS NOT NULL AND user_id = auth.uid())
    );

DROP POLICY IF EXISTS "pmu_unified_orders_update" ON public.pmu_unified_orders;
CREATE POLICY "pmu_unified_orders_update" ON public.pmu_unified_orders
    FOR UPDATE USING (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_unified_orders_delete" ON public.pmu_unified_orders;
CREATE POLICY "pmu_unified_orders_delete" ON public.pmu_unified_orders
    FOR DELETE USING (
        public.pmu_is_admin()
    );

-- ----------------------------------------------------------------------------
-- RLS: pmu_unified_payments
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_unified_payments_select" ON public.pmu_unified_payments;
CREATE POLICY "pmu_unified_payments_select" ON public.pmu_unified_payments
    FOR SELECT USING (
        user_id = auth.uid() OR public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_unified_payments_insert" ON public.pmu_unified_payments;
CREATE POLICY "pmu_unified_payments_insert" ON public.pmu_unified_payments
    FOR INSERT WITH CHECK (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_unified_payments_update" ON public.pmu_unified_payments;
CREATE POLICY "pmu_unified_payments_update" ON public.pmu_unified_payments
    FOR UPDATE USING (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_unified_payments_delete" ON public.pmu_unified_payments;
CREATE POLICY "pmu_unified_payments_delete" ON public.pmu_unified_payments
    FOR DELETE USING (
        public.pmu_is_admin()
    );

-- ----------------------------------------------------------------------------
-- RLS: pmu_all_access_entitlements
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_all_access_entitlements_select" ON public.pmu_all_access_entitlements;
CREATE POLICY "pmu_all_access_entitlements_select" ON public.pmu_all_access_entitlements
    FOR SELECT USING (
        user_id = auth.uid() OR public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_all_access_entitlements_insert" ON public.pmu_all_access_entitlements;
CREATE POLICY "pmu_all_access_entitlements_insert" ON public.pmu_all_access_entitlements
    FOR INSERT WITH CHECK (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_all_access_entitlements_update" ON public.pmu_all_access_entitlements;
CREATE POLICY "pmu_all_access_entitlements_update" ON public.pmu_all_access_entitlements
    FOR UPDATE USING (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_all_access_entitlements_delete" ON public.pmu_all_access_entitlements;
CREATE POLICY "pmu_all_access_entitlements_delete" ON public.pmu_all_access_entitlements
    FOR DELETE USING (
        public.pmu_is_admin()
    );

-- ----------------------------------------------------------------------------
-- RLS: pmu_all_access_early_adopter_redemptions
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "pmu_all_access_early_adopter_select" ON public.pmu_all_access_early_adopter_redemptions;
CREATE POLICY "pmu_all_access_early_adopter_select" ON public.pmu_all_access_early_adopter_redemptions
    FOR SELECT USING (
        user_id = auth.uid() OR public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_all_access_early_adopter_insert" ON public.pmu_all_access_early_adopter_redemptions;
CREATE POLICY "pmu_all_access_early_adopter_insert" ON public.pmu_all_access_early_adopter_redemptions
    FOR INSERT WITH CHECK (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_all_access_early_adopter_update" ON public.pmu_all_access_early_adopter_redemptions;
CREATE POLICY "pmu_all_access_early_adopter_update" ON public.pmu_all_access_early_adopter_redemptions
    FOR UPDATE USING (
        public.pmu_is_admin()
    );

DROP POLICY IF EXISTS "pmu_all_access_early_adopter_delete" ON public.pmu_all_access_early_adopter_redemptions;
CREATE POLICY "pmu_all_access_early_adopter_delete" ON public.pmu_all_access_early_adopter_redemptions
    FOR DELETE USING (
        public.pmu_is_admin()
    );

-- ============================================================================
-- Seed Default Products
-- ============================================================================
INSERT INTO public.pmu_products (
    slug, name, description, product_type, price_in_paise, currency, duration_days, is_active, is_early_adopter_eligible, early_adopter_limit, features
) VALUES
(
    'btech-semester-pass',
    'B.Tech CSE AI/ML Semester Pass',
    'Full semester access to B.Tech Semester 1 coursework, syllabus notes, past papers, and diagnostic quizzes.',
    'semester_pass',
    9900,
    'INR',
    180,
    true,
    false,
    null,
    '["All 6 B.Tech Semester 1 Subjects (CSE1001-CSE1006)", "Verified Class Notes & Cheatsheets", "University Past Solved Papers", "Semester Assessment Quizzes"]'::jsonb
),
(
    'quantum-semester-pass',
    'Quantum Semester Pass',
    'Full access to Quantum Computing Foundations: 20 lessons, 5 hardware simulators, quizzes, AI tutor, and certificate.',
    'semester_pass',
    99900,
    'INR',
    180,
    true,
    false,
    null,
    '["All 20 Quantum Lessons across 5 modules", "All 5 Interactive NISQ Simulators & Bloch Sphere", "Unlimited Quantum AI Tutor", "Academic Certificate of Completion", "1 Included Mentorship Session"]'::jsonb
),
(
    'cybersecurity-semester-pass',
    'CyberSecurity Semester Pass',
    'Comprehensive defensive security & SOC training: 20 lessons, 5 safe browser labs, CTF challenges, AI tutor, and certificate.',
    'semester_pass',
    99900,
    'INR',
    180,
    true,
    false,
    null,
    '["All 20 CyberSecurity Defense Lessons", "All 5 Safe In-Browser Labs & SOC Simulators", "All 5 CTF Challenges with Flag Validation", "Defensive Cyber AI Tutor", "Academic Certificate of Completion", "1 Included Mentorship Session"]'::jsonb
),
(
    'prepmeup-all-access-pass',
    'PrepMeUp All-Access Semester Pass',
    'Unlocks the entire PrepMeUp AI platform: B.Tech CSE AI/ML + Quantum Computing + CyberSecurity Foundations for 6 months.',
    'all_access_pass',
    149900,
    'INR',
    180,
    true,
    true,
    10,
    '["Full B.Tech CSE AI/ML Semester 1 curriculum", "Complete Quantum Computing Foundations track", "Complete CyberSecurity Foundations & Labs track", "Both Academic Certificates of Completion", "2 Complimentary 1-on-1 Mentorship Sessions", "Unlimited Cross-Track AI Doubts"]'::jsonb
),
(
    'quantum-mentorship-pack',
    'Quantum 1-on-1 Mentorship Pack',
    'One dedicated 45-minute live private advisory session with Quantum Computing faculty.',
    'mentorship_pack',
    49900,
    'INR',
    90,
    true,
    false,
    null,
    '["45-Minute Private Session with Dr. Aravind Vaidya, PhD", "Qiskit Code & Quantum Circuit Review", "NISQ Research & Higher Studies Guidance", "90-Day Booking Validity"]'::jsonb
),
(
    'cybersecurity-mentorship-pack',
    'CyberSecurity 1-on-1 Mentorship Pack',
    'One dedicated 45-minute live private advisory session with certified SOC Security Leads.',
    'mentorship_pack',
    49900,
    'INR',
    90,
    true,
    false,
    null,
    '["45-Minute Private Session with Senior SOC Lead", "Defensive Architecture & CTF Walkthroughs", "SOC Analyst Interview Prep & Resume Review", "90-Day Booking Validity"]'::jsonb
),
(
    'all-access-mentorship-pack',
    'All-Access 1-on-1 Mentorship Pack',
    'One dedicated 45-minute flexible mentorship session valid across any enrolled subject or track.',
    'mentorship_pack',
    89900,
    'INR',
    90,
    true,
    false,
    null,
    '["Flexible 45-Minute Session across B.Tech, Quantum, or CyberSecurity", "Comprehensive Engineering Portfolio & Resume Review", "Industry Advisory & Graduate School Guidance", "90-Day Booking Validity"]'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_in_paise = EXCLUDED.price_in_paise,
    features = EXCLUDED.features,
    updated_at = NOW();
