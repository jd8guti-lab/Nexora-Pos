"use client";

import { useEffect } from "react";

/**
 * Drives every `<Reveal>` on the page. Mounted once, in the marketing layout.
 *
 * One client component and one IntersectionObserver for the whole document,
 * instead of one of each per revealed block. On the home page that is the
 * difference between fifteen hydration boundaries and one.
 *
 * The order of operations carries the guarantees:
 *
 * 1. **Content never depends on JavaScript to be readable.** The server
 *    renders everything visible. Hiding happens here, in the same pass that
 *    starts observing — so nothing is ever hidden by code that has not
 *    already committed to revealing it. No script, nothing hidden.
 *
 * 2. **No forced layout.** An earlier version measured each element on mount;
 *    fifteen of those cost 1.3s of Style & Layout in Lighthouse. The only
 *    geometry reads left are inside a `requestAnimationFrame` and a passive
 *    `scroll` handler, when layout is already computed.
 *
 * 3. **A dead observer must not blank the page.** An IntersectionObserver in
 *    a document that is not compositing never fires. The frame check and the
 *    scroll fallback are what stand between that and an empty screen.
 */
export function RevealObserver() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])"),
    );
    if (targets.length === 0) return;

    const reveal = (el: HTMLElement) => {
      el.setAttribute("data-revealed", "");
      observer.unobserve(el);
      pending.delete(el);
      if (pending.size === 0) teardown();
    };

    const pending = new Set(targets);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) reveal(entry.target as HTMLElement);
        }
      },
      // Fire slightly before the element clears the bottom edge, so the
      // motion has finished by the time it is properly in view.
      { rootMargin: "0px 0px -80px 0px" },
    );

    // Arm and observe in one pass. Everything hidden here is already being
    // watched by the observer above.
    for (const el of targets) {
      el.setAttribute("data-reveal-armed", "");
      observer.observe(el);
    }

    const onScreen = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < viewport && rect.bottom > 0;
    };

    const sweep = () => {
      for (const el of [...pending]) if (onScreen(el)) reveal(el);
    };

    const frame = requestAnimationFrame(sweep);
    window.addEventListener("scroll", sweep, { passive: true });

    function teardown() {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", sweep);
      observer.disconnect();
    }

    return teardown;
  }, []);

  return null;
}
