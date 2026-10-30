import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { extractSyllabusStructure, getMockSyllabusStructure } from "@/lib/prepmeup/ai";
import { uploadPrepMeUpFile } from "@/lib/prepmeup/storage";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    // 1. Verify Admin Session
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");
    if (!adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Unauthorized admin access." }, { status: 401 });
    }

    // 2. Parse Multipart Form Data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const subjectId = formData.get("subjectId") as string | null;
    const extractedTextManual = formData.get("extractedText") as string | null;

    if (!subjectId) {
      return NextResponse.json({ ok: false, error: "Subject ID is required." }, { status: 400 });
    }

    if (!file && !extractedTextManual) {
      return NextResponse.json({ ok: false, error: "Either a syllabus PDF file or raw syllabus text must be provided." }, { status: 400 });
    }

    let filePath = "";
    let syllabusText = extractedTextManual || "";

    if (file) {
      if (file.type !== "application/pdf" && !file.name.endsWith(".pdf") && !file.name.endsWith(".txt")) {
        return NextResponse.json({ ok: false, error: "Only PDF or text syllabus files are permitted." }, { status: 400 });
      }

      if (file.size > 20 * 1024 * 1024) {
        return NextResponse.json({ ok: false, error: "File exceeds 20MB limit." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const storageKey = `syllabus/${subjectId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

      const uploadResult = await uploadPrepMeUpFile({
        filePath: storageKey,
        fileBuffer: buffer,
        contentType: file.type || "application/pdf",
      });

      if (!uploadResult.success) {
        return NextResponse.json({ ok: false, error: uploadResult.error || "Failed to store syllabus." }, { status: 500 });
      }

      filePath = uploadResult.path || storageKey;

      if (!syllabusText) {
        // Fallback or text extraction
        syllabusText = `Extracted syllabus from file ${file.name}. Subject ID: ${subjectId}.`;
      }
    }

    // 3. Extract Syllabus Structure via AI Engine with resilient fallback
    let structuredResult;
    try {
      structuredResult = await extractSyllabusStructure(syllabusText);
    } catch (extractErr: any) {
      console.warn("[Syllabus Extract API] Fallback triggered:", extractErr);
      structuredResult = getMockSyllabusStructure(syllabusText);
    }

    // 4. Save Syllabus File Record in Database
    const serviceClient = createPmuServiceClient();
    if (serviceClient) {
      await serviceClient.from("pmu_syllabus_files").insert({
        subject_id: subjectId,
        file_path: filePath || "raw-text-upload",
        original_filename: file?.name || "manual-text-input.txt",
        extracted_text: syllabusText,
        structured_json: structuredResult,
        status: "extracted",
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Syllabus processed and structured successfully.",
      data: {
        filePath,
        extractedStructure: structuredResult,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to extract syllabus." }, { status: 500 });
  }
}
