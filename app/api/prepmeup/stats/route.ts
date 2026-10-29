import { NextResponse } from "next/server";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { getAppOverallMetrics } from "@/app/prepmeup/_lib/studentStore";

export const revalidate = 60;

export async function GET() {
  try {
    const metrics = getAppOverallMetrics();
    const supabase = createPmuServiceClient();

    let totalStudents = metrics.totalRegisteredUsers;
    let totalTopics = 58;
    let quizzesCompleted = metrics.totalQuizzesCompleted;
    let doubtsResolved = metrics.totalDoubtsResolved;

    if (supabase) {
      try {
        const [profilesRes, topicsRes, attemptsRes, doubtsRes] = await Promise.all([
          supabase.from("pmu_profiles").select("id", { count: "exact", head: true }),
          supabase.from("pmu_topics").select("id", { count: "exact", head: true }),
          supabase.from("pmu_quiz_attempts").select("id", { count: "exact", head: true }),
          supabase.from("pmu_doubts").select("id", { count: "exact", head: true }),
        ]);
        if (profilesRes.count !== null && profilesRes.count !== undefined) totalStudents = profilesRes.count;
        if (topicsRes.count !== null && topicsRes.count !== undefined) totalTopics = topicsRes.count;
        if (attemptsRes.count !== null && attemptsRes.count !== undefined) quizzesCompleted = attemptsRes.count;
        if (doubtsRes.count !== null && doubtsRes.count !== undefined) doubtsResolved = doubtsRes.count;
      } catch {}
    }

    return NextResponse.json({
      totalStudents,
      totalTopics,
      quizzesCompleted,
      doubtsResolved,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const metrics = getAppOverallMetrics();
    return NextResponse.json({
      totalStudents: metrics.totalRegisteredUsers,
      totalTopics: 58,
      quizzesCompleted: metrics.totalQuizzesCompleted,
      doubtsResolved: metrics.totalDoubtsResolved,
    });
  }
}
