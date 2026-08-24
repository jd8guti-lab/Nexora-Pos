import Image from "next/image";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import { Isotype } from "./isotype";

/** Intrinsic size of public/brand/logo.png, after trimming the empty canvas. */
const LOGO_W = 1095;
const LOGO_H = 212;

/**
 * The brand lockup, in the three treatments the site needs.
 *
 * Only `light` uses the supplied artwork. The other two set the name in
 * Poppins, because CLAUDE.md §3 forbids recolouring the mark and we have no
 * artwork for dark or orange grounds. Both reproduce a treatment the manual
 * itself shows, so nothing is invented.
 *
 * TODO(guti): cuando existan las versiones sobre fondo oscuro y monocroma,
 * `dark` y `onBrand` pasan a usar el archivo real.
 */
type Variant =
  /** White and paper-50 grounds: the supplied logotype, untouched. */
  | "light"
  /** ink-900 grounds: isotype plus white "nexora" and brand-500 "-pos",
      which is the manual's horizontal version. */
  | "dark"
  /** The orange band: name only, in ink-900. The isotype is orange and would
      vanish on brand-500, and we may not recolour it. */
  | "onBrand";

type LockupProps = {
  variant?: Variant;
  /** Rendered height in px. Width follows the mark's aspect ratio. */
  height?: number;
  /** Show the descriptor line under the name. */
  withDescriptor?: boolean;
  priority?: boolean;
  className?: string;
};

export function LogoLockup({
  variant = "light",
  height = 34,
  withDescriptor = false,
  priority = false,
  className,
}: LockupProps) {
  const descriptorSize = Math.max(9, Math.round(height * 0.2));
  const descriptor = withDescriptor ? (
    <span
      className={cn(
        "tracking-eyebrow block",
        variant === "dark" ? "text-paper-50/80" : "",
        variant === "light" ? "text-ink-500" : "",
        variant === "onBrand" ? "text-ink-900/75" : "",
      )}
      style={{ fontSize: descriptorSize, fontWeight: 600 }}
    >
      {site.descriptorShort}
    </span>
  ) : null;

  if (variant === "light") {
    return (
      <span className={cn("inline-flex flex-col gap-1.5", className)}>
        <Image
          src="/brand/logo.png"
          alt={site.name}
          width={Math.round((height * LOGO_W) / LOGO_H)}
          height={height}
          priority={priority}
          className="object-contain"
        />
        {descriptor}
      </span>
    );
  }

  const wordmark = (
    <span className="inline-flex flex-col">
      <span
        className={cn(
          "leading-none font-bold tracking-[-0.03em]",
          variant === "dark" ? "text-white" : "text-ink-900",
        )}
        style={{ fontSize: Math.round(height * 0.72) }}
      >
        nexora
        <span className={variant === "dark" ? "text-brand-500" : undefined}>-pos</span>
      </span>
      {descriptor}
    </span>
  );

  if (variant === "onBrand") {
    return <span className={cn("inline-flex flex-col", className)}>{wordmark}</span>;
  }

  return (
    <span className={cn("inline-flex items-center gap-[0.45em]", className)}>
      <Isotype size={height} priority={priority} />
      {wordmark}
    </span>
  );
}
