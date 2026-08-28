"use client";

import { CalendarDays, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoLockup } from "@/components/brand/logo-lockup";
import { Button } from "@/components/ui/button";
import { RandomLetterSwap } from "@/components/ui/random-letter-swap";
import { navLinks, portalLink, primaryCta } from "@/content/nav";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import { NavMobile } from "./nav-mobile";

/**
 * A full-bleed white bar, edge to edge. It was briefly a floating inset pill —
 * the shape the reference art happens to show — and the user asked for the
 * full width back; the extra room is what pays for the larger type and the
 * taller buttons here (`text-nav` links, `md` buttons instead of `sm`).
 *
 * Its total height is the `--spacing-nav` token, and the hero is one screen
 * minus that token. Changing the height here without changing the token pushes
 * the hero past the fold — that is how it broke once already.
 *
 * The primary button keeps `ink-900` copy on orange, not the white of the art:
 * white on brand-500 is 2.61:1 and fails AA at every size (CLAUDE.md §3).
 */
export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "ease-brand sticky top-0 z-50 w-full",
        "transition-[background-color,box-shadow] duration-200",
        scrolled
          ? "shadow-nav bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75"
          : "bg-white",
      )}
    >
      {/* Not `Container`: the user wants the logo hard against the left edge
          and the actions hard against the right one. A centred max-width held
          them 344px in from the edges on a 1920 screen. */}
      <div className="w-full px-5 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex h-[4.5rem] items-center gap-4">
          <Link
            href="/"
            // min-h-11 rather than letting the image set the height: the mark
            // is 34px tall, which would leave the tap target under 44px.
            className="inline-flex min-h-11 shrink-0 items-center rounded-sm"
            aria-label={`${site.name} — ir al inicio`}
          >
            <LogoLockup height={34} priority />
          </Link>

          {/* The desktop cluster switches at xl, not lg: with `text-nav` links and
              `md` buttons it no longer fits a 1024px viewport — it overflowed by
              56px there. Between lg and xl the full-screen menu is used. */}
          <nav aria-label="Principal" className="hidden flex-1 justify-center xl:flex">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                // Anchors are never "current": on the home all three would
                // match, and aria-current="page" on three links at once is
                // worse than none at all.
                const active = !link.href.includes("#") && pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      // RandomLetterSwap is aria-hidden — it renders two
                      // copies of every letter — so the name lives here.
                      aria-label={link.label}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "ease-brand text-nav inline-flex h-12 items-center rounded-full px-4 transition-colors duration-200",
                        // ink-900, not ink-500: the user asked for black so
                        // they read at a glance. 16.9:1 on white against the
                        // 5.5:1 the grey had. The hover keeps the brand cue in
                        // brand-700, the only orange that clears 4.5:1 here.
                        active
                          ? "text-ink-900 decoration-brand-500 underline decoration-2 underline-offset-[0.6em]"
                          : "text-ink-900 hover:text-brand-700",
                      )}
                    >
                      <RandomLetterSwap label={link.label} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            <Button asChild variant="ghost" size="md">
              <Link
                href={portalLink.href}
                {...(portalLink.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <User aria-hidden strokeWidth={1.75} />
                {portalLink.label}
              </Link>
            </Button>
            <Button asChild size="md">
              <Link
                href={primaryCta.href}
                {...(primaryCta.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                <CalendarDays aria-hidden strokeWidth={2} />
                {primaryCta.label}
              </Link>
            </Button>
          </div>

          {/* Pushes the trigger to the right edge on the breakpoints where
              the centred nav is not rendered and nothing else would. */}
          <div className="ml-auto xl:hidden">
            <NavMobile />
          </div>
        </div>
      </div>
    </header>
  );
}
