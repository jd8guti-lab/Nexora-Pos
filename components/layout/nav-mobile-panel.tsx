"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { LogoLockup } from "@/components/brand/logo-lockup";
import { Button } from "@/components/ui/button";
import { navLinks, portalLink, primaryCta } from "@/content/nav";
import { site } from "@/content/site";

/**
 * The mobile menu's panel — everything that costs Radix Dialog.
 *
 * Split out from the trigger so it can be loaded on first tap rather than on
 * every page load. Radix Dialog is ~28 kB, and on a desktop visit the menu is
 * never opened at all.
 *
 * Radix supplies the focus trap, the Escape handler, the scroll lock and the
 * aria-hidden on everything outside — the parts that are easy to get subtly
 * wrong by hand. It also restores focus to whatever was focused when it
 * opened, which is the trigger, so no Dialog.Trigger is needed here.
 */
export function NavMobilePanel({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  return (
    <Dialog.Root open onOpenChange={(next) => (next ? undefined : onClose())}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-ink-900/20 fixed inset-0 z-50 backdrop-blur-sm lg:hidden" />
        <Dialog.Content
          className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden"
          aria-describedby={undefined}
          // Radix restores focus to whatever was active when it mounted. The
          // panel now mounts a tick after the tap, so that bookkeeping no
          // longer points at the trigger — and its restore would overwrite
          // ours. Hand the job back to NavMobile, which knows the button.
          onCloseAutoFocus={(event) => event.preventDefault()}
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
                  {/* Closing on the click, not on a route change: these are
                      in-page anchors now, so the pathname never changes and
                      the menu would stay open over the section it just
                      scrolled to. */}
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={
                      !link.href.includes("#") && pathname === link.href
                        ? "page"
                        : undefined
                    }
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
              <Link
                href={primaryCta.href}
                {...(primaryCta.external ? { target: "_blank", rel: "noreferrer" } : {})}
                onClick={onClose}
              >
                {primaryCta.label}
              </Link>
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
