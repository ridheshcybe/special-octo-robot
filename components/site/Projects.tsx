import type { SiteContent } from "@/lib/types";
import { Eyebrow } from "./Eyebrow";
import { LiquidImage } from "./LiquidImage";
import { Reveal } from "./Reveal";
import { TextReveal } from "./TextReveal";

export function Projects({ projects }: { projects: SiteContent["projects"] }) {
  return (
    <section className="projects" id="projects">
      <div className="projects-head">
        <div>
          <Reveal as="div">
            <Eyebrow>Selected Projects</Eyebrow>
          </Reveal>
          <TextReveal text={projects.heading} className="t-h2" stagger={90} duration={900} />
        </div>
        <Reveal as="p" className="label project-count">
          {projects.countLabel}
        </Reveal>
      </div>

      <ul className="project-list">
        {projects.items.map((project, i) => {
          // Odd-indexed cards (2nd, 4th) sit lower and land 120ms later.
          const offset = i % 2 === 1;
          const isInternalLink = Boolean(project.href && project.href.startsWith("/"));
          const linkHref = isInternalLink ? project.href! : "#projects";

          return (
            <Reveal
              as="li"
              key={project.id}
              className="project-item"
              y="60px"
              duration="620ms"
              delay={offset ? "120ms" : undefined}
            >
              <a
                className="project-card"
                href={linkHref}
                data-href={linkHref}
              >
                <LiquidImage
                  src={project.imageUrl}
                  alt={project.name}
                  label={project.name}
                  scale={28}
                />

                <div className="project-row">
                  <div>
                    <h3 className="project-name">{project.name}</h3>
                    <p className="project-blurb">{project.blurb}</p>
                  </div>
                  <div className="project-meta">
                    <p className="project-year">{project.yearLabel}</p>
                    <p className="project-outcome">{project.outcome}</p>
                  </div>
                </div>

                <p className="project-cat">{project.category}</p>
              </a>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
