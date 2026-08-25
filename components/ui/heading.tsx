import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Heading.
 *
 * The point of this primitive is that `as` (the semantic level) and `size`
 * (how big it looks) are separate props. A section three levels deep can look
 * small without becoming an <h4>, and a modest-looking line can still be the
 * <h2> a screen reader needs. That is what keeps the outline free of the
 * skipped levels CLAUDE.md §6 forbids.
 *
 * There is exactly one <h1> per page. Sections use `as="h2"`, cards `as="h3"`.
 */
const heading = cva("text-balance", {
  variants: {
    size: {
      display: "text-display",
      h1: "text-h1",
      h2: "text-h2",
      h3: "text-h3",
    },
    tone: {
      default: "",
      muted: "text-ink-500",
      inverse: "text-white",
    },
  },
  defaultVariants: { size: "h2", tone: "default" },
});

type HeadingProps = React.ComponentPropsWithoutRef<"h2"> &
  VariantProps<typeof heading> & {
    as?: "h1" | "h2" | "h3" | "h4";
  };

export function Heading({
  as: Tag = "h2",
  size,
  tone,
  className,
  children,
  ...props
}: HeadingProps) {
  return (
    <Tag className={cn(heading({ size, tone }), className)} {...props}>
      {children}
    </Tag>
  );
}
