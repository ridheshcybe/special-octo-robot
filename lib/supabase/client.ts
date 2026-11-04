"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client, used by the admin panel for auth and writes.
 * Authorization is enforced by the RLS policies in supabase/schema.sql, not by
 * the UI — the anon key is safe to ship.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
    );
  }
  return createBrowserClient(url, key);
}

/** True when the public env vars are configured. */
export const hasSupabaseEnv = () =>
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
