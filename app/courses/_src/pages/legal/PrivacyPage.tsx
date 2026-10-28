"use client";
import LegalPage, { Section, Bullets } from "./LegalPage";
import { CONTACT_EMAIL, OWNER_NAME, RESPONSE_TIME } from "../../lib/site";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        I'm {OWNER_NAME}, an independent teacher, and this website is the only
        place I collect your data. This policy explains, in simple words, what I
        collect, why, and the control you have over it. It follows India's
        Digital Personal Data Protection Act, 2023 (DPDP Act).
      </p>

      <Section title="1. What I collect">
        <Bullets
          items={[
            <>
              <strong>Account details:</strong> your name, email address and
              login credentials (handled by our login provider — I never see
              your password).
            </>,
            <>
              <strong>Payment status:</strong> which pass you bought, when it
              expires, and the payment reference. I never receive or store your
              card number, UPI PIN or bank details.
            </>,
            <>
              <strong>Learning data:</strong> which lessons you opened and your
              video resume positions, so playback continues where you left off.
            </>,
            <>
              <strong>Security logs:</strong> basic sign-in records used to spot
              shared or stolen accounts.
            </>,
          ]}
        />
      </Section>

      <Section title="2. Why I collect it (purpose)">
        <Bullets
          items={[
            "To create your account and let you sign in.",
            "To grant and track the access period you paid for.",
            "To make the product work (resume videos, show your courses, deliver PDFs).",
            "To detect account sharing and protect paid content.",
            "To contact you about your account, refunds or service issues — not for ads.",
            "I do not sell your data to anyone, ever.",
          ]}
        />
      </Section>

      <Section title="3. Payments go through Razorpay">
        <p>
          Payments are processed by <strong>Razorpay</strong> (licensed payment
          gateway). When you pay, Razorpay handles the card/UPI details directly
          under its own privacy policy. I only receive a confirmation and a
          payment reference id. If you save a card for faster checkout, that is
          stored by Razorpay's card vault, not by me.
        </p>
      </Section>

      <Section title="4. Who else can see your data">
        <p>
          I use a small set of service providers to run this site. They process
          data only on my instructions:
        </p>
        <Bullets
          items={[
            <>
              <strong>Supabase</strong> — stores the database (accounts, progress,
              payments status) and handles login.
            </>,
            <>
              <strong>Cloudflare</strong> — serves the website files and the
              video files (your email appears as a watermark on videos you
              watch, to discourage leaks).
            </>,
            <>
              <strong>Razorpay</strong> — processes payments.
            </>,
            <>
              <strong>YouTube</strong> — some recorded videos are embedded via
              YouTube's privacy-enhanced player; YouTube may set its own cookies
              when a video plays. Its handling is covered by Google's privacy
              policy.
            </>,
          ]}
        />
        <p className="mt-2">
          Outside this list, I share data only if the law requires it.
        </p>
      </Section>

      <Section title="5. How long I keep your data">
        <Bullets
          items={[
            "Account and learning data: while your account exists.",
            "Payment records: up to 8 years, because tax law requires it (kept minimal — plan, amount, reference id).",
            "Everything else is deleted within 30 days of you deleting your account.",
          ]}
        />
      </Section>

      <Section title="6. Your rights">
        <p>You can ask me to:</p>
        <Bullets
          items={[
            "Show you the data I hold about you (a copy, free of charge).",
            "Correct anything that is wrong (name, email).",
            "Delete your account and personal data (except the minimal payment records tax law makes me keep).",
            "Withdraw consent — which means deleting your account, since the account is the data.",
          ]}
        />
        <p className="mt-2">
          Email <strong>{CONTACT_EMAIL}</strong> from your registered address.
          I'll act on your request within 30 days.
        </p>
      </Section>

      <Section title="7. Security">
        <p>
          Your data sits with the providers listed above, all of which encrypt
          data in transit and at rest. I can't undo a leak of your own password,
          so use a unique one.
        </p>
      </Section>

      <Section title="8. Children">
        <p>
          The site is meant for college students. If you are under 18, a parent
          or guardian must consent to your use — ask them to email me. I don't
          knowingly track or advertise to children, and I delete data of
          under-18 users whose guardian didn't consent once I learn of it.
        </p>
      </Section>

      <Section title="9. Changes and grievance contact">
        <p>
          If this policy changes in a way that matters, I'll email registered
          users. Questions, data requests or complaints:
        </p>
        <p>
          <strong>Grievance contact:</strong> {OWNER_NAME} ·{" "}
          <strong>{CONTACT_EMAIL}</strong> — replies {RESPONSE_TIME}. If you
          aren't satisfied with my answer, you can complain to India's Data
          Protection Board under the DPDP Act.
        </p>
      </Section>
    </LegalPage>
  );
}
