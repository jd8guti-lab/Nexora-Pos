import { cn } from "@/lib/utils";

/**
 * Letters swap for a second copy of themselves on hover, each on its own
 * out-of-order delay so the word scrambles rather than sweeping left to right.
 *
 * **This is a server component and ships no JavaScript.** The whole effect is
 * two stacked copies per letter plus a CSS transition — the rules live in
 * `app/globals.css` under `.letter-swap`. It replaced a framer-motion version
 * that cost 29 kB gzip on every page, because the nav is on every page. See
 * decision 43 in docs/ESTADO.md; do not reach for a motion library for this.
 *
 * Two things it has to keep getting right:
 *
 * 1. **The word is readable without JavaScript.** Both copies are plain text
 *    in the server markup; CSS only moves them. CLAUDE.md §6.
 * 2. **It is announced once, by the caller.** Every letter is its own span and
 *    there are two of each, so read literally this spells "MMóódduullooss".
 *    The whole construction is `aria-hidden`, which makes the component purely
 *    presentational: **whoever renders it must name the interactive element**
 *    with `aria-label`. An earlier version carried its own `sr-only` label and
 *    the nav links ended up with no accessible name at all.
 *
 * `prefers-reduced-motion` is handled globally in `globals.css`, including the
 * delays — the blanket rule only flattens durations.
 */

type RandomLetterSwapProps = {
  label: string;
  className?: string;
  /** Milliseconds between one letter starting and the next. */
  staggerMs?: number;
};

/**
 * A deterministic shuffle of the letter positions.
 *
 * Deterministic on purpose: `Math.random()` would give the server and the
 * client different delays and React would flag a hydration mismatch. Seeding
 * from the label keeps every render identical while still looking unordered,
 * and different words get different orders.
 */
function staggerOrder(label: string, length: number): number[] {
  let seed = 0;
  for (let i = 0; i < label.length; i += 1) {
    seed = (seed * 31 + label.charCodeAt(i)) >>> 0;
  }
  const next = () => {
    // xorshift32 — small, stable, and good enough to look random.
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    return seed;
  };

  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = next() % (i + 1);
    [order[i], order[j]] = [order[j] as number, order[i] as number];
  }
  return order;
}

export function RandomLetterSwap({
  label,
  className,
  staggerMs = 25,
}: RandomLetterSwapProps) {
  const letters = [...label];
  const order = staggerOrder(label, letters.length);

  return (
    <span aria-hidden className={cn("letter-swap", className)}>
      {letters.map((letter, index) => (
        <span
          // Letters repeat, so the index has to be part of the key.
          key={`${letter}-${index}`}
          className="letter-swap-char"
          style={{
            // The stagger, as a custom property the CSS reads.
            ["--letter-delay" as string]: `${(order[index] ?? 0) * staggerMs}ms`,
            // Collapsed whitespace would drop the gap between words.
            whiteSpace: letter === " " ? "pre" : undefined,
          }}
        >
          <span>{letter}</span>
          <span>{letter}</span>
        </span>
      ))}
    </span>
  );
}
