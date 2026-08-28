import { Check, Puzzle, X } from "lucide-react";
import { Section } from "@/components/layout/section";
import { SectionCta } from "@/components/sections/section-cta";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { problem } from "@/content/home";
import type { ComparisonColumn } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * "Plantilla única" versus "Con nexora-pos", with the VS badge from the art.
 *
 * The left column states what template software does, not that the people who
 * make it are fools — CLAUDE.md §3 asks for honest and concrete, without
 * caricaturing the competition. Both columns are the same shape so the
 * comparison reads as a comparison and not as a sales pitch with a strawman.
 *
 * Two things the art asks for that the palette does not allow:
 *
 * 1. **The VS badge is `ink-900` on orange, not white** — white on brand-500
 *    is 2.61:1 and fails AA at every size (CLAUDE.md §3).
 * 2. **The tailored subtitle is `brand-700`, not the brighter orange**: it is
 *    body-sized, so it needs 4.5:1 and only brand-700 clears it on white.
 *
 * The badge is decoration and `aria-hidden`: "versus" is already what two
 * columns titled this way mean, and a screen reader announcing "VS" between
 * them adds nothing. Each column is a list, and the lists are what carry it.
 */
function Column({
  column,
  variant,
}: {
  column: ComparisonColumn;
  variant: "canned" | "tailored";
}) {
  const tailored = variant === "tailored";
  const Mark = tailored ? Check : X;

  return (
    <Card
      variant={tailored ? "default" : "plain"}
      padding="lg"
      className={cn(
        "relative h-full",
        tailored
          ? // The winning column is raised, ringed in brand and sat on white:
            // the comparison should be readable at a glance, before a word of
            // it is read. The ring is /40 rather than a solid brand border —
            // a full-strength orange outline reads as an error state.
            "ring-brand-500/40 shadow-card-hover bg-white ring-2 lg:-mt-3 lg:mb-3"
          : // Opaque, not /60: the constellation mesh runs behind this section
            // and a translucent card let it show through the copy.
            "border-ink-500/15 shadow-card bg-paper-50 border",
      )}
    >
      {tailored ? (
        // The one flag on the page that says which side we are on, in words.
        <span className="bg-brand-500 text-ink-900 text-eyebrow tracking-eyebrow absolute -top-3 left-6 inline-flex items-center rounded-full px-3 py-1 font-semibold uppercase">
          {"La diferencia"}
        </span>
      ) : null}

      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className={cn(
            "inline-flex size-12 shrink-0 items-center justify-center rounded-full",
            tailored ? "bg-brand-gradient text-ink-900" : "bg-ink-500/10 text-ink-500",
          )}
        >
          <Puzzle className="size-6" strokeWidth={1.75} />
        </span>

        <div className="min-w-0 flex-1">
          <Heading as="h3" size="h2" className={tailored ? "" : "text-ink-500"}>
            {column.title}
          </Heading>
          <p
            className={cn("text-lead mt-1", tailored ? "text-brand-700" : "text-ink-500")}
          >
            {column.subtitle}
          </p>
        </div>

        {/* The verdict stamp of the art: a square, not a circle, so it reads
            as the column's own mark rather than as another bullet. */}
        <span
          aria-hidden
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
            tailored ? "bg-brand-500 text-ink-900" : "bg-ink-500/10 text-ink-500",
          )}
        >
          <Mark className="size-5" strokeWidth={3} />
        </span>
      </div>

      {/* Divider under the header, then one between rows: the art rules the
          list, which is what keeps five lines from reading as a block. */}
      <ul className="divide-ink-900/8 border-ink-900/8 mt-6 divide-y border-t">
        {column.points.map((point) => (
          <li key={point.emphasis} className="flex gap-3 py-4">
            <span
              className={cn(
                "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full",
                tailored ? "bg-brand-500 text-ink-900" : "bg-ink-500/10 text-ink-500",
              )}
            >
              <Mark aria-hidden className="size-3.5" strokeWidth={2.5} />
            </span>
            <span className={cn("text-lead", tailored ? "text-ink-900" : "text-ink-500")}>
              <strong className={cn("font-semibold", tailored ? "" : "text-ink-900")}>
                {point.emphasis}
              </strong>{" "}
              {point.rest}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function Problem() {
  return (
    <Section id="problema" mesh>
      {/* No image any more, so the header runs the full width of the
          container and the title gets to be as wide as it wants. `max-w-4xl`
          on the title only: the lead stays narrower because a 1200px line of
          body copy is unreadable however wide the section is. */}
      <SectionHeading intro={problem.intro} />

      {/* `relative` so the badge can sit on the seam between the columns. */}
      <div className="relative mt-12 grid gap-5 md:grid-cols-2 md:gap-6">
        {/* h-full on the wrapper too: the grid stretches this, not the Card. */}
        <Reveal className="h-full">
          <Column column={problem.canned} variant="canned" />
        </Reveal>
        <Reveal delay={0.08} className="h-full">
          <Column column={problem.tailored} variant="tailored" />
        </Reveal>

        <span
          aria-hidden
          // Hidden below md, where the columns stack: centred on a stack the
          // badge lands in the middle of a card, marking nothing.
          className="bg-brand-500 text-ink-900 shadow-card text-small absolute top-1/2 left-1/2 z-10 hidden size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-bold ring-4 ring-white md:inline-flex"
        >
          VS
        </span>
      </div>
      <SectionCta />
    </Section>
  );
}
