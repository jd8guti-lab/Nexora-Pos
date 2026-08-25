import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { CtaBand } from "@/components/sections/cta";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { IconTile } from "@/components/ui/icon-tile";
import { modules } from "@/content/modules";
import { useCases } from "@/content/use-cases";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Casos de uso",
  description:
    "Cómo cambia un POS a medida según el negocio: tienda de barrio, distribuidora, restaurante, ferretería, comercializadora agrícola y papelería.",
  path: "/casos",
});

const moduleById = new Map(modules.map((mod) => [mod.id, mod]));

/**
 * Use cases, one block each.
 *
 * The header says plainly that these are business types and not customers.
 * CLAUDE.md §7 forbids implying clients we do not have, and a page of
 * business categories reads as a client list unless it says otherwise.
 */
export default function UseCasesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Casos de uso"
        title="Para negocios que no caben en una plantilla"
        lead="Estos son tipos de negocio, no clientes nuestros. Los ponemos para que veas cómo cambia el sistema según lo que vendes, a quién le vendes y cómo cobras."
      />

      <Section bg="paper">
        <ul className="flex flex-col gap-6">
          {useCases.map((useCase, i) => (
            <Reveal as="li" key={useCase.id} delay={(i % 3) * 0.05}>
              <Card padding="lg" id={useCase.id}>
                <div className="grid gap-6 lg:grid-cols-[auto_1fr_1fr] lg:items-start lg:gap-10">
                  <IconTile icon={useCase.icon} size="lg" />

                  <div>
                    <Heading as="h2" size="h3">
                      {useCase.business}
                    </Heading>
                    <p className="text-body text-ink-500 mt-3">{useCase.pain}</p>
                  </div>

                  <div>
                    <p className="text-body text-ink-900">{useCase.outcome}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <span className="sr-only">Módulos que usa:</span>
                      {useCase.modules.map((id) => {
                        const mod = moduleById.get(id);
                        if (!mod) return null;
                        return (
                          <Link
                            key={id}
                            href={`/modulos#${id}`}
                            className="rounded-full"
                            aria-label={`Ver el módulo ${mod.name}`}
                          >
                            <Badge tone="neutral">{mod.name}</Badge>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </ul>

        <p className="text-body text-ink-500 mt-10 max-w-2xl">
          ¿Tu negocio no se parece a ninguno de estos?{" "}
          <Link
            href="/contacto"
            className="text-ink-900 decoration-brand-500 hover:text-brand-700 hover:decoration-brand-700 font-semibold underline decoration-2 underline-offset-4"
          >
            Cuéntanos cómo trabajas
            <ArrowRight aria-hidden className="ml-1 inline size-4" />
          </Link>{" "}
          y te decimos con franqueza si te servimos.
        </p>
      </Section>

      <CtaBand />
    </>
  );
}
