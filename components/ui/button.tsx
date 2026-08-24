import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button.
 *
 * Two rules are enforced here rather than left to discipline:
 *
 * 1. The orange button carries ink-900 copy, never white. Measured, not
 *    assumed: white on brand-500 is 2.61:1, which fails AA at every size,
 *    while ink-900 on brand-500 is 6.46:1. See scripts/contrast.mjs.
 * 2. Every size is at least 44px tall, the minimum touch target.
 */
const button = cva(
  [
    "inline-flex items-center justify-center gap-2 rounded-full",
    "font-semibold whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,box-shadow,transform]",
    "duration-200 ease-brand",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:size-[1.15em] [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        /** ink-900 on brand-500: 6.46:1. Hover to brand-300 keeps 9.48:1. */
        primary: "bg-brand-500 text-ink-900 shadow-sm hover:bg-brand-300",
        secondary:
          "border-2 border-ink-900 bg-transparent text-ink-900 hover:bg-ink-900 hover:text-white",
        ghost: "bg-transparent text-ink-900 hover:bg-paper-50",
        link: "h-auto rounded-none px-0 text-ink-900 underline decoration-brand-500 decoration-2 underline-offset-4 hover:text-brand-700 hover:decoration-brand-700 hover:decoration-[3px]",
        /** For ink-900 surfaces: white plate reads 16.9:1 against the ground. */
        inverse: "bg-white text-ink-900 shadow-sm hover:bg-paper-50",
        inverseOutline:
          "border-2 border-white/70 bg-transparent text-white hover:border-white hover:bg-white/10",
        /** For the orange band: a white plate would only reach 2.61:1 against
            brand-500, so the button goes dark instead (6.46:1). */
        onBrand: "bg-ink-900 text-white shadow-sm hover:bg-ink-900/85",
      },
      size: {
        sm: "h-11 px-4 text-small",
        md: "h-12 px-6 text-body",
        lg: "h-14 px-8 text-lead",
      },
    },
    compoundVariants: [
      // The link variant owns its own metrics; sizes must not add padding.
      { variant: "link", size: ["sm", "md", "lg"], className: "h-auto px-0" },
    ],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof button> & {
    /** Render as the child element — use to wrap next/link without nesting. */
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(button({ variant, size }), className)}
      {...(asChild ? {} : { type: type ?? "button" })}
      {...props}
    />
  );
}

export { button as buttonVariants };
