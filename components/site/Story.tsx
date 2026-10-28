import type { SiteContent } from "@/lib/types";
import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";
import { TextReveal } from "./TextReveal";

export function Story({ story }: { story: SiteContent["story"] }) {
  return (
    <section className="story" id="story">
      <div className="grid-12">
        <div className="col-6">
          <Reveal as="div">
            <Eyebrow>The Story</Eyebrow>
          </Reveal>
          <TextReveal text={story.heading} className="t-h2" stagger={90} duration={900} />
          <Reveal as="p" className="p-lead" duration="520ms">
            {story.body}
          </Reveal>
        </div>

        <div className="col-6 story-right">
          <ul className="principles">
            {story.principles.map((principle, i) => (
              <Reveal
                as="li"
                key={principle.id}
                duration="560ms"
                delay={`${i * 90}ms`}
              >
                <span className="principle-index">{principle.index}</span>
                <div>
                  <h3 className="principle-title">{principle.title}</h3>
                  <p className="principle-copy">{principle.body}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
