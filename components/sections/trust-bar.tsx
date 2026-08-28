import { Container } from "@/components/layout/container";
import { trustMetrics } from "@/content/site";

/**
 * The trust bar: a full-width grey band under the hero.
 *
 * These are statements about how the product works, never claims about the
 * company. CLAUDE.md §7 rules out invented client counts, years in business
 * or installation numbers, so none appear here — and none should be added
 * later without a real source. The five restate the pillars, which is what
 * keeps them honest.
 *
 * Three things it has to keep getting right:
 *
 * 1. **The band is a layer, not the section's background.** It carries the
 *    fade from the reference component (`mask-b-*` / `mask-t-*`), and a mask
 *    on the section itself would fade the copy along with the grey. So the
 *    grey sits in its own `absolute` layer and the list rides above it.
 * 2. **The values are `brand-700`.** On paper-50 that is 3.88:1, which clears
 *    the 3:1 of large text. `brand-500` was tried here at the user's request
 *    and reverted the same day — he did not like it — which also took the
 *    exception back out of the audit. It measures 2.23:1.
 * 3. **It is a `<ul>`**: five peers, and a screen reader announces the count.
 *
 * The band is deliberately shallow — `py-6` — and the type deliberately large:
 * it is a glance, not a section, and at `text-small` the labels read as legal
 * copy rather than as the five things that matter.
 *
 * The five share one row only from xl. At lg the columns come out 163px wide
 * and three of the labels wrap, which is what makes the band grow — the row
 * has to be 3+2 there instead, measured, not guessed.
 *
 * Fade plus sheen are two divs and zero JavaScript. The component they came
 * from was not installed: it pulls in `motion`, the animation library that has
 * already been dropped three times here over the home's JS budget.
 */
export function TrustBar() {
  return (
    <section className="relative isolate py-6 md:py-8">
      {/* The grey, fading out at both edges instead of ending on a rule. */}
      <div
        aria-hidden
        className="bg-paper-50 absolute inset-0 -z-10 mask-t-from-90% mask-t-to-100% mask-b-from-90% mask-b-to-100%"
      >
        {/* The sheen from the reference component: a white veil in overlay
            blend. It only ever lightens the band, so the audited ratios can
            move up but never down. */}
        <div className="pointer-events-none absolute inset-0 bg-white/15 mix-blend-overlay" />
      </div>

      <Container>
        {/* The underscores are load-bearing: Tailwind turns them into spaces,
            and `calc(50%-0.75rem)` without them is invalid CSS — the basis
            silently falls back to auto and the row collapses. */}
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-7 sm:gap-x-8 xl:flex-nowrap xl:justify-between">
          {trustMetrics.map((metric) => (
            <li
              key={metric.label}
              className="flex basis-[calc(50%_-_0.75rem)] flex-col items-center gap-1 text-center sm:basis-[calc(33.333%_-_1.5rem)] xl:grow xl:basis-0"
            >
              <span className="text-h2 text-brand-700 leading-none font-bold">
                {metric.value}
              </span>
              <span className="text-body text-ink-500">{metric.label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
