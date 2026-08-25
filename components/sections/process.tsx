import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { processIntro, processSteps } from "@/content/process";

/**
 * "Cómo trabajamos" — four numbered steps.
 *
 * An <ol>, because the order is the whole point: a screen reader announces
 * "list of 4" and each item's position, which is exactly the information the
 * visual timeline carries.
 *
 * The connecting line is a single absolutely-positioned rule behind the
 * numbers, aria-hidden. On a phone it runs vertically down the left; from
 * `md` it runs horizontally. Nothing about it is load-bearing — remove it and
 * the section still reads correctly.
 */
export function Process() {
  return (
    <Section bg="paper" id="proceso">
      <div className="max-w-2xl">
        <Eyebrow>{processIntro.eyebrow}</Eyebrow>
        <Heading as="h2" className="mt-4">
          {processIntro.title}
        </Heading>
        {processIntro.lead ? (
          <p className="text-lead text-ink-500 mt-5">{processIntro.lead}</p>
        ) : null}
      </div>

      {/* The rail lives outside the <ol>: a list may only contain <li>. */}
      <div className="relative mt-12">
        <span
          aria-hidden
          className="bg-ink-500/20 absolute top-0 bottom-0 left-6 w-px md:top-6 md:right-6 md:bottom-auto md:left-6 md:h-px md:w-auto"
        />

        <ol className="relative grid gap-8 md:grid-cols-4 md:gap-6">
          {processSteps.map((step, i) => (
            <Reveal
              as="li"
              key={step.step}
              delay={i * 0.07}
              // Badge beside the text on a phone, above it from md — which is
              // what turns the vertical timeline into a horizontal one.
              className="relative flex gap-4 md:flex-col md:gap-0"
            >
              <span
                aria-hidden
                className="rounded-card bg-brand-500 text-h3 text-ink-900 relative z-10 inline-flex size-12 shrink-0 items-center justify-center font-bold"
              >
                {step.step}
              </span>
              <div className="md:mt-5">
                <Heading as="h3" size="h3">
                  {step.title}
                </Heading>
                <p className="text-body text-ink-500 mt-2">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
