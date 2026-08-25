import { Check, Minus } from "lucide-react";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { problem } from "@/content/home";
import type { ComparisonColumn } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * "Lo que pasa con un POS enlatado" versus "Lo que pasa con nexora-pos".
 *
 * The left column states what canned software does, not that the people who
 * make it are fools — CLAUDE.md §3 asks for honest and concrete, without
 * caricaturing the competition. Both columns are the same shape so the
 * comparison reads as a comparison and not as a sales pitch with a strawman.
 */
function Column({
  column,
  variant,
}: {
  column: ComparisonColumn;
  variant: "canned" | "tailored";
}) {
  const tailored = variant === "tailored";
  const Icon = tailored ? Check : Minus;

  return (
    <Card
      variant={tailored ? "default" : "plain"}
      padding="lg"
      className={cn("h-full", tailored && "border-brand-500/30")}
    >
      <Heading as="h3" size="h3" className={tailored ? "" : "text-ink-500"}>
        {column.title}
      </Heading>

      <ul className="mt-6 flex flex-col gap-4">
        {column.points.map((point) => (
          <li key={point} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full",
                tailored
                  ? "bg-brand-500/15 text-brand-700"
                  : "bg-ink-500/10 text-ink-500",
              )}
            >
              <Icon aria-hidden className="size-3.5" strokeWidth={2.5} />
            </span>
            <span className={cn("text-body", tailored ? "text-ink-900" : "text-ink-500")}>
              {point}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function Problem() {
  return (
    <Section id="problema">
      <div className="max-w-2xl">
        <Eyebrow>{problem.intro.eyebrow}</Eyebrow>
        <Heading as="h2" className="mt-4">
          {problem.intro.title}
        </Heading>
        {problem.intro.lead ? (
          <p className="text-lead text-ink-500 mt-5">{problem.intro.lead}</p>
        ) : null}
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 md:gap-6">
        {/* h-full on the wrapper too: the grid stretches this, not the Card. */}
        <Reveal className="h-full">
          <Column column={problem.canned} variant="canned" />
        </Reveal>
        <Reveal delay={0.08} className="h-full">
          <Column column={problem.tailored} variant="tailored" />
        </Reveal>
      </div>
    </Section>
  );
}
