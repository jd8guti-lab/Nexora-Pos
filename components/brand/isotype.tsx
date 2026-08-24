import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The nexora-pos isotype — the "N".
 *
 * Rendered from the supplied PNG. It is never redrawn as SVG, recoloured or
 * cropped (CLAUDE.md §3): the mark is the client's, not ours to reinterpret.
 * The source has a transparent background, so it sits on any surface.
 *
 * TODO(guti): reemplazar por SVG cuando exista, para peso y nitidez.
 */
export function Isotype({
  size = 40,
  className,
  priority = false,
}: {
  /** Rendered edge length in px. */
  size?: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    // No `sizes`: the mark renders at a fixed size, so letting Next derive a
    // 1x/2x srcset from width/height beats offering the browser sixteen
    // candidates it will never use.
    <Image
      src="/brand/isotype.png"
      alt=""
      aria-hidden
      width={size}
      height={size}
      priority={priority}
      className={cn("object-contain", className)}
    />
  );
}
