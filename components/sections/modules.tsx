import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardLinkOverlay } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { IconTile } from "@/components/ui/icon-tile";
import { modulesIntro } from "@/content/home";
import { modules } from "@/content/modules";

/**
 * The seven modules.
 *
 * Each card links to its own anchor on /modulos. The link sits on the module
 * name and CardLinkOverlay stretches its hit area over the whole card, so
 * the entire surface is clickable while a screen reader still announces one
 * link with a meaningful name — rather than a bare "link" wrapping an icon,
 * a heading and a paragraph.
 *
 * Two columns on a phone, as the brief asks: these are short, scannable
 * cards, and a single column would make the section endless.
 */
export function Modules() {
  return (
    <Section id="modulos">
      <div className="max-w-2xl">
        <Eyebrow>{modulesIntro.eyebrow}</Eyebrow>
        <Heading as="h2" className="mt-4">
          {modulesIntro.title}
        </Heading>
        {modulesIntro.lead ? (
          <p className="text-lead text-ink-500 mt-5">{modulesIntro.lead}</p>
        ) : null}
      </div>

      <Grid cols="2-4" gap="md" className="mt-12" asChild>
        <ul>
          {modules.map((mod, i) => (
            <Reveal as="li" key={mod.id} delay={(i % 4) * 0.05} className="h-full">
              <Card interactive padding="md" className="h-full">
                <IconTile icon={mod.icon} />
                <Heading as="h3" size="h3" className="mt-4">
                  <Link
                    href={`/modulos#${mod.id}`}
                    className="rounded-sm outline-offset-4"
                  >
                    {mod.name}
                    <CardLinkOverlay />
                  </Link>
                </Heading>
                <p className="text-small text-ink-500 mt-2">{mod.summary}</p>
              </Card>
            </Reveal>
          ))}

          {/* Eighth cell: the section's own call to action, so the 2×4 grid
              closes cleanly instead of leaving a hole. It takes the whole row
              on a phone — squeezed into a half-width column its button does
              not fit, and a cramped CTA is a wasted one. */}
          <Reveal as="li" delay={0.15} className="col-span-2 h-full md:col-span-1">
            <Card variant="dark" padding="md" className="h-full justify-between">
              <Heading as="h3" size="h3" tone="inverse">
                ¿Te falta uno?
              </Heading>
              <p className="text-small text-paper-50/75 mt-2">
                Si tu negocio necesita algo que no está en la lista, lo construimos.
              </p>
              <div className="mt-5">
                <Button asChild variant="inverse" size="sm">
                  <Link href="/contacto">
                    Cuéntanos
                    <ArrowRight aria-hidden />
                  </Link>
                </Button>
              </div>
            </Card>
          </Reveal>
        </ul>
      </Grid>
    </Section>
  );
}
