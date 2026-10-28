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

      <a className="email" href={`mailto:${contact.email}`}>
        {contact.email}
        <span className="arr" aria-hidden="true">
          ↗
        </span>
      </a>

      <div className="footer-bar">
        <div className="fb-brand">
          <p className="fb-sign">Ridhesh Walavalkar</p>
          <p className="fb-note">Designed &amp; built with conviction.</p>
        </div>

        <nav className="fb-social" aria-label="Social">
          <ul className="social">
            {social.map((link) => (
              <li key={link.id}>
                <a href={link.url} target="_blank" rel="noreferrer noopener">
                  {link.label}
                </a>
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
