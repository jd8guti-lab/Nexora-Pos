import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { CtaBand } from "@/components/sections/cta";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { IconTile } from "@/components/ui/icon-tile";
import { modules } from "@/content/modules";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Módulos",
  description:
    "Los siete módulos de nexora-pos: punto de venta, inventario, contabilidad, reportes, clientes, proveedores y usuarios. Activas los que necesitas.",
  path: "/modulos",
});

/**
 * One block per module, each with the anchor the home grid links to.
 *
 * Blocks alternate white and paper-50 so the page has rhythm across seven
 * sections without reaching for the accent colour.
 */
export default function ModulesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Módulos"
        title="Siete módulos. Activas los que necesitas."
        lead="Cada uno resuelve una parte del día. Empiezas por donde te aprieta y sumas el resto cuando el negocio lo pida — sin cambiar de sistema y sin volver a migrar."
      >
        <ul className="flex flex-wrap gap-2">
          {modules.map((mod) => (
            <li key={mod.id}>
              <Link
                href={`#${mod.id}`}
                className="ease-brand border-ink-500/25 text-small text-ink-900 hover:border-brand-500 hover:bg-brand-500/10 inline-flex min-h-11 items-center rounded-full border px-4 font-medium transition-colors duration-200"
              >
                {mod.name}
              </Link>
            </li>
          ))}
        </ul>
      </PageHeader>

      {modules.map((mod, i) => (
        <Section key={mod.id} id={mod.id} bg={i % 2 === 0 ? "white" : "paper"}>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <IconTile icon={mod.icon} size="lg" />
              <Heading as="h2" className="mt-6">
                {mod.name}
              </Heading>
              <p className="text-lead text-ink-500 mt-5 max-w-xl">{mod.summary}</p>
            </div>

            <div>
              <p className="text-body text-ink-900 max-w-xl">{mod.description}</p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {mod.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <Check
                      aria-hidden
                      className="text-brand-700 mt-1 size-4 shrink-0"
                      strokeWidth={2.5}
                    />
                    <span className="text-body text-ink-500">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      ))}

      <Section bg="white" size="sm">
        <div className="rounded-card border-ink-500/15 bg-paper-50 flex flex-col items-start gap-6 border p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-xl">
            <Heading as="h2" size="h3">
              ¿Necesitas algo que no está en esta lista?
            </Heading>
            <p className="text-body text-ink-500 mt-2">
              Esa es justamente la parte que hacemos a medida. Cuéntanos qué le falta a tu
              operación y te decimos qué implica.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link href="/contacto">
              Cuéntanos
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </Section>

      <CtaBand />
    </>
  );
}
