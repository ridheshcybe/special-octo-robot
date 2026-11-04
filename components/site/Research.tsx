import type { SiteContent } from "@/lib/types";
import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";
import { TextReveal } from "./TextReveal";

export function Research({ research }: { research: SiteContent["research"] }) {
  return (
    <section className="research" id="research">
      <div className="grid-12">
        <div className="col-5">
          <Reveal as="div">
            <Eyebrow>Published Research</Eyebrow>
          </Reveal>
          <TextReveal text={research.heading} className="t-h2" stagger={90} duration={900} />
        </div>

        <div className="col-7">
          {research.items.map((paper) => (
            <Reveal as="article" key={paper.id} className="paper" duration="560ms">
              <p className="paper-meta">{paper.meta}</p>
              <h3 className="paper-title">{paper.title}</h3>
              <div
                style={{
                  marginTop: "2rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  fontSize: "var(--eyebrow)",
                  fontFamily: "var(--font-mono, monospace)",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: "var(--accent)",
                    display: "inline-block",
                  }}
                  aria-hidden="true"
                />
                <span>Published Research · Peer-Reviewed</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
