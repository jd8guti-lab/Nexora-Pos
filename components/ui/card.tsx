import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Card.
 *
 * The `interactive` lift is guarded by `@media (hover: hover)`. On a phone
 * there is no hover, and an untamed `hover:` rule sticks after a tap — the
 * card stays raised until you touch something else, which reads as a bug.
 */
const card = cva(
  "rounded-card ease-brand relative flex flex-col transition-[box-shadow,transform,border-color] duration-200",
  {
    variants: {
      variant: {
        default: "border border-ink-500/15 bg-white shadow-card",
        /** For cards that sit on paper-50 and need to separate from it. */
        plain: "border border-ink-500/15 bg-white",
        dark: "surface-dark border border-white/10 bg-ink-900 text-white",
        ghost: "border border-transparent bg-transparent",
      },
      interactive: {
        true: "hover:-translate-y-0.5 hover:shadow-card-hover motion-reduce:hover:translate-y-0",
        false: "",
      },
      padding: {
        none: "",
        sm: "p-5",
        md: "p-6 md:p-7",
        lg: "p-7 md:p-9",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        interactive: true,
        className: "hover:border-brand-500/40",
      },
    ],
    defaultVariants: { variant: "default", interactive: false, padding: "md" },
  },
);

type CardProps = React.ComponentPropsWithoutRef<"div"> & VariantProps<typeof card>;

export function Card({
  variant,
  interactive,
  padding,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div className={cn(card({ variant, interactive, padding }), className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex flex-col gap-3", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("flex flex-col gap-3", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return <div className={cn("mt-auto pt-5", className)} {...props} />;
}

/**
 * Stretches a link across the whole card so the entire surface is clickable
 * while only the text is announced as the link. Put it inside a Card that has
 * `interactive` set, and give the card `relative` (it already is).
 */
export function CardLinkOverlay({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn("absolute inset-0 rounded-[inherit]", className)}
      aria-hidden
      {...props}
    />
  );
}
