import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardMockup } from "@/components/mockups/dashboard";
import { Container } from "@/components/layout/container";
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
 * The claim is the site's h1 and the only one on the page. It renders in the
 * manual's two parts — the first two sentences in ink, the third in orange —
 * using brand-700, the only orange that is legible as text.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white pt-14 pb-16 md:pt-20 md:pb-24">
      {/* The subtle orange wash in the top-right corner. Decorative. */}
      <div
        aria-hidden
        className="bg-brand-gradient pointer-events-none absolute -top-32 -right-24 -z-10 size-[38rem] rounded-full opacity-[0.13] blur-3xl"
      />

      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <div>
            <Eyebrow>{site.descriptor}</Eyebrow>

            <h1 className="text-display mt-5 max-w-2xl">
              {site.claim.lead}{" "}
              <span className="text-brand-700">{site.claim.accent}</span>
            </h1>

            <p className="text-lead text-ink-900 mt-6 max-w-xl">{hero.lead}</p>
            <p className="text-body text-ink-500 mt-4 max-w-xl">{hero.body}</p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={hero.primaryCta.href}>
                  {hero.primaryCta.label}
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <DashboardMockup />
          </div>
        </div>
      </Container>
    </section>
  );
}
