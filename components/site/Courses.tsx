import Link from "next/link";
import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";
import { TextReveal } from "./TextReveal";

/** The storefront points at the in-app courses section, not a separate site. */
const COURSES_LINK = "/courses";

type Course = {
  title: string;
  promise: string;
  lessons: number;
  price: string;
};

const COURSES: Course[] = [
  {
    title: "Full-Stack Web, From Zero",
    promise: "HTML to a deployed app — every lesson ships code you keep.",
    lessons: 30,
    price: "₹99",
  },
  {
    title: "Data Structures, Practically",
    promise: "Patterns first, leetcode second — DS explained by building them.",
    lessons: 24,
    price: "₹99",
  },
  {
    title: "Ship Real Projects",
    promise: "Three portfolio-grade builds with code review on every one.",
    lessons: 18,
    price: "₹199",
  },
];

/**
 * Courses section — same cinematic system as the rest of the page: the shared
 * Reveal/TextReveal motion primitives, the .paper hairline row style, and the
 * eyebrow/dot heading pattern. No other section is touched.
 */
export function Courses() {
  return (
    <section className="research courses" id="courses">
      <div className="grid-12">
        <div className="col-5">
          <Reveal as="div">
            <Eyebrow>Courses</Eyebrow>
          </Reveal>
          <TextReveal
            text="Learn by building."
            className="t-h2"
            stagger={90}
            duration={900}
          />
          <Reveal as="p" className="p-lead" duration="520ms">
            For college students who&apos;d rather ship than memorize — short,
            project-first courses with notes, recordings and live doubt sessions.
          </Reveal>
        </div>

        <div className="col-7">
          {COURSES.map((course) => (
            <Reveal as="article" key={course.title} className="paper" duration="560ms">
              <p className="paper-meta">
                {course.lessons} lessons · from {course.price}
              </p>
              <h3 className="paper-title">{course.title}</h3>
              <p className="p-body course-promise">{course.promise}</p>
              <Link className="paper-link" href={COURSES_LINK}>
                Start learning
                <span className="arr" aria-hidden="true">
                  →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
