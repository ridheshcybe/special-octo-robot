/**
 * Central access to the courses public env vars (see README §courses).
 * These are all NEXT_PUBLIC_* because they ship to the browser by design —
 * the Razorpay secret and the service-role key live only in Supabase edge
 * function secrets. The courses platform uses its OWN Supabase project, so the
 * vars are namespaced with COURSES_ to keep them distinct from the portfolio's.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_COURSES_SUPABASE_URL as string | undefined;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_COURSES_SUPABASE_ANON_KEY as
  | string
  | undefined;

export const CREATE_ORDER_URL = process.env.NEXT_PUBLIC_COURSES_CREATE_ORDER_URL as
  | string
  | undefined;
export const GET_PDF_URL_URL = process.env.NEXT_PUBLIC_COURSES_GET_PDF_URL_URL as
  | string
  | undefined;
export const LESSON_SECRET_URL = process.env.NEXT_PUBLIC_COURSES_LESSON_SECRET_URL as
  | string
  | undefined;
export const GET_VIDEO_URL = process.env.NEXT_PUBLIC_COURSES_GET_VIDEO_URL as string | undefined;
export const GET_HLS_URL = process.env.NEXT_PUBLIC_COURSES_GET_HLS_URL as string | undefined;
export const GET_EXERCISE_URL = process.env.NEXT_PUBLIC_COURSES_GET_EXERCISE_URL as
  | string
  | undefined;
export const GET_LIVE_LINK_URL = process.env.NEXT_PUBLIC_COURSES_GET_LIVE_LINK_URL as
  | string
  | undefined;

export const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_COURSES_RAZORPAY_KEY_ID as
  | string
  | undefined;

/** Base URL for the courses section (Razorpay callback / redirects). */
export const BASE_PATH = "/courses";

/**
 * Resolved lazily — never at module load — so server rendering never touches
 * `window`. Falls back to the configured public URL, then the current origin.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_COURSES_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  return typeof window !== "undefined" ? window.location.origin : "";
}
