import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A disclosure, built on native <details>/<summary>.
 *
 * This replaced a Radix accordion, which cost 19 kB on the home page and put
 * it over the ~120 kB budget in CLAUDE.md §6. The browser already does this
 * job, and does it better in the ways that matter here:
 *
 *   - It opens with no JavaScript at all, so the answers are readable even if
 *     the bundle never arrives.
 *   - Keyboard operation, focus and the expanded/collapsed announcement are
 *     built in. There is no ARIA to get wrong.
 *   - Browser find-in-page can reach text inside a closed panel and open it.
 *
 * Passing the same `name` to a group of them makes the browser close the
 * others when one opens — a real accordion, natively. Browsers without that
 * support simply allow more than one open at a time, which is harmless.
 */
export function Disclosure({
  summary,
  name,
  defaultOpen = false,
  className,
  summaryClassName,
  panelClassName,
  children,
}: {
  summary: React.ReactNode;
  /** Share a name across siblings for exclusive open. */
  name?: string;
  defaultOpen?: boolean;
  className?: string;
  summaryClassName?: string;
  panelClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <details
      name={name}
      open={defaultOpen}
      className={cn("group border-ink-500/20 border-b", className)}
    >
      <summary
        className={cn(
          // `list-none` plus the ::-webkit-details-marker reset in globals.css
          // removes the default triangle without hiding the control itself.
          "ease-brand flex min-h-14 cursor-pointer list-none items-start justify-between gap-4",
          "text-h3 text-ink-900 py-5 text-left font-semibold",
          "hover:text-brand-700 transition-colors duration-200",
          summaryClassName,
        )}
      >
        {summary}
        <Plus
          aria-hidden
          className="ease-brand text-brand-700 mt-0.5 size-5 shrink-0 transition-transform duration-200 group-open:rotate-45"
        />
      </summary>
      <div
        className={cn(
          "disclosure-panel text-body text-ink-500 max-w-2xl pb-5",
          panelClassName,
        )}
      >
        {children}
      </div>
    </details>
  );
}
