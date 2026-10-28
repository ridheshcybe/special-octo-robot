import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

const BUCKET_NAME = "pmu-content";

/**
 * Storage helper for PrepMeUp AI documents (notes, past papers, syllabus).
 * Uses private bucket `pmu-content` and generates short-lived signed URLs (10 min expiry).
 */
export async function uploadPrepMeUpFile(params: {
  filePath: string;
  fileBuffer: Buffer | ArrayBuffer | Uint8Array;
  contentType: string;
}): Promise<{ success: boolean; path?: string; error?: string }> {
  const service = createPmuServiceClient();
  if (!service) {
    // In mock development without live Supabase service credentials:
    return { success: true, path: `mock-storage://${params.filePath}` };
  }

  try {
    const { data, error } = await service.storage
      .from(BUCKET_NAME)
      .upload(params.filePath, params.fileBuffer, {
        contentType: params.contentType,
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, path: data.path };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to upload file." };
  }
}

/**
 * Creates a short-lived (max 10-minute / 600s) signed URL for secure streaming.
 * Never exposes permanent or public URLs.
 */
export async function getSecureSignedUrl(filePath: string, expiresInSec: number = 600): Promise<string | null> {
  if (filePath.startsWith("mock-storage://")) {
    return filePath;
  }

  const service = createPmuServiceClient();
  if (!service) return null;

  try {
    const { data, error } = await service.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, Math.min(expiresInSec, 600));

    if (error || !data?.signedUrl) {
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}
