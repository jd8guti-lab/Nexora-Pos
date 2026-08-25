import { Isotype } from "@/components/brand/isotype";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { about } from "@/content/home";

/**
 * "Quiénes somos", told through the isotype.
 *
 * The "N" means connection, flow and growth (CLAUDE.md §3), so those three
 * are the structure of the section rather than an aside. The mark itself sits
 * large on the left — the one place on the site where it is the subject and
 * not a label.
 */
export function About() {
  return (
    <Section id="quienes-somos">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
        <div className="flex flex-col items-start">
          <Isotype size={148} className="max-w-[40vw]" />
          <div className="mt-8">
            <Eyebrow>{about.intro.eyebrow}</Eyebrow>
            <Heading as="h2" className="mt-4">
              {about.intro.title}
            </Heading>
            {about.intro.lead ? (
              <p className="text-lead text-ink-500 mt-5 max-w-md">{about.intro.lead}</p>
            ) : null}
          </div>
        </div>

        <div>
          {/* Reveal renders the <div> itself: HTML allows dl > div > dt, but
              not another wrapper in between. */}
          <dl className="flex flex-col gap-8">
            {about.meanings.map((meaning, i) => (
              <Reveal
                key={meaning.id}
                delay={i * 0.07}
                className="border-brand-500 border-l-2 pl-5"
              >
                <dt>
                  <Heading as="h3" size="h3">
                    {meaning.title}
                  </Heading>
                </dt>
                <dd className="text-body text-ink-500 mt-2">{meaning.description}</dd>
              </Reveal>
            ))}
          </dl>

          <div className="border-ink-500/15 mt-10 flex flex-col gap-4 border-t pt-8">
            {about.body.map((paragraph) => (
              <p key={paragraph} className="text-body text-ink-500 max-w-xl">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
