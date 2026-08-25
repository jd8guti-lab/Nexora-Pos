import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The uppercase label that sits above a section title.
 *
 * The manual sets descriptors and labels in caps with wide tracking, so that
 * treatment lives here rather than being retyped as utility classes each time.
 *
 * It renders a <p> by default: an eyebrow is a label, never a heading, and
 * marking it up as one would put a phantom level in the document outline.
 */
const eyebrow = cva("text-eyebrow tracking-eyebrow uppercase", {
  variants: {
    tone: {
      /** brand-500 fails AA as text, so the accent tone uses brand-700. */
      accent: "text-brand-700",
      muted: "text-ink-500",
      inverse: "text-paper-50/70",
      onBrand: "text-ink-900/75",
    },
  },
  defaultVariants: { tone: "muted" },
});

type EyebrowProps = React.ComponentPropsWithoutRef<"p"> &
  VariantProps<typeof eyebrow> & {
    as?: "p" | "span" | "div";
  };

export function Eyebrow({
  as: Tag = "p",
  tone,
  className,
  children,
  ...props
}: EyebrowProps) {
  return (
    <Tag className={cn(eyebrow({ tone }), className)} {...props}>
      {children}
    </Tag>
  );
}
