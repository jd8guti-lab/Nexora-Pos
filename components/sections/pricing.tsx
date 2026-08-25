import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { Grid } from "@/components/layout/grid";
import { Section } from "@/components/layout/section";
import { Reveal } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Disclosure } from "@/components/ui/disclosure";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { pricingComparison, pricingIntro, pricingPlans } from "@/content/pricing";
import { cn } from "@/lib/utils";

/**
 * Prices and the comparison table.
 *
 * The two real prices are TODO(guti) placeholders and render as written — a
 * visible gap is the point. An invented price on a public page is a promise
 * somebody has to honour later (CLAUDE.md §7).
 *
 * The table uses <details>/<summary> rather than a scripted disclosure: it
 * opens with no JavaScript at all, it is keyboard operable for free, and
 * browser find-in-page can still reach the rows inside.
 */
function Cell({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <>
        <Check aria-hidden className="text-brand-700 mx-auto size-5" strokeWidth={2.5} />
        <span className="sr-only">Incluido</span>
      </>
    );
  }
  if (value === false) {
    return (
      <>
        <Minus aria-hidden className="text-ink-500/50 mx-auto size-5" />
        <span className="sr-only">No incluido</span>
      </>
    );
  }
  return <span className="text-small text-ink-900">{value}</span>;
}

export function Pricing() {
  return (
    <Section id="precios">
      <div className="max-w-2xl">
        <Eyebrow>{pricingIntro.eyebrow}</Eyebrow>
        <Heading as="h2" className="mt-4">
          {pricingIntro.title}
        </Heading>
        {pricingIntro.lead ? (
          <p className="text-lead text-ink-500 mt-5">{pricingIntro.lead}</p>
        ) : null}
      </div>

      <Grid cols={3} gap="lg" className="mt-12 items-stretch" asChild>
        <ul>
          {pricingPlans.map((plan, i) => (
            <Reveal as="li" key={plan.id} delay={i * 0.07} className="h-full">
              <Card
                padding="lg"
                className={cn(
                  "h-full",
                  plan.featured && "border-brand-500 shadow-card-hover",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <Heading as="h3" size="h3">
                    {plan.name}
                  </Heading>
                  {plan.featured ? <Badge>Más pedido</Badge> : null}
                </div>

                <p className="text-small text-ink-500 mt-2">{plan.tagline}</p>

                <p className="text-h2 text-ink-900 mt-6 leading-none font-bold">
                  {plan.price}
                </p>
                <p className="text-small text-ink-500 mt-1">{plan.priceNote}</p>

                <ul className="mt-6 flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <Check
                        aria-hidden
                        className="text-brand-700 mt-1 size-4 shrink-0"
                        strokeWidth={2.5}
                      />
                      <span className="text-body text-ink-500">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-8">
                  <Button
                    asChild
                    variant={plan.featured ? "primary" : "secondary"}
                    className="w-full"
                  >
                    <Link href={plan.cta.href}>{plan.cta.label}</Link>
                  </Button>
                </div>
              </Card>
            </Reveal>
          ))}
        </ul>
      </Grid>

      <Disclosure
        summary="Comparar los tres planes"
        className="rounded-card border-ink-500/15 mt-10 border bg-white"
        summaryClassName="px-5 text-body md:px-7"
        panelClassName="max-w-none pb-0"
      >
        {/* The table scrolls inside its own box; the page never does. */}
        <div className="border-ink-500/15 overflow-x-auto border-t">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <caption className="sr-only">
              Comparación de los planes Esencial, Negocio y A medida
            </caption>
            <thead>
              <tr className="border-ink-500/15 border-b">
                <th scope="col" className="text-small px-5 py-4 font-semibold md:px-7">
                  Función
                </th>
                {pricingPlans.map((plan) => (
                  <th
                    key={plan.id}
                    scope="col"
                    className="text-small px-4 py-4 text-center font-semibold"
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pricingComparison.map((row) => (
                <tr
                  key={row.feature}
                  className="border-ink-500/10 border-b last:border-0"
                >
                  <th
                    scope="row"
                    className="text-small text-ink-500 px-5 py-3.5 font-normal md:px-7"
                  >
                    {row.feature}
                  </th>
                  {pricingPlans.map((plan) => (
                    <td key={plan.id} className="px-4 py-3.5 text-center">
                      <Cell value={row.values[plan.id] ?? false} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Disclosure>
    </Section>
  );
}
