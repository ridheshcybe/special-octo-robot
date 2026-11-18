import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string) ||
  "https://www.prepmeupai.in";

const SESSION_KEY = "pmu_mobile_session_v1";

export interface MobileUserSession {
  identifier: string;
  type: "email" | "phone";
  fullName?: string;
  college?: string;
  branch?: string;
  tier?: string;
  cookieHeader?: string;
}

export async function getSavedSession(): Promise<MobileUserSession | null> {
  try {
    const raw = await SecureStore.getItemAsync(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MobileUserSession;
  } catch {
    return null;
  }
}

export async function saveSession(session: MobileUserSession): Promise<void> {
  try {
    await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors on web preview
  }
}

export async function clearSession(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  } catch {
    // Ignore storage errors
  }
}

export async function sendOtpRequest(identifier: string): Promise<{
  ok: boolean;
  error?: string;
  devMockCode?: string;
}> {
  const clean = identifier.trim();
  const isEmail = clean.includes("@");
  try {
    const res = await fetch(`${API_BASE_URL}/api/prepmeup/auth/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: clean,
        email: isEmail ? clean : undefined,
        phone: !isEmail ? clean : undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "Could not send verification code." };
    }
    return { ok: true, devMockCode: data.devMockCode };
  } catch {
    return { ok: false, error: "Network error. Please check your internet connection." };
  }
}

export async function verifyOtpRequest(
  identifier: string,
  code: string
): Promise<{
  ok: boolean;
  error?: string;
  session?: MobileUserSession;
}> {
  const clean = identifier.trim();
  const isEmail = clean.includes("@");
  try {
    const res = await fetch(`${API_BASE_URL}/api/prepmeup/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target: clean,
        identifier: clean,
        email: isEmail ? clean : undefined,
        phone: !isEmail ? clean : undefined,
        code: code.trim(),
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "Invalid verification code." };
    }

    const session: MobileUserSession = {
      identifier: clean,
      type: isEmail ? "email" : "phone",
      fullName: data.user?.fullName || clean.split("@")[0],
      college: data.user?.college || "Engineering Student",
      branch: data.user?.branch || "B.Tech CSE AI/ML",
      tier: data.user?.tier || "Free Student",
    };
    await saveSession(session);
    return { ok: true, session };
  } catch {
    return { ok: false, error: "Network error while verifying code." };
  }
}

export interface DailyCapsuleNote {
  topic: string;
  subjectCode: string;
  summary: string;
  formulaOrKeyPoint?: string;
  xpReward: number;
}

export async function fetchDailyCapsule(): Promise<DailyCapsuleNote> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/prepmeup/daily-note`);
    const json = await res.json();
    if (json?.ok && json.data) {
      return {
        topic: json.data.topic || "Cayley-Hamilton Theorem & Matrix Inverse",
        subjectCode: json.data.subjectCode || "CSE1001",
        summary:
          json.data.summary ||
          "Every square matrix satisfies its own characteristic equation det(A - λI) = 0.",
        formulaOrKeyPoint:
          json.data.formula || "P(λ) = det(A - λI) = 0 ⇒ P(A) = 0",
        xpReward: json.data.xpReward || 25,
      };
    }
  } catch {
    // Fallback below
  }
  return {
    topic: "Cayley-Hamilton Theorem & Eigenvalues",
    subjectCode: "CSE1001",
    summary:
      "Every square matrix satisfies its own characteristic polynomial equation, enabling O(n³) inverse computation and matrix power reduction.",
    formulaOrKeyPoint: "det(A - λI) = 0  ⇒  Aⁿ + c₁Aⁿ⁻¹ + ... + cₙI = 0",
    xpReward: 25,
  };
}

export async function askAiDoubtTutor(params: {
  subjectCode: string;
  question: string;
}): Promise<{ ok: boolean; answer: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/prepmeup/doubts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectCode: params.subjectCode,
        title: params.question.slice(0, 80),
        question: params.question,
      }),
    });
    const data = await res.json();
    if (res.ok && (data?.doubt?.aiResponse || data?.answer || data?.reply)) {
      return {
        ok: true,
        answer: data.doubt?.aiResponse || data.answer || data.reply,
      };
    }
  } catch {
    // Fallback local academic assistant response if offline
  }

  return {
    ok: true,
    answer: `Syllabus Breakdown (${params.subjectCode}):\n\n1. Core Concept: Start by stating the governing definition or theorem clearly as required in university Semester 1 evaluations.\n\n2. Step-by-Step Derivation / Application:\n• Identify the given parameters and boundary conditions.\n• Apply the standard ${params.subjectCode} formulation.\n• Verify units, edge cases, or matrix dimensions.\n\nTip: Tap "Open Full Web Workbench" above to view the rendered LaTeX equations and interactive simulator for this topic.`,
  };
}
