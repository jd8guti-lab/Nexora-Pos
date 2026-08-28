import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LogoLockup } from "@/components/brand/logo-lockup";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";
import { cta } from "@/content/home";

/**
 * The closing band — the page's one full-width orange surface, and the only
 * `bg="brand"` on the home (CLAUDE.md §3 caps it at two).
 *
 * It carries `id="contacto"`, because the nav's "Contacto" link scrolls here
 * rather than leaving for the form. Renaming the id means editing the nav.
 *
 * Everything on it is ink-900, not white. Measured: white on brand-500 is
 * 2.61:1 and drops to 1.78:1 at the light end of the gradient, while ink-900
 * holds 6.46:1 across the whole ramp. The lockup uses the `onBrand` variant
 * for the same reason — the isotype is orange and would disappear here, and
 * we may not recolour it.
 */
export function CtaBand() {
  return (
    <Section bg="brand" size="lg" id="contacto">
      <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="max-w-2xl">
          <LogoLockup variant="onBrand" height={30} withDescriptor />
          <Eyebrow tone="onBrand" className="mt-7">
            {cta.eyebrow}
          </Eyebrow>
          <Heading as="h2" className="mt-4">
            {cta.title}
          </Heading>
          <p className="text-lead text-ink-900/85 mt-5 max-w-xl">{cta.body}</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row lg:shrink-0 lg:flex-col">
          <Button asChild variant="onBrand" size="lg">
            {/* It opens WhatsApp now, so it leaves the site. */}
            <Link href={cta.primary.href} target="_blank" rel="noreferrer">
              {cta.primary.label}
              <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}
