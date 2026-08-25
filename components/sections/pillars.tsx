import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { IconTile } from "@/components/ui/icon-tile";
import { pillarsIntro } from "@/content/home";
import { pillars } from "@/content/pillars";

/**
 * The five brand pillars, straight from the manual.
 *
 * A <ul>, because it is a list of five peers. Each Reveal is the <li> itself
 * rather than a wrapper inside it, so nothing foreign lands between the list
 * and its items.
 */
export function Pillars() {
  return (
    <Section bg="paper" id="pilares">
      <div className="max-w-2xl">
        <Eyebrow>{pillarsIntro.eyebrow}</Eyebrow>
        <Heading as="h2" className="mt-4">
          {pillarsIntro.title}
        </Heading>
      </div>

      <Grid cols={3} gap="lg" className="mt-12" asChild>
        <ul>
          {pillars.map((pillar, i) => (
            <Reveal as="li" key={pillar.id} delay={i * 0.06} className="h-full">
              <Card variant="plain" padding="lg" className="h-full">
                <IconTile icon={pillar.icon} size="lg" />
                <Heading as="h3" size="h3" className="mt-5">
                  {pillar.title}
                </Heading>
                <p className="text-body text-ink-500 mt-2">{pillar.description}</p>
              </Card>
            </Reveal>
          ))}
        </ul>
      </Grid>
    </Section>
  );
}
