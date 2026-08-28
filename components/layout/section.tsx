import { cva, type VariantProps } from "class-variance-authority";
import { ConstellationGridLazy } from "@/components/ui/constellation-grid-lazy";
import { cn } from "@/lib/utils";
import { Container } from "./container";

/**
 * A page section.
 *
 * Only four backgrounds exist. That is deliberate: the manual says orange is
 * an accent, so `brand` is capped at two uses per page by review, and there is
 * no way to invent a fifth surface without editing this file.
 *
 * `surface-dark` / `surface-brand` are the hooks globals.css uses to flip the
 * focus ring to white where an ink ring would be invisible.
 */
const section = cva("w-full", {
  variants: {
    bg: {
      white: "bg-white text-ink-900",
      paper: "bg-paper-50 text-ink-900",
      ink: "surface-dark bg-ink-900 text-white",
      /* Copy on the orange band is ink-900, not white: white drops to 2.61:1
         on brand-500 and 1.78:1 at the light end of the gradient. */
      brand: "surface-brand bg-brand-gradient text-ink-900",
    },
    size: {
      sm: "py-12 md:py-16",
      md: "py-16 md:py-24",
      lg: "py-20 md:py-32",
    },
  },
  defaultVariants: { bg: "white", size: "md" },
});

type SectionProps = React.ComponentPropsWithoutRef<"section"> &
  VariantProps<typeof section> & {
    /** Render the children without the standard Container wrapper. */
    bleed?: boolean;
    containerClassName?: string;
    /**
     * Paint the constellation mesh behind the section.
     *
     * It is a canvas and a frame loop, so it is opt-in per section rather than
     * something every `Section` drags in: the sections that do not ask for it
     * stay server-rendered markup with no client component inside them. The
     * mesh itself is loaded after hydration — see ConstellationGridLazy.
     */
    mesh?: boolean;
  };

export function Section({
  bg,
  size,
  bleed = false,
  className,
  containerClassName,
  mesh = false,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(section({ bg, size }), mesh && "relative isolate", className)}
      {...props}
    >
      {mesh ? <ConstellationGridLazy /> : null}
      {bleed ? (
        children
      ) : (
        <Container className={containerClassName}>{children}</Container>
      )}
    </section>
  );
}
