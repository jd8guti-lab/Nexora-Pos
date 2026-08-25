"use client";

import { useEffect, useRef } from "react";

/**
 * The site's only entrance animation: a short fade and a 12px rise, once,
 * when the element reaches the viewport.
 *
 * Not Framer Motion. The brief allows exactly this one effect, and Framer
 * cost 52 kB of the home page's JavaScript to provide it — past the ~120 kB
 * budget in CLAUDE.md §6. CSS owns the animation; this component only decides
 * when to arm it.
 *
 * The rule that shapes the whole design: **content must never depend on
 * JavaScript to be readable.** Two earlier attempts failed it, so the order
 * of operations here is deliberate:
 *
 *   1. The server renders everything visible. No hidden state in the HTML.
 *   2. Hiding happens *inside the effect*, one line before the observer is
 *      attached. So an element is only ever hidden by the same code that has
 *      already committed to revealing it. If scripting is blocked, if the
 *      bundle fails, if hydration never happens — nothing is hidden.
 *   3. A geometry check runs immediately after arming, so anything already on
 *      screen is revealed without waiting for the observer to fire at all.
 *
 * Step 3 is not belt-and-braces: an IntersectionObserver in a page that is
 * not compositing never fires, and without it the page stays blank.
 *
 * There is no flash from hiding after paint: content below the fold is
 * off-screen when it happens, and content on screen is revealed in the same
 * tick by step 3.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Seconds. Use small steps (0.05–0.15) to stagger a row of cards. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Nothing to animate with, so leave the element exactly as rendered.
    if (typeof IntersectionObserver === "undefined") return;

    const reveal = () => el.setAttribute("data-revealed", "");
    const onScreen = () => {
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < viewport && rect.bottom > 0;
    };

    // Arm it: from here on the element is hidden, and every path below ends
    // in reveal().
    el.setAttribute("data-reveal-armed", "");

    if (onScreen()) {
      reveal();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal();
          observer.disconnect();
          window.removeEventListener("scroll", onScroll);
        }
      },
      // Fire slightly before the element clears the bottom edge, so the
      // motion has finished by the time it is properly in view.
      { rootMargin: "0px 0px -80px 0px" },
    );

    // Last resort for a browser whose observer never fires. Passive, and it
    // unhooks itself the moment the element is shown.
    function onScroll() {
      if (!onScreen()) return;
      reveal();
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    }

    observer.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      data-reveal=""
      className={className}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
