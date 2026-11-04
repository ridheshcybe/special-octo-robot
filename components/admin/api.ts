"use client";

import { createClient } from "@/lib/supabase/client";

/** Public-read bucket created by supabase/schema.sql. */
export const BUCKET = "portfolio-assets";

/**
 * Ask the server to revalidate "/" so a save shows up immediately instead of
 * waiting out the 60s window. The route verifies the session itself, so there
 * is no secret in the client.
 */
export async function revalidateSite(): Promise<void> {
  try {
    await fetch("/api/revalidate", { method: "POST" });
  } catch {
    // The 60s revalidation window still picks the change up.
  }
}

/** Upload a file to the portfolio bucket and return its public URL. */
export async function uploadAsset(file: File, folder: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "bin";
  const safeExt = ext.replace(/[^a-z0-9]/g, "") || "bin";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : typeof err === "string" ? err : "Something went wrong.";
