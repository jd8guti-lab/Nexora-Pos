import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge has to be taught our scale.
 *
 * Out of the box it assumes `text-*` is a colour unless the suffix is one of
 * Tailwind's own size names. Our sizes are named (`text-body`, `text-h2`…),
 * so it read `text-body` as a colour, decided it conflicted with
 * `text-ink-900`, and silently dropped the colour. Every component that set
 * both a size and a colour would have lost the colour.
 *
 * Listing the custom groups here is what keeps `cn()` honest.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: ["display", "h1", "h2", "h3", "lead", "nav", "body", "small", "eyebrow"],
        },
      ],
      shadow: [{ shadow: ["card", "card-hover", "nav"] }],
      tracking: [{ tracking: ["eyebrow"] }],
      rounded: [{ rounded: ["card"] }],
    },
  },
});

/** Merge conditional class names, letting later Tailwind utilities win. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
