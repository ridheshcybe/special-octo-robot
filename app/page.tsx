import { SmoothScroll } from "@/components/SmoothScroll";
import { ContactFooter } from "@/components/site/ContactFooter";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Numbers } from "@/components/site/Numbers";
import { Preloader } from "@/components/site/Preloader";
import { Projects } from "@/components/site/Projects";
import { Research } from "@/components/site/Research";
import { SiteNav } from "@/components/site/SiteNav";
import { Story } from "@/components/site/Story";
import { getSiteContent } from "@/lib/content";
import { getGithubStats } from "@/lib/github";

/** Content changes appear immediately via /api/revalidate, or within a minute. */
export const revalidate = 60;

export default async function Page() {
  const content = await getSiteContent();
  const stats = await getGithubStats(content.numbers.githubUsername);

  return (
    <SmoothScroll>
      <Preloader />
      <SiteNav />

      <main>
        <Hero
          roles={content.heroRoles}
          description={content.heroDescription}
          portraitUrl={content.heroPortraitUrl}
          videoUrl={content.heroVideoUrl}
          posterUrl={content.heroPosterUrl}
        />

        <Marquee words={content.marqueeWords} />

        <Story story={content.story} />

        <Projects projects={content.projects} />

        <Research research={content.research} />

        <Numbers
          heading={content.numbers.heading}
          stats={stats}
          papersCount={content.numbers.papersCount}
        />

        <ContactFooter contact={content.contact} social={content.social} />
      </main>
    </SmoothScroll>
  );
}
