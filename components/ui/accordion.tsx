"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { createContext, useContext, useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Accordion, for the FAQ.
 *
 * Thin wrapper over Radix, which supplies the parts that are easy to get
 * subtly wrong: aria-expanded, Up/Down arrow navigation, Home/End, and a
 * panel that is a labelled `region` rather than an anonymous div.
 *
 * One thing Radix leaves out: while a panel is collapsed it drops
 * `aria-controls` from the trigger, because the panel's children are
 * unmounted. The panel element itself is still there, so the WAI-ARIA
 * accordion pattern does want the reference — the header button should point
 * at its panel whether or not the panel is open. `AccordionItem` therefore
 * mints a stable id and hands it to both halves.
 *
 * The open/close height animation lives in globals.css so the global
 * prefers-reduced-motion block flattens it along with everything else.
 */

const PanelIdContext = createContext<string | null>(null);

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) {
  const panelId = `${useId()}-panel`;
  return (
    <PanelIdContext.Provider value={panelId}>
      <AccordionPrimitive.Item
        className={cn("border-ink-500/20 border-b", className)}
        {...props}
      />
    </PanelIdContext.Provider>
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  const panelId = useContext(PanelIdContext);
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        aria-controls={panelId ?? undefined}
        className={cn(
          "group ease-brand text-h3 text-ink-900 flex flex-1 items-start justify-between gap-4 py-5 text-left font-semibold transition-colors duration-200",
          "hover:text-brand-700",
          className,
        )}
        {...props}
      >
        {children}
        <Plus
          aria-hidden
          className="ease-brand text-brand-700 mt-0.5 size-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-45"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) {
  const panelId = useContext(PanelIdContext);
  return (
    <AccordionPrimitive.Content
      id={panelId ?? undefined}
      className="accordion-content overflow-hidden"
      {...props}
    >
      <div className={cn("text-body text-ink-500 max-w-2xl pb-5", className)}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}
