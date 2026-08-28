import { JsonLd } from "@/components/seo/json-ld";
import { CtaBand } from "@/components/sections/cta";
import { Hero } from "@/components/sections/hero";
import { Problem } from "@/components/sections/problem";
import { Process } from "@/components/sections/process";
import { TrustBar } from "@/components/sections/trust-bar";
import { UseCases } from "@/components/sections/use-cases";
import { site } from "@/content/site";
import { buildMetadata, softwareJsonLd } from "@/lib/seo";

export const metadata = buildMetadata({
  title: site.tagline,
  description: site.description,
  path: "/",
});

/**
 * Home.
 *
 * Five blocks and the footer, and that is the whole page: hero, the trust
 * band, the problem, how we work, and who it is for. It used to run eleven
 * sections deep — pillars, modules, who we are, pricing, FAQ and a closing
 * band — and the user cut it back on purpose: shorter and more direct.
 *
 * The cut sections still exist under components/sections and their copy still
 * lives in content/. `Pricing`, `Faq` and `CtaBand` are still used by the
 * secondary pages; `Pillars`, `Modules` and `About` are now on no page at all
 * and are kept only because a decision to shorten is easy to reverse.
 *
 * Each section takes all its copy from content/, so changing a sentence never
 * means touching JSX. Surfaces alternate white / paper for rhythm, and the
 * closing orange band is the page's only one — CLAUDE.md §3 allows two.
 *
 * Every section also ends in `SectionCta`, which books straight over WhatsApp.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Problem />
      <Process />
      <UseCases />
      <CtaBand />
      <JsonLd data={softwareJsonLd()} />
    </>
  );
}
