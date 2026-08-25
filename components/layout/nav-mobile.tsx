"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";

/**
 * The mobile menu trigger.
 *
 * Only the button ships with the page. The panel — and the ~28 kB of Radix
 * Dialog behind it — loads on the first tap. On a desktop visit it is never
 * fetched at all, and on a phone it arrives while the tap is still landing.
 *
 * This is the difference between paying for the menu on every page load and
 * paying for it when someone actually opens one.
 */
const NavMobilePanel = dynamic(
  () => import("./nav-mobile-panel").then((mod) => mod.NavMobilePanel),
  { ssr: false },
);

export function NavMobile() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // A route change must close the menu.
  useEffect(() => setOpen(false), [pathname]);

  /**
   * Focus goes back to the button on close, explicitly.
   *
   * Radix normally restores focus to whatever was active when the dialog
   * mounted, but the panel now mounts a tick after the tap, by which point
   * that bookkeeping no longer points at the trigger.
   *
   * It has to happen *after* the panel unmounts, not inside the close
   * handler: while the dialog is still up its focus trap pulls focus back
   * inside, and the unmount then drops it on <body>. Hence the flag and the
   * effect rather than a focus() call in `close`.
   */
  const restoreFocus = useRef(false);

  const close = useCallback(() => {
    restoreFocus.current = true;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (open || !restoreFocus.current) return;
    restoreFocus.current = false;
    triggerRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="Abrir el menú"
        className="ease-brand text-ink-900 hover:bg-paper-50 -mr-2 inline-flex size-11 items-center justify-center rounded-full transition-colors duration-200 lg:hidden"
      >
        <Menu className="size-6" aria-hidden />
      </button>

      {open ? <NavMobilePanel onClose={close} /> : null}
    </>
  );
}
