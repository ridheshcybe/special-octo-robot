import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  buildAutomatedDailyGrowthDigest,
  checkAndIncrementGuestTrial,
  getOrCreateStudentReferralCode,
  readGrowthState,
  redeemSquadInviteCode,
  trackReferralAction,
  validatePromoOrSquadCode,
  writeGrowthState,
} from "@/lib/prepmeup/growthEngine";
import {
  canonicalizeStudentKey,
  recordUserPresence,
  resolveSessionIdentity,
} from "@/app/prepmeup/_lib/studentStore";
import { generateDailyNoteWithAI, saveDailyNote } from "@/lib/prepmeup/dailyNotes";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    const studentId = identity?.canonicalId || "guest-campus-ambassador";
    const studentName = identity?.fullName || "Engineering Student";

    const referral = getOrCreateStudentReferralCode(studentId, studentName);
    const digest = buildAutomatedDailyGrowthDigest();
    const state = readGrowthState();

    // Also find any squad codes owned by this student
    const mySquadInvites = Object.values(state.squadInvites).filter(
      (inv) => inv.buyerId === studentId
    );

    return NextResponse.json({
      ok: true,
      data: {
        studentId,
        studentName,
        referral,
        mySquadInvites,
        digest,
        activePromos: [
          { code: "EXAM50", label: "₹50 Off VIP / Squad or ₹30 Off Tier 2 Pro" },
          { code: "DYPIU25", label: "₹25 Campus Batch Discount on Any Pass" },
          { code: referral.referrerCode, label: "Your Personal Referral Code (Friend saves ₹30, you earn VIP rewards)" },
        ],
        metrics: state.metrics,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load growth autopilot." },
      { status: 500 }
    );
  }
}

const GUEST_AI_PRESETS: Record<string, { subject: string; answerMarkdown: string }> = {
  cayley: {
    subject: "CSE1001 • Applied Computational Mathematics",
    answerMarkdown: `### Cayley-Hamilton Theorem — 60-Second Exam Derivation

Every square matrix $A$ satisfies its own characteristic equation $\\det(A - \\lambda I) = 0$.

1. **For a $2 \\times 2$ Matrix $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$:**
   - Trace $\\text{tr}(A) = 2 + 2 = 4$, Determinant $\\det(A) = 4 - 1 = 3$.
   - Characteristic Polynomial: $\\lambda^2 - 4\\lambda + 3 = 0$.
2. **Apply Cayley-Hamilton ($\\lambda \\to A$):**
   $$A^2 - 4A + 3I = 0 \\implies 3I = 4A - A^2$$
3. **Multiply by $A^{-1}$ to find the inverse without adjoints:**
   $$A^{-1} = \\frac{1}{3}(4I - A) = \\frac{1}{3}\\begin{bmatrix} 2 & -1 \\\\ -1 & 2 \\end{bmatrix}$$

> **Exam Tip:** Always verify $A \\cdot A^{-1} = I$ in the margin to secure full 5/5 marks!`,
  },
  thevenin: {
    subject: "CSE1002 • Basic Electrical & Electronics Engineering",
    answerMarkdown: `### Thevenin's Equivalent Circuit & Maximum Power Transfer

Any linear bilateral two-terminal DC network can be replaced by a single voltage source $V_{th}$ in series with an equivalent resistance $R_{th}$:

1. **Step 1 (Open-Circuit Voltage $V_{th}$):** Remove the load resistor $R_L$ across terminals $A-B$ and compute the open-circuit voltage $V_{AB} = V_{th}$ using KVL/nodal analysis.
2. **Step 2 (Equivalent Resistance $R_{th}$):** Deactivate all independent sources (**short** ideal voltage sources, **open** ideal current sources) and find resistance looking into $A-B$.
3. **Step 3 (Load Current & Max Power):**
   $$I_L = \\frac{V_{th}}{R_{th} + R_L}, \\qquad P_{max} = \\frac{V_{th}^2}{4 R_{th}} \\quad (\\text{when } R_L = R_{th})$$`,
  },
  pipeline: {
    subject: "CSE1003 • Computer Organization & Architecture",
    answerMarkdown: `### 5-Stage RISC Pipeline & RAW Data Hazard Forwarding

In a classic 5-stage pipeline (**IF → ID → EX → MEM → WB**):

- **Ideal CPI:** $1.0$ instruction per clock cycle after pipeline fill ($k = 5$ stages).
- **Speedup Equation:**
  $$S = \\frac{n \\cdot k}{k + (n - 1) + \\text{Stall Cycles}}$$
- **RAW (Read-After-Write) Hazard:**
  \`\`\`
  ADD R1, R2, R3   ; Produces R1 at end of EX stage
  SUB R4, R1, R5   ; Needs R1 at start of EX stage
  \`\`\`
  - **Without Forwarding:** Requires **2 stall cycles (bubbles)**.
  - **With ALU-to-ALU Operand Forwarding:** **0 stalls** (result is routed directly from \`EX/MEM\` pipeline register back to ALU input multiplexer).`,
  },
  python: {
    subject: "CSE1005 • Programming with Python",
    answerMarkdown: `### Mutable Default Argument Trap & Time Complexity

**Why \`def append_item(val, items=[]):\` is a classic viva trap:**
- Default parameter values in Python are evaluated **only once** at function definition time (\`def\`), not on every function call.
- Every call that omits \`items\` mutates the **exact same list object** in heap memory!

**Correct Exam Pattern:**
\`\`\`python
def append_item(val, items=None):
    if items is None:
        items = []
    items.append(val)
    return items
\`\`\`
- **Dictionary / Set Lookup:** $O(1)$ average time via open-addressing hash table vs $O(n)$ linear scan for Python \`list\`.`,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || "").trim();

    if (action === "validate_code") {
      const result = validatePromoOrSquadCode(
        String(body.code || ""),
        String(body.tier || "tier2")
      );
      return NextResponse.json({ ok: true, data: result });
    }

    if (action === "redeem_squad_invite") {
      const code = String(body.code || "").trim().toUpperCase();
      const fullName = String(body.fullName || "").trim() || "Squad Member";
      const email = String(body.email || "").trim().toLowerCase();
      const whatsappRaw = String(body.whatsappNumber || "").replace(/\D/g, "").slice(-10);

      if (!email && whatsappRaw.length < 10) {
        return NextResponse.json(
          {
            ok: false,
            error: "Please enter your Name and WhatsApp number (or email) above before redeeming your Squad Pass.",
          },
          { status: 400 }
        );
      }

      const studentId = canonicalizeStudentKey(
        email || (whatsappRaw ? `wa-${whatsappRaw}` : `squad-${Date.now()}`)
      );
      const formattedPhone = whatsappRaw ? `+91${whatsappRaw}` : "+919820743178";

      const redemption = redeemSquadInviteCode({
        code,
        studentId,
        name: fullName,
        email,
        whatsapp: formattedPhone,
      });

      if (!redemption.ok || !redemption.invite) {
        return NextResponse.json(
          { ok: false, error: redemption.error || "Invalid squad code." },
          { status: 400 }
        );
      }

      try {
        recordUserPresence({
          userId: studentId,
          name: fullName,
          target: email || formattedPhone,
          type: email ? "email" : "phone",
          tier: "Tier 2 Pro (₹199)",
          branch: "B.Tech CSE AI/ML",
          activity: `Redeemed Study Squad Pass (${code} from ${redemption.invite.buyerName})`,
          page: "/prepmeup/checkout",
        });
      } catch {}

      const response = NextResponse.json({
        ok: true,
        message: `Squad Invite ${code} redeemed! Your Tier 2 Pro Pass (sponsored by ${redemption.invite.buyerName}) is now active.`,
        data: {
          accessGranted: true,
          studentId,
          tier: "tier2",
          orderId: redemption.invite.orderId,
          paymentId: `squad_redeem_${code}`,
          amountRupees: 0,
          expiresInDays: 180,
          sponsoredBy: redemption.invite.buyerName,
        },
      });

      response.cookies.set(
        "pmu-session",
        JSON.stringify({
          userId: studentId,
          phone: formattedPhone,
          email,
          role: "student",
          isProfileComplete: true,
          fullName,
          branch: "B.Tech CSE AI/ML",
          currentSemester: 1,
          tier: "tier2",
          paidOrderId: redemption.invite.orderId,
          paidPaymentId: `squad_redeem_${code}`,
        }),
        {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 180,
        }
      );

      return response;
    }

    if (action === "track_share") {
      const state = readGrowthState();
      state.metrics.totalWhatsappShares += 1;
      writeGrowthState(state);
      return NextResponse.json({
        ok: true,
        totalWhatsappShares: state.metrics.totalWhatsappShares,
      });
    }

    if (action === "track_referral") {
      const refCode = String(body.refCode || "").trim();
      const eventType = body.eventType === "conversion" ? "conversion" : "click";
      const updated = trackReferralAction(refCode, eventType, body.friendLabel || "Classmate");
      return NextResponse.json({ ok: true, data: updated });
    }

    if (action === "guest_ai_trial") {
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "guest-ip";
      const quota = checkAndIncrementGuestTrial(ip);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            ok: false,
            error: "You have used all 5 free guest AI trials for today! Sign in or unlock your Semester 1 Pass to ask unlimited step-by-step doubts.",
            quota,
          },
          { status: 429 }
        );
      }

      const rawQuestion = String(body.question || "").trim();
      const qLower = rawQuestion.toLowerCase();

      let matchedPreset = GUEST_AI_PRESETS.cayley;
      if (qLower.includes("thevenin") || qLower.includes("kirchhoff") || qLower.includes("circuit") || qLower.includes("power") || qLower.includes("rlc")) {
        matchedPreset = GUEST_AI_PRESETS.thevenin;
      } else if (qLower.includes("pipeline") || qLower.includes("hazard") || qLower.includes("cache") || qLower.includes("cpu") || qLower.includes("coa")) {
        matchedPreset = GUEST_AI_PRESETS.pipeline;
      } else if (qLower.includes("python") || qLower.includes("list") || qLower.includes("dict") || qLower.includes("recursion") || qLower.includes("loop")) {
        matchedPreset = GUEST_AI_PRESETS.python;
      }

      // If Groq API key is configured and custom question is asked, synthesize live response
      const groqKey = process.env.GROQ_API_KEY;
      let answerMarkdown = matchedPreset.answerMarkdown;
      let subjectLabel = matchedPreset.subject;

      if (groqKey && rawQuestion.length > 12 && !body.presetKey) {
        try {
          const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: "llama-3.3-70b-versatile",
              temperature: 0.3,
              max_tokens: 450,
              messages: [
                {
                  role: "system",
                  content:
                    "You are PrepMeUp's B.Tech Semester 1 CSE AI/ML Professor. Give a crisp, exam-focused step-by-step derivation with LaTeX ($...$ and $$...$$) and 1 viva tip in under 180 words.",
                },
                {
                  role: "user",
                  content: rawQuestion,
                },
              ],
            }),
          });
          if (aiRes.ok) {
            const json = await aiRes.json();
            const text = json?.choices?.[0]?.message?.content;
            if (text && text.trim().length > 30) {
              answerMarkdown = text.trim();
              subjectLabel = "Semester 1 AI Doubt Copilot (Live Synthesis)";
            }
          }
        } catch {
          // Fallback to curated instant LaTeX derivation
        }
      } else if (body.presetKey && GUEST_AI_PRESETS[body.presetKey]) {
        matchedPreset = GUEST_AI_PRESETS[body.presetKey];
        answerMarkdown = matchedPreset.answerMarkdown;
        subjectLabel = matchedPreset.subject;
      }

      return NextResponse.json({
        ok: true,
        data: {
          question: rawQuestion || "Explain Cayley-Hamilton Theorem with a 2x2 matrix inverse example",
          subject: subjectLabel,
          answerMarkdown,
          quota,
        },
      });
    }

    if (action === "run_daily_automation") {
      // Optional AI refresh if requested, plus rebuild daily WhatsApp broadcast digest
      if (body.refreshCapsuleWithAI) {
        try {
          const fresh = await generateDailyNoteWithAI(body.topicHint);
          saveDailyNote(fresh);
        } catch {}
      }
      const digest = buildAutomatedDailyGrowthDigest();
      return NextResponse.json({
        ok: true,
        message: "Daily Growth Autopilot executed: Daily Capsule verified & WhatsApp Broadcast Digest generated.",
        data: digest,
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown growth action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Growth autopilot action failed." },
      { status: 500 }
    );
  }
}
