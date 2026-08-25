import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge. Small by definition, which is exactly where orange copy breaks, so
 * the `brand` tone is a tinted plate with ink-900 text rather than orange text.
 */
const badge = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-eyebrow tracking-eyebrow uppercase whitespace-nowrap",
  {
    variants: {
      tone: {
        brand: "bg-brand-500/12 text-ink-900",
        neutral: "bg-paper-50 text-ink-500",
        outline: "border border-ink-500/30 text-ink-500",
        /** On ink-900 surfaces. */
        inverse: "bg-white/10 text-paper-50",
        /** Solid orange plate — the only tone with a filled brand background. */
        solid: "bg-brand-500 text-ink-900",
      },
    },
    defaultVariants: { tone: "brand" },
  },
);

type BadgeProps = React.ComponentPropsWithoutRef<"span"> & VariantProps<typeof badge>;

export function Badge({ tone, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badge({ tone }), className)} {...props}>
      {children}
    </span>
  );
}
