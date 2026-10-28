"use client";
import LegalPage, { Section, Bullets } from "./LegalPage";
import { PLANS_SUMMARY, SITE_NAME, CONTACT_EMAIL } from "../../lib/site";

export default function PricingDeliveryPage() {
  return (
    <LegalPage title="Pricing & Delivery Policy">
      <p>
        How much things cost, what you get, and when you get it — on one page.
      </p>

      <Section title="1. Prices">
        <Bullets
          items={[
            ...PLANS_SUMMARY.map((p) => (
              <span key={p.name}>
                <strong>{p.name} — {p.price}</strong> (one-time payment, all
                taxes included).
              </span>
            )),
            "Both passes give the same full access to every lesson. The only difference is how long they last.",
          ]}
        />
        <p className="mt-2">
          Prices are in Indian Rupees and are the final amount you pay — no
          hidden charges at checkout.
        </p>
      </Section>

      <Section title="2. What's included">
        <Bullets
          items={[
            "Notes and PDFs for every lesson (viewable online, watermark-free).",
            "Recorded video lessons, watchable as many times as you like while the pass is active.",
            "Live sessions with the teacher, plus the recording afterwards if you missed the class.",
            "Your video progress is saved so you can continue where you stopped.",
          ]}
        />
        <p className="mt-2">
          Not included: printed material, certificates, or one-on-one doubt
          solving outside the live sessions.
        </p>
      </Section>

      <Section title="3. When access starts">
        <p>
          <strong>Immediately.</strong> The moment Razorpay confirms your
          payment, your pass is activated on your account — usually within
          seconds, always within 5 minutes. You don't need to wait for an email
          or a code. If payment succeeds but access doesn't start within 15
          minutes, contact {CONTACT_EMAIL} and it'll be fixed the same day.
        </p>
      </Section>

      <Section title="4. Extending access">
        <p>
          Buying a pass while your current one is still active doesn't waste the
          remaining days — the new days are added on top of your existing end
          date.
        </p>
      </Section>

      <Section title="5. Delivery">
        <p>
          {SITE_NAME} sells <strong>digital access only</strong> — there is no
          physical product and no shipping. Nothing is dispatched, so there are
          no shipping charges and no delivery delays. All content stays on the
          website for as long as your pass is active.
        </p>
      </Section>

      <Section title="6. Payment methods">
        <p>
          UPI, debit cards and credit cards through Razorpay's secure checkout.
          I never see or store your card or UPI details. Failed or stuck
          payments are automatically reversed by your bank within a few working
          days; if you were debited but see no access, email me with the payment
          reference and I'll sort it out.
        </p>
      </Section>

      <Section title="7. Changes">
        <p>
          Prices and pass durations may change in future. The change applies to
          new purchases only — passes you already bought run their full course.
        </p>
      </Section>
    </LegalPage>
  );
}
