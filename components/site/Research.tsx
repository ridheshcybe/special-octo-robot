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
              <a className="paper-link" href={paper.url} target="_blank" rel="noreferrer noopener">
                Read the paper
                <span className="arr" aria-hidden="true">
                  ↗
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
