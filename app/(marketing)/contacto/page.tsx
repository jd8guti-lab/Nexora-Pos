import { Mail, MessageCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { ContactForm } from "@/components/sections/contact-form";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { IconTile } from "@/components/ui/icon-tile";
import { processSteps } from "@/content/process";
import { contact } from "@/content/site";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contacto",
  description:
    "Cuéntanos cómo trabajas y te mostramos cómo quedaría tu sistema. Sin compromiso y sin presentación de ventas.",
  path: "/contacto",
});

/**
 * El mapa cubre TODOS los tipos de canal, no solo los que esta página muestra
 * hoy: `contact` trae únicamente WhatsApp porque el correo va solo en el pie
 * (decisión del dueño, 31 de agosto de 2026). Si mañana el correo entra aquí,
 * su icono ya está y no hay un `undefined` esperando.
 */
const channelIcon = {
  whatsapp: MessageCircle,
  email: Mail,
} as const;

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contacto"
        title="Hablemos de cómo trabajas"
        lead="Escríbenos y te respondemos nosotros mismos. No hay call center, no hay cadena de correos automáticos y no te vamos a perseguir si decides que no."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <Heading as="h2" size="h3">
              Cuéntanos de tu negocio
            </Heading>
            <p className="text-body text-ink-500 mt-3 mb-8 max-w-xl">
              Entre más concreto seas, mejor te podemos responder. Si prefieres WhatsApp,
              ahí también estamos.
            </p>
            <ContactForm />
          </div>

          <div className="flex flex-col gap-6">
            <Card variant="plain" padding="lg">
              <Heading as="h2" size="h3">
                Por dónde nos ubicas
              </Heading>
              <ul className="mt-6 flex flex-col gap-5">
                {contact.map((channel) => {
                  const Icon = channelIcon[channel.kind];
                  return (
                    <li key={channel.kind} className="flex items-start gap-4">
                      <IconTile icon={Icon} size="sm" />
                      <div className="min-w-0">
                        <p className="text-small text-ink-900 font-semibold">
                          {channel.label}
                        </p>
                        {channel.href ? (
                          <a
                            href={channel.href}
                            className="text-body text-ink-500 decoration-brand-500 hover:text-brand-700 break-words underline decoration-2 underline-offset-4"
                          >
                            {channel.value}
                          </a>
                        ) : (
                          <p className="text-body text-ink-500 break-words">
                            {channel.value}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card variant="dark" padding="lg">
              <Heading as="h2" size="h3" tone="inverse">
                Qué pasa después
              </Heading>
              <ol className="mt-6 flex flex-col gap-4">
                {processSteps.map((step) => (
                  <li key={step.step} className="flex gap-4">
                    <span
                      aria-hidden
                      className="bg-brand-500 text-small text-ink-900 inline-flex size-7 shrink-0 items-center justify-center rounded-full font-bold"
                    >
                      {step.step}
                    </span>
                    <span className="text-body text-paper-50/80">{step.title}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
