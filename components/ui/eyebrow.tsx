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
      /**
       * `brand-500`, the bright brand orange, **and it does not pass AA**.
       *
       * At 13px this is body-sized text, so AA asks 4.5:1 and this gives
       * 2.61:1 on white. The user was shown that number and asked for the
       * bright orange anyway, twice; it is listed under authorised exceptions
       * in scripts/contrast.mjs, which reprints it on every run. The compliant
       * one is `brand-700` at 4.54:1.
       */
      accent: "text-brand-500",
      muted: "text-ink-500",
      inverse: "text-paper-50/70",
      onBrand: "text-ink-900/85",
    },
  },
  // Accent by default since 2026-08-27: every section label on the site is
  // meant to be orange, so the default is the common case and `muted` is the
  // exception rather than the other way round.
  defaultVariants: { tone: "accent" },
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
