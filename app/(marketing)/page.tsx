import { About } from "@/components/sections/about";
import { CtaBand } from "@/components/sections/cta";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Modules } from "@/components/sections/modules";
import { Pillars } from "@/components/sections/pillars";
import { Pricing } from "@/components/sections/pricing";
import { Problem } from "@/components/sections/problem";
import { Process } from "@/components/sections/process";
import { TrustBar } from "@/components/sections/trust-bar";
import { UseCases } from "@/components/sections/use-cases";

/**
 * Home.
 *
 * One long page with anchors. Each section is its own component and takes all
 * its copy from content/, so changing a sentence never means touching JSX.
 *
 * Surfaces alternate white / paper so the page has rhythm without leaning on
 * the accent colour. There is exactly one orange band, at the end.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Problem />
      <Pillars />
      <Modules />
      <Process />
      <About />
      <UseCases />
      <Pricing />
      <Faq />
      <CtaBand />
    </>
  );
}
