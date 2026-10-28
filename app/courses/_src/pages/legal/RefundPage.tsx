"use client";
import LegalPage, { Section, Bullets } from "./LegalPage";
import {
  CONTACT_EMAIL,
  PLANS_SUMMARY,
  REFUND_MAX_LESSONS_OPENED,
  REFUND_WINDOW_HOURS,
} from "../../lib/site";

export default function RefundPage() {
  return (
    <LegalPage title="Refund & Cancellation Policy">
      <p>
        You're buying access to digital lessons, which you can use the moment
        you pay. That makes refunds tricky — once lessons are watched, the value
        is delivered. Here's a fair middle ground.
      </p>

      <Section title="1. The 48-hour trial window">
        <p>
          If a pass isn't right for you, email me within{" "}
          <strong>{REFUND_WINDOW_HOURS} hours of payment</strong> and I'll refund
          it fully, as long as you have opened{" "}
          <strong>no more than {REFUND_MAX_LESSONS_OPENED} lessons</strong> on
          that account since the payment. That's enough to watch a full lesson
          and decide if the teaching style works for you.
        </p>
        <p className="mt-2">
          Opened more than {REFUND_MAX_LESSONS_OPENED} lessons, or{" "}
          {REFUND_WINDOW_HOURS}+ hours have passed? The pass is non-refundable —
          but it stays active until it expires, and you can always email me if
          something went genuinely wrong (see section 4).
        </p>
      </Section>

      <Section title="2. How to request a refund">
        <p>
          Email <strong>{CONTACT_EMAIL}</strong> from your registered account
          email with the subject <em>"Refund request"</em> and include:
        </p>
        <Bullets
          items={[
            "Your name and registered email",
            "The payment reference (Razorpay payment id — it's in your bank/UPI statement, and on the success page)",
            "One line on why it isn't working for you (helps me improve, not judged)",
          ]}
        />
        <p className="mt-2">
          I'll confirm within {REFUND_WINDOW_HOURS} hours whether it's approved.
        </p>
      </Section>

      <Section title="3. How the money comes back">
        <p>
          Approved refunds go back through Razorpay to the{" "}
          <strong>original payment method</strong> (same UPI/card). Banks
          typically take 5–7 working days to show the credit after I raise it.
          The pass access ends as soon as the refund is approved.
        </p>
      </Section>

      <Section title="4. When I refund outside the window">
        <p>These are on me, not the clock — always refundable:</p>
        <Bullets
          items={[
            "You were charged twice for the same pass.",
            "You paid but access was never activated.",
            "A live session you paid for is cancelled and not rescheduled, and no recording is provided.",
            "A technical fault on my side stops you from using a large part of the pass (e.g. site down for days).",
          ]}
        />
      </Section>

      <Section title="5. Cancellation by you">
        <p>
          Passes are one-time purchases — there is no subscription to cancel and{" "}
          <strong>nothing auto-renews</strong>. When a pass ends, it simply
          stops. To buy more time, buy a pass again; buying while active adds
          days on top of your current end date.
        </p>
      </Section>

      <Section title="6. Price changes">
        <p>
          Current passes:{" "}
          {PLANS_SUMMARY.map((p) => `${p.name} ${p.price}`).join(" · ")}. If
          prices change later, passes already bought are unaffected.
        </p>
      </Section>
    </LegalPage>
  );
}
