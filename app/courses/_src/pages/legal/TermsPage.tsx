"use client";
import LegalPage, { Section, Bullets } from "./LegalPage";
import { SITE_NAME, PLANS_SUMMARY, CONTACT_EMAIL } from "../../lib/site";

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        These terms are an agreement between you and me, {SITE_NAME} — an
        independent teacher running this website as an individual. By creating an
        account or buying a pass, you accept them. If you don't agree, please
        don't use the site.
      </p>

      <Section title="1. What you are buying">
        <p>
          A pass gives you <strong>time-limited access</strong> to the lessons on
          this site. You are buying access, <strong>not ownership</strong> of any
          content. When your pass ends, access ends. Access is for you alone.
        </p>
        <Bullets
          items={[
            ...PLANS_SUMMARY.map(
              (p) => (
                <span key={p.name}>
                  <strong>{p.name} — {p.price}</strong>: all notes (PDFs), recorded
                  videos and live sessions for {p.days} days.
                </span>
              ),
            ),
            "Both passes include the same content — only the duration differs.",
          ]}
        />
      </Section>

      <Section title="2. Your account">
        <Bullets
          items={[
            "One account per person. Sign up with a real email you check.",
            "You are responsible for keeping your password safe.",
            "Don't share your login with anyone. Logins are tracked and shared logins get suspended.",
            "You must be old enough to agree to these terms, or have a parent/guardian's permission.",
          ]}
        />
      </Section>

      <Section title="3. No sharing, no recording">
        <p>
          All notes, videos and live sessions are mine and are protected by
          copyright. Your pass is a personal licence to watch/read them yourself.
        </p>
        <Bullets
          items={[
            "Do not share your account, screenshots, PDFs, video links or recordings with anyone.",
            "Do not download, re-upload, screen-record or distribute the content anywhere (including Telegram, YouTube or WhatsApp).",
            "Live sessions may not be recorded by you.",
          ]}
        />
        <p className="mt-2">
          Watermarks on videos show your email on purpose — it helps me trace
          leaked copies back to the account that shared them.
        </p>
      </Section>

      <Section title="4. If an account shares content">
        <p>
          I can <strong>suspend or end</strong> any account that shares, records
          or redistributes content, without a refund for the remaining days. For
          small or accidental cases I'll usually warn first and suspend only if
          it continues. Serious leaks (re-uploads, paid reselling) end access
          immediately.
        </p>
      </Section>

      <Section title="5. Content may change">
        <p>
          I keep improving the lessons. I may add, edit, replace or remove
          lessons, teachers, schedules and prices. If a live session is
          cancelled, I'll try to reschedule it or provide the recording; the
          recording replaces the live class if rescheduling isn't possible.
        </p>
      </Section>

      <Section title="6. Service availability">
        <p>
          The site is provided "as is". I'm one person, running it on low-cost
          infrastructure, so I can't promise it will always be online or
          error-free. I aim to fix problems quickly, but maintenance, third-party
          outages (hosting, payments, video) or college exams may interrupt
          service. I'm not liable for losses caused by downtime, and my total
          liability to you is limited to the amount you paid in the 30 days
          before a claim.
        </p>
      </Section>

      <Section title="7. Ending your access">
        <p>
          Your access ends when your pass expires. You can stop using the site
          and delete your account at any time (see the Privacy Policy for how).
          I can also end these terms if you break them.
        </p>
      </Section>

      <Section title="8. Changes to these terms">
        <p>
          I may update these terms as the service changes. The date at the top
          shows the current version. Continuing to use the site after a change
          means you accept it.
        </p>
      </Section>

      <Section title="9. Governing law">
        <p>
          These terms follow Indian law. Any dispute will be handled by the
          courts of {`[YOUR CITY]`} only. Questions? Email {CONTACT_EMAIL}.
        </p>
      </Section>
    </LegalPage>
  );
}
