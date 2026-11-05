import { Footer } from "@/components/layout/footer";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { Nav } from "@/components/layout/nav";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="focus:bg-ink-900 sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:px-5 focus:py-3 focus:text-white"
      >
        Saltar al contenido
      </a>
      <ScrollProgress />
      <Nav />
      {/* overflow-x-clip: a block entering from the right starts past the edge of a phone's screen,
          and without this it would open a horizontal scroll for the length of the entrance. */}
      <main id="contenido" className="flex-1 overflow-x-clip">
        {children}
      </main>
      <Footer />
      <RevealObserver />
    </div>
  );
}
