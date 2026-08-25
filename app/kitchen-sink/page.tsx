import type { Metadata } from "next";
import {
  BarChart3,
  Boxes,
  Headphones,
  Lock,
  ShoppingCart,
  SlidersHorizontal,
} from "lucide-react";
import { Isotype } from "@/components/brand/isotype";
import { LogoLockup } from "@/components/brand/logo-lockup";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Disclosure } from "@/components/ui/disclosure";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { IconTile } from "@/components/ui/icon-tile";

export const metadata: Metadata = {
  title: "Kitchen sink",
  robots: { index: false, follow: false },
};

/**
 * Every primitive, in every variant, on every surface.
 *
 * Not linked from anywhere and excluded from the sitemap — it exists so a
 * change to the design system can be eyeballed in one screen instead of being
 * discovered halfway down a marketing page.
 */

const SURFACES = [
  { bg: "white", label: "white" },
  { bg: "paper", label: "paper-50" },
  { bg: "ink", label: "ink-900" },
  { bg: "brand", label: "brand gradient" },
] as const;

const PALETTE = [
  { token: "brand-500", cls: "bg-brand-500", note: "fondos, degradados" },
  { token: "brand-300", cls: "bg-brand-300", note: "hovers, degradados" },
  { token: "brand-700", cls: "bg-brand-700", note: "solo texto" },
  { token: "ink-900", cls: "bg-ink-900", note: "texto, fondos oscuros" },
  { token: "ink-500", cls: "bg-ink-500", note: "texto secundario" },
  { token: "paper-50", cls: "bg-paper-50", note: "fondos de sección" },
] as const;

const TYPE_SCALE = [
  { token: "text-display", cls: "text-display", sample: "Tu negocio" },
  { token: "text-h1", cls: "text-h1", sample: "Tu forma" },
  { token: "text-h2", cls: "text-h2", sample: "Nuestro software" },
  { token: "text-h3", cls: "text-h3", sample: "Punto de venta" },
  { token: "text-lead", cls: "text-lead", sample: "Un POS que se adapta a ti." },
  { token: "text-body", cls: "text-body", sample: "Inventario, caja y facturas." },
  { token: "text-small", cls: "text-small", sample: "Cuadre del día" },
] as const;

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <Eyebrow>{title}</Eyebrow>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function KitchenSinkPage() {
  return (
    <>
      <Section size="sm">
        <Eyebrow tone="accent">Sistema de diseño</Eyebrow>
        <Heading as="h1" size="h1" className="mt-4">
          Kitchen sink
        </Heading>
        <p className="text-lead text-ink-500 mt-4 max-w-2xl">
          Todos los primitivos, en todas sus variantes, sobre los cuatro fondos que
          existen. Esta página no está enlazada ni indexada.
        </p>
      </Section>

      {/* ---------------------------------------------------------- palette */}
      <Section bg="paper" size="sm">
        <Heading as="h2">Paleta</Heading>
        <Grid cols={3} className="mt-8">
          {PALETTE.map((c) => (
            <Card key={c.token} padding="sm" variant="plain">
              <div className={`${c.cls} h-16 w-full rounded-lg`} />
              <p className="text-body mt-4 font-semibold">{c.token}</p>
              <p className="text-small text-ink-500">{c.note}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* ------------------------------------------------------ typography */}
      <Section size="sm">
        <Heading as="h2">Escala tipográfica</Heading>
        <div className="mt-8 flex flex-col gap-6">
          {TYPE_SCALE.map((t) => (
            <div
              key={t.token}
              className="border-ink-500/15 flex flex-col gap-1 border-b pb-5"
            >
              <code className="text-small text-ink-500">{t.token}</code>
              <span className={t.cls}>{t.sample}</span>
            </div>
          ))}
          <div className="flex flex-col gap-1">
            <code className="text-small text-ink-500">Eyebrow</code>
            <Eyebrow>Software a medida · Personalizable</Eyebrow>
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------- buttons */}
      {SURFACES.map((surface) => (
        <Section key={surface.bg} bg={surface.bg} size="sm">
          <Heading as="h2" tone={surface.bg === "ink" ? "inverse" : "default"}>
            Botones sobre {surface.label}
          </Heading>

          <div className="mt-8 flex flex-col gap-8">
            {surface.bg === "ink" ? (
              <Row title="Variantes">
                <Button variant="inverse">Agendar demo</Button>
                <Button variant="inverseOutline">Ingresar al portal</Button>
              </Row>
            ) : surface.bg === "brand" ? (
              <Row title="Variantes">
                <Button variant="onBrand">Agendar demo</Button>
                <Button variant="secondary">Ver módulos</Button>
              </Row>
            ) : (
              <>
                <Row title="Variantes">
                  <Button>Agendar demo</Button>
                  <Button variant="secondary">Ver módulos</Button>
                  <Button variant="ghost">Ingresar al portal</Button>
                  <Button variant="link">Cómo trabajamos</Button>
                </Row>
                <Row title="Tamaños — todos ≥44px">
                  <Button size="sm">Pequeño</Button>
                  <Button size="md">Mediano</Button>
                  <Button size="lg">Grande</Button>
                </Row>
                <Row title="Con ícono y deshabilitado">
                  <Button>
                    <ShoppingCart aria-hidden />
                    Con ícono
                  </Button>
                  <Button disabled>Deshabilitado</Button>
                </Row>
              </>
            )}

            <Row title="Badges">
              {surface.bg === "ink" ? (
                <>
                  <Badge tone="inverse">Modular</Badge>
                  <Badge tone="solid">Nuevo</Badge>
                </>
              ) : (
                <>
                  <Badge>A medida</Badge>
                  <Badge tone="neutral">Modular</Badge>
                  <Badge tone="outline">Opcional</Badge>
                  <Badge tone="solid">Nuevo</Badge>
                </>
              )}
            </Row>

            <Row title="Marca">
              {surface.bg === "ink" ? (
                <LogoLockup variant="dark" height={34} withDescriptor />
              ) : surface.bg === "brand" ? (
                <LogoLockup variant="onBrand" height={34} withDescriptor />
              ) : (
                <LogoLockup height={34} withDescriptor />
              )}
              <Isotype size={40} />
            </Row>
          </div>
        </Section>
      ))}

      {/* ------------------------------------------------------------ cards */}
      <Section bg="paper" size="sm">
        <Heading as="h2">Tarjetas</Heading>
        <Grid cols={3} className="mt-8">
          <Card>
            <CardHeader>
              <IconTile icon={SlidersHorizontal} />
              <Heading as="h3" size="h3">
                A medida
              </Heading>
            </CardHeader>
            <CardBody>
              <p className="text-body text-ink-500">
                Se adapta a los procesos únicos de tu negocio.
              </p>
            </CardBody>
          </Card>

          <Card interactive>
            <CardHeader>
              <IconTile icon={Boxes} tone="solid" />
              <Heading as="h3" size="h3">
                Interactiva
              </Heading>
            </CardHeader>
            <CardBody>
              <p className="text-body text-ink-500">
                Pasa el cursor por encima. En táctil no se eleva.
              </p>
            </CardBody>
          </Card>

          <Card variant="dark">
            <CardHeader>
              <IconTile icon={Lock} tone="inverse" />
              <Heading as="h3" size="h3" tone="inverse">
                Oscura
              </Heading>
            </CardHeader>
            <CardBody>
              <p className="text-body text-paper-50/75">
                Tu información siempre protegida.
              </p>
            </CardBody>
          </Card>
        </Grid>

        <div className="mt-10">
          <Row title="Plates de ícono">
            <IconTile icon={ShoppingCart} size="sm" />
            <IconTile icon={BarChart3} size="md" />
            <IconTile icon={Headphones} size="lg" />
            <IconTile icon={Boxes} tone="solid" />
            <IconTile icon={Boxes} tone="neutral" />
          </Row>
        </div>
      </Section>

      {/* ------------------------------------------------------- disclosure */}
      <Section size="sm">
        <Heading as="h2">Acordeón</Heading>
        <p className="text-body text-ink-500 mt-3 max-w-2xl">
          <code>&lt;details&gt;</code> nativo: <kbd>Tab</kbd> para llegar,{" "}
          <kbd>Enter</kbd> o <kbd>Espacio</kbd> para abrir. Comparten el mismo{" "}
          <code>name</code>, así que abrir uno cierra los otros — sin una línea de
          JavaScript. Funciona igual con el JS desactivado.
        </p>
        <div className="border-ink-500/20 mt-8 max-w-3xl border-t">
          {[
            {
              q: "¿Mis datos son míos?",
              a: "Sí. Tu información es tuya y te la puedes llevar cuando quieras.",
            },
            {
              q: "¿Funciona sin internet?",
              a: "Ejemplo de respuesta para ver cómo se comporta el panel al abrirse.",
            },
            {
              q: "¿Cuánto tarda la implementación?",
              a: "Ejemplo de respuesta con dos líneas de texto para comprobar cómo se ve el panel cuando el contenido es más largo de lo habitual.",
            },
          ].map((item) => (
            <Disclosure key={item.q} name="ks" summary={item.q}>
              {item.a}
            </Disclosure>
          ))}
        </div>
      </Section>

      {/* ----------------------------------------------------------- motion */}
      <Section bg="paper" size="sm">
        <Heading as="h2">Animación de entrada</Heading>
        <p className="text-body text-ink-500 mt-3 max-w-2xl">
          Estas tarjetas entran escalonadas al aparecer en pantalla, una sola vez. Con{" "}
          <code>prefers-reduced-motion</code> activo no se mueven en absoluto.
        </p>
        <Grid cols={3} className="mt-8">
          {["Conexión", "Personalización", "Crecimiento"].map((label, i) => (
            <Reveal key={label} delay={i * 0.08}>
              <Card variant="plain" className="h-full">
                <Heading as="h3" size="h3">
                  {label}
                </Heading>
              </Card>
            </Reveal>
          ))}
        </Grid>
      </Section>

      {/* ------------------------------------------------------------ focus */}
      <Section size="sm">
        <Heading as="h2">Foco</Heading>
        <p className="text-body text-ink-500 mt-3 max-w-2xl">
          Recorre la página con <kbd>Tab</kbd>: el anillo es <code>ink-900</code> y solo
          se vuelve blanco sobre <code>ink-900</code>. Sobre el naranja se queda oscuro,
          porque el blanco solo alcanza 2.61:1 y WCAG pide 3:1.
        </p>
      </Section>
    </>
  );
}
