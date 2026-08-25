"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * The site's only entrance animation.
 *
 * Everything animated goes through here, which is what keeps the motion
 * budget honest: one curve, one distance, one duration, and a single place
 * where `prefers-reduced-motion` turns it all off. No other component imports
 * framer-motion (CLAUDE.md §6: sober and functional, nothing more).
 *
 * It fires once, on entering the viewport, and never replays — a section that
 * re-animates every time you scroll past it is a section that gets in the way.
 *
 * Note the `data-reveal` attribute. Framer bakes `opacity:0` into the
 * server-rendered markup, so without it a visitor whose JavaScript never runs
 * would get a permanently blank page. The <noscript> block in app/layout.tsx
 * targets this attribute and forces the content visible.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  /** Seconds. Use small steps (0.05–0.15) to stagger a row of cards. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as];

  // With reduced motion the element is simply rendered in place. No opacity
  // fade either: a fade is still motion to a vestibular system. It has to keep
  // the same tag — swapping an `li` for a `div` would break the list it is in.
  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      data-reveal=""
      className={cn(className)}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}
