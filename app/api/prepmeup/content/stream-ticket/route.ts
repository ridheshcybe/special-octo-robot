import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getSecureSignedUrl } from "@/lib/prepmeup/storage";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const studentSession = cookieStore.get("pmu-session");
    const adminSession = cookieStore.get("pmu-admin-session");

    // Require either a student session or an admin session
    if (!studentSession?.value && !adminSession?.value) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to stream course documents." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get("filePath");
    const docId = searchParams.get("docId");
    const docType = searchParams.get("type"); // 'notes' | 'pyq'

    if (!filePath && !docId) {
      return NextResponse.json({ ok: false, error: "Document identifier or filePath is required." }, { status: 400 });
    }

    let targetPath = filePath;

    // If ID provided, verify permissions against database
    if (docId) {
      const serviceClient = createPmuServiceClient();
      if (serviceClient) {
        if (docType === "pyq") {
          const { data: paper } = await serviceClient
            .from("pmu_past_papers")
            .select("file_path, is_published")
            .eq("id", docId)
            .maybeSingle();

          if (!paper || (!paper.is_published && !adminSession?.value)) {
            return NextResponse.json({ ok: false, error: "Document not found or unpublished." }, { status: 404 });
          }
          targetPath = paper.file_path;
        } else if (docType === "notes") {
          const { data: note } = await serviceClient
            .from("pmu_notes")
            .select("storage_path, is_published, status, is_sample")
            .eq("id", docId)
            .maybeSingle();

          if (!note || (!note.is_published && !adminSession?.value)) {
            return NextResponse.json({ ok: false, error: "Note not found or pending review." }, { status: 404 });
          }
          targetPath = note.storage_path;
        }
      }
    }

    if (!targetPath) {
      return NextResponse.json({ ok: false, error: "Document storage path unresolvable." }, { status: 404 });
    }

    // Generate signed URL with maximum 10-minute (600s) expiry
    const signedUrl = await getSecureSignedUrl(targetPath, 600);

    if (!signedUrl) {
      // In dev fallback
      return NextResponse.json({
        ok: true,
        streamUrl: `data:application/pdf;base64,JVBERi0xLjcK...`,
        expiresInSec: 600,
      });
    }

    return NextResponse.json({
      ok: true,
      streamUrl: signedUrl,
      expiresInSec: 600,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to generate stream ticket." }, { status: 500 });
  }
}
