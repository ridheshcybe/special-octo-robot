import type { SiteContent } from "@/lib/types";
import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";
import { TextReveal } from "./TextReveal";

type ContactFooterProps = {
  contact: SiteContent["contact"];
  social: SiteContent["social"];
};

export function ContactFooter({ contact, social }: ContactFooterProps) {
  return (
    <footer className="site-footer" id="contact">
      <Reveal as="div">
        <Eyebrow>Let&apos;s Build</Eyebrow>
      </Reveal>

      <TextReveal
        text={contact.heading}
        className="t-h1-up footer-head"
        stagger={90}
        duration={950}
      />

      <Reveal as="p" className="p-lead" duration="520ms">
        {contact.body}
      </Reveal>

      <p className="email" style={{ cursor: "default", userSelect: "all" }}>
        {contact.email}
      </p>

      <div className="footer-bar">
        <div className="fb-brand">
          <p className="fb-sign">Ridhesh Walavalkar</p>
          <p className="fb-note">Designed &amp; built with conviction.</p>
        </div>

        <nav className="fb-social" aria-label="Social">
          <ul className="social">
            {social.map((link) => (
              <li key={link.id}>
                <span
                  style={{
                    color: "var(--muted)",
                    fontSize: "var(--body)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {link.label}
                </span>
              </li>
            ))}
          </ul>
        </nav>

        <div className="fb-copy">
          <p>© 2026 Ridhesh Walavalkar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
