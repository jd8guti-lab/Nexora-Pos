import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { CtaBand } from "@/components/sections/cta";
import { Faq } from "@/components/sections/faq";
import { Pricing } from "@/components/sections/pricing";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Precios",
  description:
    "Tres formas de empezar con nexora-pos: Esencial, Negocio y A medida. Pagas por los módulos que usas y la personalización se cotiza aparte.",
  path: "/precios",
});

/**
 * What "a medida" actually costs you in time and money, stated before the
 * plans rather than after — it is the question the plans do not answer.
 */
const customisation = [
  {
    title: "Lo que ya está incluido",
    body: "Configurar módulos, campos, impuestos, formatos de factura y reportes con lo que el sistema ya sabe hacer. Eso no se cobra aparte: es la instalación.",
  },
  {
    title: "Lo que se cotiza",
    body: "Construir algo que no existe todavía: un módulo nuevo, una integración con un sistema que ya usas, o un cálculo propio de tu operación. Te damos alcance y precio antes de empezar.",
  },
  {
    title: "Lo que no cobramos",
    body: "Migrar tus datos al arrancar, capacitar a tu equipo y acompañarte los primeros días. Va con la implementación.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Precios"
        title="Pagas por lo que usas"
        lead="Dos planes con un punto de partida claro y uno que se arma contigo. Si tu operación necesita algo distinto, se ajusta — y te decimos qué cuesta antes de construirlo."
      />

      <Pricing />

      <Section bg="paper">
        <div className="max-w-2xl">
          <Heading as="h2">Qué significa “a medida” en la factura</Heading>
          <p className="text-lead text-ink-500 mt-5">
            Es la pregunta que ningún plan responde, así que la respondemos aquí.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {customisation.map((item) => (
            <li key={item.title}>
              <Card variant="plain" padding="lg" className="h-full">
                <Heading as="h3" size="h3">
                  {item.title}
                </Heading>
                <p className="text-body text-ink-500 mt-3">{item.body}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      <Faq />
      <CtaBand />
    </>
  );
}
