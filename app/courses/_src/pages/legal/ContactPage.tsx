"use client";
import LegalPage from "./LegalPage";
import { CONTACT_EMAIL, OWNER_NAME, RESPONSE_TIME, JURISDICTION } from "../../lib/site";

export default function ContactPage() {
  return (
    <LegalPage title="Contact">
      <p>
        One person runs this site, and one email reaches me for everything —
        questions before buying, payment trouble, refunds, access problems,
        content requests, or anything about your data.
      </p>

      <section className="card space-y-2 p-5">
        <p className="text-sm text-zinc-500">Email</p>
        <p className="text-lg font-semibold">
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-600 hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p className="text-sm text-zinc-600">
          I reply <strong>{RESPONSE_TIME}</strong>, usually much sooner. Refund
          and access requests are handled first.
        </p>
      </section>

      <section className="space-y-2 text-sm leading-relaxed text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">Good to include</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Your registered email address (the one you sign in with)</li>
          <li>For payment issues: the Razorpay payment id from your bank/UPI statement</li>
          <li>A screenshot if something looks broken — it genuinely helps</li>
        </ul>
      </section>

      <section className="space-y-2 text-sm leading-relaxed text-zinc-700">
        <h2 className="text-base font-semibold text-zinc-900">Who you're writing to</h2>
        <p>
          {OWNER_NAME}, an individual teacher based in {JURISDICTION}. This
          website is a sole-proprietor service — not a company, so you deal with
          me directly, no support tiers.
        </p>
      </section>
    </LegalPage>
  );
}
