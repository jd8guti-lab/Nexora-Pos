import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Responsive grid. Mobile first, always: the base is one or two columns and
 * it only widens upward.
 */
const grid = cva("grid", {
  variants: {
    cols: {
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-2 lg:grid-cols-4",
      /** Cards dense enough to sit two-up on a phone, as the modules do. */
      "2-4": "grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
    },
    gap: {
      sm: "gap-4",
      md: "gap-5 md:gap-6",
      lg: "gap-6 md:gap-8",
    },
  },
  defaultVariants: { cols: 3, gap: "md" },
});

type GridProps = React.ComponentPropsWithoutRef<"div"> &
  VariantProps<typeof grid> & {
    /**
     * Apply the grid to the child element instead of wrapping it. Use it when
     * the grid is a real list: `<Grid asChild><ul>…</ul></Grid>` keeps the
     * <li> children directly inside the <ul>, which a wrapper would break.
     */
    asChild?: boolean;
  };

export function Grid({
  cols,
  gap,
  asChild = false,
  className,
  children,
  ...props
}: GridProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp className={cn(grid({ cols, gap }), className)} {...props}>
      {children}
    </Comp>
  );
}
