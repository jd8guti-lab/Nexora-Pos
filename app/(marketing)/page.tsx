import { Hero } from "@/components/sections/hero";
import { Modules } from "@/components/sections/modules";
import { Pillars } from "@/components/sections/pillars";
import { Problem } from "@/components/sections/problem";
import { TrustBar } from "@/components/sections/trust-bar";

/**
 * Home.
 *
 * One long page with anchors. Each section is its own component and takes all
 * its copy from content/, so changing a sentence never means touching JSX.
 *
 * Order is fixed by the brief. Sections 7 to 13 — proceso, quiénes somos,
 * casos, precios, FAQ, CTA — land in the second half of Fase 3.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Problem />
      <Pillars />
      <Modules />
    </>
  );
}
