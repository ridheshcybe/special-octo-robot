import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import { getStudentQuantumProgress, getAllQuantumQuizzes } from "@/app/prepmeup/_lib/trackStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    const studentId = identity?.canonicalId || "student-guest-user";

    const progress = getStudentQuantumProgress(studentId);
    const quizzes = getAllQuantumQuizzes();

    // Module-by-module breakdown
    const modules = [
      { moduleNumber: 1, title: "Mathematical Foundations & Qubits", totalLessons: 4 },
      { moduleNumber: 2, title: "Quantum Gates & Circuit Mathematics", totalLessons: 4 },
      { moduleNumber: 3, title: "Quantum Algorithms: Deutsch, Grover & Simon", totalLessons: 4 },
      { moduleNumber: 4, title: "Error Mitigation, Noise & Decoherence", totalLessons: 4 },
      { moduleNumber: 5, title: "Quantum Hardware, NISQ & Qiskit 1.0+", totalLessons: 4 },
    ];

    const moduleStats = modules.map((m) => {
      const prefix = `lesson-q${m.moduleNumber}-`;
      const completedInMod = progress.completedLessons.filter((l) => l.startsWith(prefix)).length;
      const quizForMod = quizzes.find((q) => q.moduleNumber === m.moduleNumber);
      const quizPassed = quizForMod ? progress.passedQuizzes.includes(quizForMod.id) : false;

      return {
        moduleNumber: m.moduleNumber,
        title: m.title,
        completedLessons: completedInMod,
        totalLessons: m.totalLessons,
        quizPassed,
        percentage: Math.round((completedInMod / m.totalLessons) * 80 + (quizPassed ? 20 : 0)),
      };
    });

    return NextResponse.json({
      ok: true,
      progress: {
        completedLessons: progress.completedLessons,
        completedLessonsCount: progress.completedLessons.length,
        totalLessons: 20,
        completedSimulations: progress.completedSimulations,
        completedSimulationsCount: progress.completedSimulations.length,
        totalSimulations: 5,
        passedQuizzes: progress.passedQuizzes,
        passedQuizzesCount: progress.passedQuizzes.length,
        totalQuizzes: 5,
        completionPercentage: progress.completionPercentage,
        certificateStatus: progress.certificateStatus,
        certificateCode: progress.certificateCode,
        moduleStats,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load quantum progress." },
      { status: 500 }
    );
  }
}
