import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import type { SectionIntro } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * The standing head of a home section: label, oversized title, standfirst.
 *
 * It exists because the same three lines of markup were about to be copied
 * into a third section, and the interesting parts are exactly the parts that
 * must not drift:
 *
 * - **`as="h2"` with `size="h1"`.** These titles are the loudest thing on the
 *   page after the hero. `Heading` keeps the semantic level and the visual
 *   size apart so that being big does not mean being an `h1`.
 * - **The tail of the title is underlined in `brand-500`.** That orange fails
 *   AA — 2.61:1 on white where large text asks 3:1 — and is one of the three
 *   authorised exceptions listed in scripts/contrast.mjs. It is here, in one
 *   place, so that the exception cannot spread by copy-paste.
 * - **The split lives in `content/`.** Which half of the sentence carries the
 *   emphasis is a decision about the copy, not about the component.
 */
export function SectionHeading({
  intro,
  className,
  titleClassName,
  leadClassName,
}: {
  intro: SectionIntro;
  className?: string;
  titleClassName?: string;
  leadClassName?: string;
}) {
  return (
    <div className={className}>
      <Eyebrow>{intro.eyebrow}</Eyebrow>
      <Heading as="h2" size="h1" className={cn("mt-4 max-w-4xl", titleClassName)}>
        {intro.title}{" "}
        {intro.titleAccent ? (
          <span className="decoration-brand-500 text-brand-500 underline decoration-[0.08em] underline-offset-[0.16em]">
            {intro.titleAccent}
          </span>
        ) : null}
      </Heading>
      {intro.lead ? (
        <p className={cn("text-lead text-ink-500 mt-5 max-w-3xl", leadClassName)}>
          {intro.lead}
        </p>
      ) : null}
    </div>
  );
}
