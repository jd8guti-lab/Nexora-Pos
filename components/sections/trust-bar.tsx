import { Section } from "@/components/layout/section";
import { trustMetrics } from "@/content/site";

/**
 * The trust bar.
 *
 * These are statements about how the product works, never claims about the
 * company. CLAUDE.md §7 rules out invented client counts, years in business
 * or installation numbers, so none appear here — and none should be added
 * later without a real source.
 *
 * It is a <ul> because it is a list of four peers, and screen readers
 * announce the count.
 */
export function TrustBar() {
  return (
    <Section bg="paper" size="sm" className="border-ink-500/10 border-y">
      <ul className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {trustMetrics.map((metric) => (
          <li key={metric.label} className="flex flex-col gap-1">
            <span className="text-h2 text-brand-700 leading-none font-bold">
              {metric.value}
            </span>
            <span className="text-small text-ink-500">{metric.label}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}
