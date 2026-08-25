import { cn } from "@/lib/utils";

/**
 * Marks a block for the site's one entrance animation: a short fade and a
 * 12px rise, once, when it reaches the viewport.
 *
 * **This is a server component on purpose.** It renders nothing but a tag
 * with `data-reveal` on it. All the behaviour lives in a single
 * `RevealObserver` mounted once per page — see components/motion/
 * reveal-observer.tsx.
 *
 * The home page has fifteen of these. As client components that was fifteen
 * hydration boundaries and fifteen effects to pay for on load, for an effect
 * that is identical in every one of them. Now it is fifteen plain <div>s and
 * one observer.
 *
 * Two rules still hold, and are enforced in the observer:
 *
 * - Content must never depend on JavaScript to be readable. Nothing is hidden
 *   until the observer arms it, so a page where scripting never runs shows
 *   everything.
 * - `prefers-reduced-motion` disables it entirely, in globals.css.
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
  return (
    <Tag
      data-reveal=""
      className={cn(className)}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </Tag>
  );
}
