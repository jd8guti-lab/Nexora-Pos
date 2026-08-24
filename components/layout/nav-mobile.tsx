"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoLockup } from "@/components/brand/logo-lockup";
import { Button } from "@/components/ui/button";
import { navLinks, portalLink, primaryCta } from "@/content/nav";
import { site } from "@/content/site";

/**
 * Full-screen mobile menu.
 *
 * Radix Dialog gives us the focus trap, the Escape handler, the scroll lock
 * and aria-modal for free — the parts that are easy to get subtly wrong by
 * hand. Every target here is at least 44px tall.
 */
export function NavMobile() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // A route change must close the menu; Radix has no reason to know about it.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="ease-brand text-ink-900 hover:bg-paper-50 -mr-2 inline-flex size-11 items-center justify-center rounded-full transition-colors duration-200 lg:hidden"
          aria-label="Abrir el menú"
        >
          <Menu className="size-6" aria-hidden />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="bg-ink-900/20 fixed inset-0 z-50 backdrop-blur-sm lg:hidden" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Menú de navegación</Dialog.Title>

          <div className="flex h-18 shrink-0 items-center justify-between px-5 sm:px-6">
            <LogoLockup height={30} />
            <Dialog.Close asChild>
              <button
                type="button"
                className="text-ink-900 hover:bg-paper-50 -mr-2 inline-flex size-11 items-center justify-center rounded-full"
                aria-label="Cerrar el menú"
              >
                <X className="size-6" aria-hidden />
              </button>
            </Dialog.Close>
          </div>

          <nav aria-label="Principal" className="flex-1 overflow-y-auto px-5 sm:px-6">
            <ul className="border-ink-500/15 flex flex-col border-t">
              {navLinks.map((link) => (
                <li key={link.href} className="border-ink-500/15 border-b">
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className="text-h3 text-ink-900 flex min-h-14 items-center font-semibold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex shrink-0 flex-col gap-3 px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">
            <Button asChild size="lg">
              <Link href={primaryCta.href}>{primaryCta.label}</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link
                href={portalLink.href}
                {...(portalLink.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {portalLink.label}
              </Link>
            </Button>
            <p className="text-eyebrow tracking-eyebrow text-ink-500 pt-1 text-center">
              {site.descriptor}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
