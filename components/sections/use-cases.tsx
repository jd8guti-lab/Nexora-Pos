import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { IconTile } from "@/components/ui/icon-tile";
import { modules } from "@/content/modules";
import { useCases, useCasesIntro } from "@/content/use-cases";

/** Module id to display name, so a case only has to store ids. */
const moduleName = new Map(modules.map((m) => [m.id, m.name]));

/**
 * Use cases by business type.
 *
 * The intro says out loud that these are business types and not clients — a
 * grid of categories on a marketing page reads as a customer list otherwise,
 * and CLAUDE.md §7 forbids implying customers we do not have.
 */
export function UseCases() {
  return (
    <Section bg="paper" id="casos">
      <div className="max-w-2xl">
        <Eyebrow>{useCasesIntro.eyebrow}</Eyebrow>
        <Heading as="h2" className="mt-4">
          {useCasesIntro.title}
        </Heading>
        {useCasesIntro.lead ? (
          <p className="text-lead text-ink-500 mt-5">{useCasesIntro.lead}</p>
        ) : null}
      </div>

      <Grid cols={3} gap="lg" className="mt-12" asChild>
        <ul>
          {useCases.map((useCase, i) => (
            <Reveal as="li" key={useCase.id} delay={(i % 3) * 0.07} className="h-full">
              <Card variant="plain" padding="lg" className="h-full">
                <IconTile icon={useCase.icon} />
                <Heading as="h3" size="h3" className="mt-5">
                  {useCase.business}
                </Heading>

                <p className="text-body text-ink-500 mt-3">{useCase.pain}</p>
                <p className="text-body text-ink-900 mt-3">{useCase.outcome}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="sr-only">Módulos que usa:</span>
                  {useCase.modules.map((id) => (
                    <Badge key={id} tone="neutral">
                      {moduleName.get(id) ?? id}
                    </Badge>
                  ))}
                </div>
              </Card>
            </Reveal>
          ))}
        </ul>
      </Grid>
    </Section>
  );
}
