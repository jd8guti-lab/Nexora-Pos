import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The rounded plate holding a lucide icon — the pattern the manual uses on
 * the pillar and module cards.
 *
 * The icon is always decorative: it sits next to its own text label, so it is
 * `aria-hidden` and orange is allowed here (WCAG 1.4.11 exempts decoration).
 * If you ever need an icon that carries meaning on its own, give it a label
 * and use a tone with real contrast.
 */
const tile = cva("inline-flex shrink-0 items-center justify-center rounded-xl", {
  variants: {
    tone: {
      brand: "bg-brand-500/12 text-brand-700",
      solid: "bg-brand-gradient text-ink-900",
      neutral: "bg-paper-50 text-ink-900",
      inverse: "bg-white/10 text-brand-500",
    },
    size: {
      sm: "size-10 [&_svg]:size-5",
      md: "size-12 [&_svg]:size-6",
      lg: "size-14 [&_svg]:size-7",
    },
  },
  defaultVariants: { tone: "brand", size: "md" },
});

type IconTileProps = Omit<React.ComponentPropsWithoutRef<"span">, "children"> &
  VariantProps<typeof tile> & {
    icon: LucideIcon;
  };

export function IconTile({ icon: Icon, tone, size, className, ...props }: IconTileProps) {
  return (
    <span className={cn(tile({ tone, size }), className)} {...props}>
      <Icon aria-hidden strokeWidth={1.75} />
    </span>
  );
}
