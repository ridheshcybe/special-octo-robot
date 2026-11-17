/**
 * lib/prepmeup/db.ts — Server-only Supabase database client
 *
 * THIS FILE MUST NOT BE IMPORTED INTO CLIENT COMPONENTS (.tsx, .jsx, or
 * anywhere the bundle runs in a browser). It uses the SERVICE_ROLE key,
 * which must never reach the client.
 *
 * Next.js ensures `import` in `serverComponentsOnly` or `dynamic` with
 * `ssr: false` routes keeps this module out of client bundles.
 *
 * Next.js ensures `import` in `serverComponentsOnly` or `dynamic` with
 * `ssr: false` routes keeps this module out of client bundles.
*/

// Supabase import — next/config validates this is a server build.
import { createClient } from '@supabase/supabase-js';

// --- Environment values ---
// These are read at module load time. The service-role key MUST NOT be
// a NEXT_PUBLIC env var; it must be injected as a non-NEXT_PUBLIC env var
// (e.g. via .env production or edge runtime configuration).

export const supabaseUrl = process.env.NEXT_PUBLIC_PMU_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_PMU_SUPABASE_ANON_KEY;

// --- Service-role client factory ---
// This function creates a client using the service-role key. It should
// ONLY be called from server-side routes, api handlers, or server components.
// The key is retrieved from PMU_SUPABASE_SERVICE_ROLE_KEY (not NEXT_PUBLIC).

export function createServiceRoleClient() {
  const serviceKey = process.env.PMU_SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      '[PMU db] PMU_SUPABASE_SERVICE_ROLE_KEY is not set. '
      + 'Add it to your environment (do NOT prefix with NEXT_PUBLIC).'
    );
  }
  return createClient(serviceKey, serviceKey, {
    // Bypass auth buffer so this client acts as the service role
    // regardless of the current session. Used for privileged ops only.
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Typed proxy so consuming modules get compile-time shape safety.
export type ServiceRoleClient = ReturnType<typeof createServiceRoleClient>;

/**
 * WARNING: Do NOT import `createServiceRoleClient` or the service-role key
 * into client components or functions tagged `export const`. The Next.js
 * edge/webpack pipeline will bundle the key into the client output,
 * compromising security. Only import from server-side api routes, server
 * components, or edge runtime handlers.
*/

// Public client shape — for type reference only. The actual public client
// should be created in api routes with the anon key.

export function getPublicClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_PMU_SUPABASE_URL and NEXT_PUBLIC_PMU_SUPABASE_ANON_KEY must be set');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default {
  createServiceRoleClient,
  getPublicClient,
};