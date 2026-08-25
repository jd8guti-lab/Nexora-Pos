"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoLockup } from "@/components/brand/logo-lockup";
import { Button } from "@/components/ui/button";
import { navLinks, portalLink, primaryCta } from "@/content/nav";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { NavMobile } from "./nav-mobile";

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
        "sticky top-0 z-50 w-full transition-[background-color,box-shadow,backdrop-filter] duration-200",
        scrolled
          ? "shadow-nav bg-white/85 backdrop-blur-md supports-[backdrop-filter]:bg-white/75"
          : "bg-white",
      )}
    >
      <Container>
        <div className="flex h-18 items-center justify-between gap-4">
          <Link
            href="/"
            // min-h-11 rather than letting the image set the height: the mark
            // is 30px tall, which would leave the tap target under 44px.
            className="inline-flex min-h-11 shrink-0 items-center rounded-sm"
            aria-label={`${site.name} — ir al inicio`}
          >
            <LogoLockup height={30} priority />
          </Link>

          <nav aria-label="Principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "ease-brand text-body inline-flex h-11 items-center rounded-full px-4 font-medium transition-colors duration-200",
                        active
                          ? "text-ink-900 decoration-brand-500 underline decoration-2 underline-offset-8"
                          : "text-ink-500 hover:bg-paper-50 hover:text-ink-900",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button asChild variant="ghost" size="sm">
              <Link
                href={portalLink.href}
                {...(portalLink.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {portalLink.label}
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
          </div>

          <NavMobile />
        </div>
      </Container>
    </header>
  );
}
