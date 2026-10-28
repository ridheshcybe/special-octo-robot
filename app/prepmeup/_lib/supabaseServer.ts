import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Returns environment variables for PrepMeUp Supabase project,
 * falling back safely to root NEXT_PUBLIC_SUPABASE_* if PMU-specific ones are unset.
 */
export function getPmuSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_PMU_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_PMU_SUPABASE_ANON_KEY;
  const serviceKey = process.env.PMU_SUPABASE_SERVICE_ROLE_KEY;
  return { url, anonKey, serviceKey };
}

/**
 * Server Client with cookie-bound session handling for student & admin SSR.
 * Uses `supabase.auth.getUser()` on the server for all authorization decisions.
 */
export async function createPmuServerClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = getPmuSupabaseConfig();

  if (!url || !anonKey) return null;

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, {
              ...options,
              httpOnly: true,
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            });
          }
        } catch {
          // In Server Components, write operations are handled in Route Handlers/Server Actions
        }
      },
    },
  });
}

/**
 * Privileged Service-Role Client for server-only operations.
 * NEVER exposed to the browser.
 */
export function createPmuServiceClient() {
  const { url, serviceKey, anonKey } = getPmuSupabaseConfig();
  const key = serviceKey || anonKey;
  if (!url || !key) return null;

  return createSupabaseClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export interface PmuSessionUser {
  userId: string;
  phone?: string | null;
  email?: string | null;
  role: "student" | "admin";
  profile: {
    fullName: string;
    college: string;
    branch: string;
    currentSemester: number;
    isComplete: boolean;
  } | null;
}

/**
 * Authoritative Server-side user resolver using `getUser()`.
 */
export async function getPmuAuthUser(): Promise<PmuSessionUser | null> {
  const supabase = await createPmuServerClient();
  if (!supabase) return null;

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    // 1. Check if user is an admin
    const { data: adminRow } = await supabase
      .from("pmu_admins")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (adminRow) {
      return {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        role: "admin",
        profile: {
          fullName: adminRow.full_name || "Admin",
          college: "Staff",
          branch: "Administration",
          currentSemester: 0,
          isComplete: true,
        },
      };
    }

    // 2. Load student profile
    const { data: profileRow } = await supabase
      .from("pmu_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    const isComplete = Boolean(profileRow?.full_name?.trim());

    return {
      userId: user.id,
      phone: user.phone || profileRow?.phone,
      email: user.email,
      role: "student",
      profile: {
        fullName: profileRow?.full_name || "",
        college: profileRow?.college || "",
        branch: profileRow?.branch || "B.Tech CSE AI/ML",
        currentSemester: profileRow?.current_semester ?? 1,
        isComplete,
      },
    };
  } catch {
    return null;
  }
}
