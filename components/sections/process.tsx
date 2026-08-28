import Image from "next/image";
import { Section } from "@/components/layout/section";
import { SectionCta } from "@/components/sections/section-cta";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal } from "@/components/motion/reveal";
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
 *
 * White, not paper: the section labels are brand-700 now and at 13px that is
 * normal-sized text, so it needs 4.5:1 — it gets 4.54 on white and only 3.88
 * on paper-50. The grey rhythm of the page comes from the trust band instead.
 */
export function Process() {
  return (
    <Section id="proceso" size="lg" className="relative isolate">
      {/* The background art, plus the veil that makes it a background.
          Measured on the image: its darkest pixel is #BAA3A0 (0.392
          luminance), where ink-500 body copy would sit at 2.33:1. White at
          65% lifts the floor to #E7DFDE, and the secondary text moves to
          ink-900/80 — 7.42:1 — because ink-500 still only reaches 4.20 and
          needs 4.5. Both numbers are in scripts/contrast.mjs. */}
      <Image
        src="/brand/process-bg.png"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-white/65" />

      <SectionHeading intro={processIntro} leadClassName="text-ink-900/80" />

      {/* The rail lives outside the <ol>: a list may only contain <li>. */}
      <div className="relative mt-12">
        <span
          aria-hidden
          // left-7 / top-7, not 6: the rail has to cross the middle of the
          // number tile, and the tile went from 48px to 56px.
          className="bg-ink-900/15 absolute top-0 bottom-0 left-7 w-px md:top-7 md:right-7 md:bottom-auto md:left-7 md:h-px md:w-auto"
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
                className="rounded-card bg-brand-500 text-h2 text-ink-900 relative z-10 inline-flex size-14 shrink-0 items-center justify-center font-bold"
              >
                {step.step}
              </span>
              {/* One step up each, no more: tile 48->56px with the number at
                  `text-h2`, and the description from `text-body` to
                  `text-lead`. The step title stays at `h3` — at `h2` it wraps
                  to three lines in a four-column grid, which reads as bigger
                  and worse. */}
              <div className="md:mt-5">
                <Heading as="h3" size="h3">
                  {step.title}
                </Heading>
                <p className="text-lead text-ink-900/80 mt-2">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
      <SectionCta />
    </Section>
  );
}
