import { Section } from "@/components/layout/section";
import { SectionCta } from "@/components/sections/section-cta";
import { SectionHeading } from "@/components/sections/section-heading";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { useCasesEmpty, useCasesIntro } from "@/content/use-cases";

/**
 * Real implementations — **and there are none published yet.**
 *
 * The section changed subject at the user's request: it used to show six
 * business *types*, and now it promises real customers. That promise cannot be
 * half-kept, so instead of categories dressed up as clients it shows an empty
 * state that says why it is empty. CLAUDE.md §7: no invented customers.
 *
 * It keeps its heading and its id because the nav and the hero both link to
 * `#casos`, and an anchor pointing at a section that does not render is a link
 * that silently does nothing.
 *
 * The six old business types are still written in `content/use-cases.ts`, and
 * the markup that rendered them is in git.
 *
 * The top rule and the taller padding are the seam with "Cómo trabajamos":
 * both sections are white now, and without them the two ran together.
 *
 * TODO(guti): decide qué va aquí. Mientras tanto la sección solo presenta y
 * ofrece la cita.
 */
export function UseCases() {
  return (
    <Section id="casos" size="lg" className="border-ink-500/15 border-t">
      <SectionHeading intro={useCasesIntro} />

      {/* The empty state is a real block, not a gap: a section that announces
          real cases and then shows nothing reads as broken. It says why it is
          empty, which is also the honest thing — see content/use-cases.ts. */}
      <Card variant="plain" padding="lg" className="mt-10 max-w-3xl">
        <Heading as="h3" size="h3">
          {useCasesEmpty.title}
        </Heading>
        <p className="text-lead text-ink-900/80 mt-4">{useCasesEmpty.body}</p>
        <p className="text-body text-ink-500 mt-4">{useCasesEmpty.cta}</p>
      </Card>

      <SectionCta />
    </Section>
  );
}
