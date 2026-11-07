/**
 * PrepMeUp AI — Phase S1-A production environment validation.
 *
 * Rules:
 *  - Missing variables are grouped by capability so operators know what to fix.
 *  - Variable *names* may be reported; variable *values* never are.
 *  - Insecure development switches are rejected in production.
 *  - Only NEXT_PUBLIC_* variables are allowed to reach the browser; this module
 *    is server-only and is never imported from a client component.
 */

/* Keep dependency‑free for unit testing */
export type PmuEnvCategory =
  | "Supabase"
  | "Razorpay"

  | "Gemini"
  | "App URL"
  | "Certificate signing"
  | "Rate limiting"
  | "Session security";

export interface PmuEnvIssue {
  category: PmuEnvCategory;
  /** Variable names only — never values. */
  variables: string[];
  message: string;
}

export interface PmuEnvValidationResult {
  ok: boolean;
  production: boolean;
  issues: PmuEnvIssue[];
  warnings: PmuEnvIssue[];
}

/* ---------- Razorpay alias block (legacy → unified) ---------- */
if (process.env.UNIFIED_RAZORPAY_KEY_ID) {
  process.env.RAZORPAY_KEY_ID = process.env.UNIFIED_RAZORPAY_KEY_ID;
}
if (process.env.NEXT_PUBLIC_UNIFIED_RAZORPAY_KEY_ID) {
  process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = process.env.UNIFIED_RAZORPAY_KEY_ID;
}
if (process.env.UNIFIED_RAZORPAY_KEY_SECRET) {
  process.env.RAZORPAY_KEY_SECRET = process.env.UNIFIED_RAZORPAY_KEY_SECRET;
}
if (process.env.UNIFIED_RAZORPAY_WEBHOOK_SECRET) {
  process.env.RAZORPAY_WEBHOOK_SECRET = process.env.UNIFIED_RAZORPAY_WEBHOOK_SECRET;
}

/* ---------- Validation configuration ---------- */
interface RequiredGroup {
  category: PmuEnvCategory;
  variables: string[];
  /** Optional predicate that must hold for the group to count as configured. */
  customCheck?: (env: NodeJS.ProcessEnv) => PmuEnvIssue | null;
}

const MIN_SESSION_SECRET_LENGTH = 32;

const REQUIRED_GROUPS: RequiredGroup[] = [
  {
    category: "Session security",
    variables: ["PMU_SESSION_SECRET"],
    customCheck: (env) => {
      const secret = env.PMU_SESSION_SECRET?.trim() || "";
      if (!secret) return null;
      if (secret.length < MIN_SESSION_SECRET_LENGTH) {
        return {
          category: "Session security",
          variables: ["PMU_SESSION_SECRET"],
          message: `PMU_SESSION_SECRET must be at least ${MIN_SESSION_SECRET_LENGTH} characters in production.`,
        };
      }
      return null;
    },
  },
  {
    category: "Supabase",
    variables: [
      "NEXT_PUBLIC_PMU_SUPABASE_URL",
      "NEXT_PUBLIC_PMU_SUPABASE_ANON_KEY",
      "PMU_SUPABASE_SERVICE_ROLE_KEY",
    ],
  },
  {
    category: "Razorpay",
    variables: [
      "UNIFIED_RAZORPAY_KEY_ID",
      "UNIFIED_RAZORPAY_KEY_SECRET",
      "NEXT_PUBLIC_UNIFIED_RAZORPAY_KEY_ID",
      "UNIFIED_RAZORPAY_WEBHOOK_SECRET",
      // Required by the fail‑closed Quantum webhook.
      "RAZORPAY_WEBHOOK_SECRET",
    ],
  },
  // Twilio group removed – OTP via email only
  {
    category: "Gemini",
    variables: ["GEMINI_API_KEY"],
  },
  {
    category: "App URL",
    variables: ["PMU_APP_URL"],
    customCheck: (env) => {
      const appUrl = env.PMU_APP_URL?.trim() || "";
      if (!appUrl) return null;
      if (!appUrl.startsWith("https://")) {
        return {
          category: "App URL",
          variables: ["PMU_APP_URL"],
          message: "PMU_APP_URL must use https in production.",
        };
      }
      return null;
    },
  },
  {
    category: "Certificate signing",
    variables: ["CERTIFICATE_SIGNING_SECRET"],
  },
  {
    category: "Rate limiting",
    variables: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
  },
];

function isBlank(value: string | undefined): boolean {
  return !value || value.trim().length === 0;
}

/** Validates the PrepMeUp environment. Never throws; never reads back values into the result. */
export function validatePmuEnv(env: NodeJS.ProcessEnv = process.env): PmuEnvValidationResult {
  const production = (env.NODE_ENV || "development") === "production";
  const issues: PmuEnvIssue[] = [];
  const warnings: PmuEnvIssue[] = [];

  for (const group of REQUIRED_GROUPS) {
    const missing = group.variables.filter((name) => isBlank(env[name]));
    if (missing.length > 0) {
      const issue: PmuEnvIssue = {
        category: group.category,
        variables: missing,
        message: `Missing ${group.category} configuration: ${missing.join(", ")}`,
      };
      if (production) issues.push(issue);
      else warnings.push(issue);
      continue;
    }
    const customIssue = group.customCheck?.(env);
    if (customIssue) {
      if (production) issues.push(customIssue);
      else warnings.push(customIssue);
    }
  }


  if (production && env.PMU_OTP_DEV_MODE === "true") {
    issues.push({
      category: "Session security",
      variables: ["PMU_OTP_DEV_MODE"],
      message: "PMU_OTP_DEV_MODE must not be enabled in production.",
    });
  }

  if (production && env.PMU_ENABLE_DEV_ADMIN_FALLBACK === "true") {
    issues.push({
      category: "Session security",
      variables: ["PMU_ENABLE_DEV_ADMIN_FALLBACK"],
      message: "PMU_ENABLE_DEV_ADMIN_FALLBACK must not be enabled in production.",
    });
  }

  return { ok: issues.length === 0, production, issues, warnings };
}

/** Throws when the production environment is incomplete. Callers should invoke this at startup (see `instrumentation.ts`). */
export function assertPmuEnv(env: NodeJS.ProcessEnv = process.env): void {
  const result = validatePmuEnv(env);
  if (result.ok) return;

  const summary = result.issues.map((i) => `- ${i.message}`).join("\n");
  throw new Error(
    `PrepMeUp AI production environment is not configured correctly.\n${summary}\nSet the missing variables in the deployment environment. Values are never logged.`
  );
}

/** Development‑only admin fallback gate. */
export function isPmuDevAdminFallbackEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  if ((env.NODE_ENV || "development") === "production") return false;
  if (env.PMU_ENABLE_DEV_ADMIN_FALLBACK !== "true") return false;
  return !isBlank(env.PMU_ADMIN_EMAIL) && !isBlank(env.PMU_ADMIN_PASSWORD);
}
