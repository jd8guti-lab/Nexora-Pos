import { cn } from "@/lib/utils";

/**
 * The single content width of the site. Every section reads from this, so
 * nothing drifts out of alignment.
 */
export function Container({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[80rem] px-5 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}
