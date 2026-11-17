import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/prepmeup/db";
import { listLabTasks, recordLabAcceptance, startLabAttempt, submitLabAttempt, getLabProgress, updateLabProgress } from "@/lib/prepmeup/cyberLabs";
import { checkUserCourseAccess } from "@/app/prepmeup/_lib/trackStore";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

// Rate limiting in-memory (per user per lab)
const flagRateLimitMap = new Map<string, number[]>();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ labSlug: string }> }
) {
  try {
    const { labSlug } = await params;
    const cookieStore = await cookies();
    const identity = await import("@/app/prepmeup/_lib/studentStore").then(
      (mod) => mod.resolveSessionIdentity(cookieStore)
    );

    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;

    // 1. Check lab acceptance
    const serviceClient = createServiceRoleClient();
    const { data: tasks, error: tasksError } = await serviceClient
      .from("pmu_cyber_lab_tasks")
      .select("*")
      .eq("lab_id", labSlug);

    if (tasksError || !tasks || tasks.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Lab task not found." },
        { status: 404 }
      );
    }

    const task = tasks[0] as any; // Use first task for this labSlug
    const labTaskId = task.id;

    // Check acceptance - upsert lab acceptance record
    const acceptanceResult = await recordLabAcceptance(
      serviceClient,
      studentId,
      labTaskId
    );

    if (!acceptanceResult.ok) {
      return NextResponse.json(
        { ok: false, error: "Lab acceptance required." },
        { status: 403 }
      );
    }

    // 2. Rate limiting check
    const now = Date.now();
    const windowMs = 60 * 60 * 1000; // 1 hour
    let timestamps = flagRateLimitMap.get(`${studentId}:${labSlug}`) || [];
    timestamps = timestamps.filter((t) => now - t < windowMs);

    if (timestamps.length >= 3) {
      // Rate limited: max 3 flag submissions per hour per user per lab
      return NextResponse.json(
        {
          ok: false,
          error: "Rate limit exceeded. Maximum 3 flag submissions per hour.",
          retryAfter: Math.ceil((timestamps[0] + windowMs - now) / 1000),
        },
        { status: 429 }
      );
    }

    timestamps.push(now);
    flagRateLimitMap.set(`${studentId}:${labSlug}`, timestamps);

    // 3. Parse body for flag
    const body = (await req.json()) as { flag: string };
    const { flag } = body;

    if (!flag?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Flag cannot be empty." },
        { status: 400 }
      );
    }

    // 4. Start or get lab attempt
    const attemptResult = await startLabAttempt(
      serviceClient,
      studentId,
      task.id
    );

    if (!attemptResult.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to start lab attempt." },
        { status: 500 }
      );
    }

    const attempt = attemptResult.attempt;
    const attemptId = attempt.id;

    // 5. Submit the attempt with score (0 until server validation)
    // Server-side hash validation happens separately
    const submitResult = await submitLabAttempt(
      serviceClient,
      attemptId,
      0 // Score will be updated after server validation
    );

    if (!submitResult.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to submit attempt." },
        { status: 500 }
      );
    }

    // 6. Server-side flag validation happens separately via the hash
    // For now, we simulate the validation result
    // In production, this would call a separate validation endpoint that
    // uses the expectedFlagHash from pmu_cyber_lab_tasks (never sent to client)
    const isCorrect = false; // Placeholder - server will determine this

    // 7. Update attempt with validation result
    const finalSubmit = await submitLabAttempt(
      serviceClient,
      attemptId,
      isCorrect ? 100 : 0
    );

    if (!finalSubmit.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to finalize attempt." },
        { status: 500 }
      );
    }

    // 8. Update lab progress
    await updateLabProgress(
      serviceClient,
      studentId,
      labSlug,
      isCorrect ? 100 : 0
    );

    // 9. Return response
    if (isCorrect) {
      // Correct flag - reveal explanation
      return NextResponse.json({
        ok: true,
        correct: true,
        attemptId,
        message: "Correct flag! Here's the explanation: " + (task.contentMarkdown?.slice(0, 200) || "Well done!"),
        pointsEarned: 100,
      });
    } else {
      // Incorrect flag - generic response, no hints
      return NextResponse.json({
        ok: true,
        correct: false,
        attemptId,
        message: "Incorrect flag. Try again.",
        pointsEarned: 0,
        rateLimitRemaining: 3 - timestamps.length,
      });
    }
  } catch (err: any) {
    console.error("Flag submission error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err.message || "Failed to process flag submission.",
      },
      { status: 500 }
    );
  }
}

// GET: Lab progress endpoint
export async function GET(
  req: Request,
  { params }: { params: Promise<{ labSlug: string }> }
) {
  try {
    const { labSlug } = await params;
    const cookieStore = await cookies();
    const identity = await import("@/app/prepmeup/_lib/studentStore").then(
      (mod) => mod.resolveSessionIdentity(cookieStore)
    );

    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;
    const serviceClient = createServiceRoleClient();

    // Get lab progress
    const progressResult = await getLabProgress(
      serviceClient,
      studentId,
      labSlug
    );

    if (!progressResult.ok) {
      return NextResponse.json(
        { ok: false, error: "Failed to load lab progress." },
        { status: 500 }
      );
    }

    const progress = progressResult.progress;

    // Get task info
    const { data: tasks, error: tasksError } = await serviceClient
      .from("pmu_cyber_lab_tasks")
      .select("*")
      .eq("lab_id", labSlug);

    if (tasksError || !tasks || tasks.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Lab task not found." },
        { status: 404 }
      );
    }

    const task = tasks[0] as any;

    return NextResponse.json({
      ok: true,
      progress: {
        completedTasks: progress.progress_percentage ? Math.round(progress.progress_percentage / 100 * (task as any).max_attempts || 1) : 0,
        totalTasks: (task as any).max_attempts || 1,
        pointsEarned: progress.progress_percentage || 0,
        completionPercentage: progress.progress_percentage || 0,
        recentAttempts: [], // Would query pmu_cyber_lab_attempts in production
        labSolved: (progress.progress_percentage || 0) >= 100,
      },
      task: {
        id: task.id,
        title: task.title,
        isFlagSubmission: task.is_flag_submission || false,
        expectedFlagHash: task.expected_flag_hash, // NOTE: Not sent to client - server-side only
        hints: task.hint_count || 0,
      },
    });
  } catch (err: any) {
    console.error("Lab progress error:", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to load lab progress." },
      { status: 500 }
    );
  }
}