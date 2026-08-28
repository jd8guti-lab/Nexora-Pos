import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { hero } from "@/content/home";
import { site } from "@/content/site";

/**
 * The hero.
 *
 * Deliberately not wrapped in Reveal: this is the first thing on the page and
 * the one block that must never wait on JavaScript, an observer or a scroll.
 *
 * **It is exactly one screen tall.** `100svh` minus the nav, read from the `--spacing-nav` token, at every
 * breakpoint — `svh` rather than `vh` so a phone's collapsing address bar does
 * not make it overflow. There is no vertical padding doing the spacing on
 * desktop; the copy is centred in the space instead, which is what keeps the
 * gap under the nav from opening up.
 *
 * Below xl the image stacks under the copy and takes whatever height is left
 * (`flex-1` + `object-cover`), so the section still ends at the fold. Above
 * xl it is the full-bleed background and the copy sits on it.
 *
 * **Above xl the copy leaves the container and hugs the left edge** (5vw of
 * padding instead of the container's centred gutter), which is where the
 * reference art puts it and what leaves the monitor, the tablet and the
 * printer in full view. It is the layout that reveals more of the image; the
 * type did not have to shrink for it.
 *
 * **There is no scrim any more.** The art now ships a plate whose left third
 * is already a light field, so a veil would only grey out the orange the image
 * is made of. What pays for the contrast instead is the palette: measured over
 * the plate's copy column (5%–33% wide), the worst backdrop is `#F1C198` and
 * the worst under the claim is `#FDE9D5`, both audited in scripts/contrast.mjs.
 *
 * Two consequences of dropping the veil, and they are not negotiable:
 *
 * 1. **The claim's accent is `brand-500`, and it does NOT pass AA.** It is
 *    2.44:1 against the plate where AA asks 3:1 for text this size. The user
 *    was shown the measurement and chose it anyway, to match the orange of the
 *    button below it; it is listed in `scripts/contrast.mjs` under authorised
 *    exceptions so that every run reprints the number instead of hiding it.
 *    **This is the one place brand-500 is allowed as a text colour.**
 * 2. **The eyebrow is `ink-900`, not `ink-500`.** It sits high in the column,
 *    where the plate's orange band crosses (0.563 luminance at worst), and
 *    every lighter ink misses 4.5:1 there. ink-900 gets 9.66:1.
 *
 * Widening the column past 33% puts text on the printer, which is pure black.
 */
export function Hero() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-var(--spacing-nav))] flex-col overflow-hidden bg-white xl:justify-center">
      {/* Not `Container` above xl: its centred max-width would hold the copy
          320px in from the left on a 1920 screen, hiding the part of the image
          the art wants seen. Below xl it behaves exactly like a Container. */}
      <div className="mx-auto w-full max-w-[80rem] px-5 pt-6 pb-5 sm:px-6 md:pt-8 md:pb-6 lg:px-8 xl:max-w-none xl:py-0 xl:pr-0 xl:pl-[3vw]">
        {/* The printer — the leftmost dark thing in the plate — starts at a
            fixed 34.4% of the width (see the image note below). Starting at
            5vw, 32% puts the copy's right edge at 37% — the printer, the
            leftmost dark thing in the plate, starts at 34.2% but only in its
            lower half, so the measurement below is what decides this. That is the whole budget: widening this
            puts text on the printer, and it is measurable, not a matter of
            taste. */}
        {/* No cap here: a percentage would resolve against this wrapper, not
            the screen. The caps live on the children, in `vw`. */}
        <div>
          <Eyebrow className="text-ink-900">{site.descriptor}</Eyebrow>

          {/* One sentence per line, as in the reference art. They are blocks
              rather than a flowing paragraph with breaks: the claim is three
              statements and the rhythm is the point. `w-fit` on all three:
              it keeps the underline the width of its own sentence, and it
              keeps each line's box equal to its glyphs — a full-width box
              would drag the orange line over warm pixels it never touches,
              and that is what a contrast measurement reads. */}
          <h1 className="text-display mt-3 max-w-2xl md:mt-4 xl:max-w-[36vw]">
            {/* Thickness and offset in em so the rule scales with the fluid
                display size instead of going hairline at the top end. */}
            <span className="decoration-brand-500 block w-fit underline decoration-[0.07em] underline-offset-[0.14em]">
              {site.claim.underlined}
            </span>
            <span className="block w-fit">{site.claim.middle}</span>
            <span className="text-brand-500 block w-fit">{site.claim.accent}</span>
          </h1>

          <p className="text-lead text-ink-900 md:text-h3 mt-5 max-w-xl font-medium md:mt-6 xl:max-w-[27vw]">
            {hero.lead}
          </p>
          {/* Justified, with hyphenation on: the column is narrow and Spanish
              has long words, so without hyphens justification opens rivers. */}
          <p className="text-body text-ink-900/80 mt-3 max-w-xl text-justify hyphens-auto xl:max-w-[27vw]">
            {hero.body}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-8 xl:max-w-[27vw]">
            <Button asChild size="lg">
              {/* Opens WhatsApp — it leaves the site, so it says so to the
                  browser as well as to the reader. */}
              <Link href={hero.primaryCta.href} target="_blank" rel="noreferrer">
                {hero.primaryCta.label}
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            {/* White plate with a hairline rule, as in the art — not the
                outlined `secondary`. The button sits on the image, where a
                transparent fill would put its label on desk pixels; and below
                xl, where the ground is plain white, the rule is what keeps it
                from vanishing. Its label is ink-900 either way: 16.9:1. */}
            <Button
              asChild
              variant="inverse"
              size="lg"
              className="border-ink-900/25 hover:border-ink-900/40 border"
            >
              <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Below xl the image is a band under the copy, so `fill` + cover is
          right there. **Above xl it is not `cover`.** The plate is scaled to
          the full width and pinned to the top, so:

          - its width always maps 1:1 to the viewport, which means the devices
            sit at a **fixed** fraction of the screen — the printer at 34.4%,
            whatever the window's shape. With `cover` that fraction moved with
            the window's aspect ratio, from 54% down to 15%, and the copy ended
            up printed on top of the monitor. Measured, not guessed.
          - pinned to the top, the crop is only ever at the bottom, where the
            desk bleeds off. `cover` centred it and sliced the monitor's top.

          On a window taller than the art, the image simply ends and the
          section's own white shows below — which is why the bottom fades. */}
      {/* The fade lives on this box, not on the image. The image bleeds past
          the section's bottom edge, so a mask on the image put its fade
          off-screen: the effect existed and was never visible. On the box the
          fade is always the section's own last 20%. */}
      <div className="relative min-h-[20svh] flex-1 mask-b-from-80% mask-b-to-100% xl:absolute xl:inset-0 xl:-z-10 xl:min-h-0 xl:flex-none">
        <Image
          src="/brand/hero-mockup.png"
          alt="Panel de nexora-pos con el resumen de ventas del día, el gráfico de ventas del mes y el listado de pedidos, junto a la impresora de recibos, el lector de códigos y una tableta con el catálogo de productos"
          width={1672}
          height={941}
          priority
          sizes="100vw"
          // The bottom 12% fades out, so the plate dissolves into the section
          // below instead of ending on a hard horizontal edge. Pure CSS mask,
          // no JavaScript — and it fades to transparent, not to white, so it
          // keeps working whatever section follows.
          className="absolute inset-0 size-full mask-b-from-88% mask-b-to-100% object-cover object-center xl:relative xl:inset-auto xl:h-auto xl:w-full"
        />
      </div>
    </section>
  );
}
