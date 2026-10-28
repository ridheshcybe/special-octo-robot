import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL as url, SUPABASE_ANON_KEY as anonKey } from "../config";

export const envReady = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Singleton browser client. All writes go through RLS, never a service key. */
export function supabase(): SupabaseClient {
  if (!envReady) {
    throw new Error("Missing NEXT_PUBLIC_COURSES_SUPABASE_URL / _ANON_KEY in .env.local");
  }
  if (!client) client = createClient(url!, anonKey!);
  return client;
}

export interface SessionState {
  userId: string | null;
  email: string | null;
  profile: import("./types").Profile | null;
}

/** Loads the current user + profile (single source for access state). */
export async function loadSession(): Promise<SessionState> {
  if (!envReady) return { userId: null, email: null, profile: null };
  const sb = supabase();
  const { data } = await sb.auth.getSession();
  const user = data.session?.user ?? null;
  if (!user) return { userId: null, email: null, profile: null };

  const { data: profile } = await sb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { userId: user.id, email: user.email ?? null, profile: profile ?? null };
}

export function isAccessActive(profile: { access_expires_at: string | null } | null): boolean {
  return Boolean(profile?.access_expires_at && new Date(profile.access_expires_at) > new Date());
}

export function daysLeft(accessExpiresAt: string | null): number {
  if (!accessExpiresAt) return 0;
  const ms = new Date(accessExpiresAt).getTime() - Date.now();
  return ms <= 0 ? 0 : Math.ceil(ms / 86_400_000);
}

/** POST helper for edge functions — always carries the user's JWT. */
export async function callEdgeFunction(
  endpointUrl: string | undefined,
  body: unknown,
): Promise<Response> {
  if (!endpointUrl) throw new Error("Edge function URL is not configured in .env.local");
  const sb = supabase();
  const { data } = await sb.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sign in first.");

  return fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
}
