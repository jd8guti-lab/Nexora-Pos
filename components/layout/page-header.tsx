import { Section } from "@/components/layout/section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Heading } from "@/components/ui/heading";

/**
 * The masthead every secondary page opens with.
 *
 * It owns the page's single <h1>, which is what keeps that rule easy to hold:
 * a page uses this once, and everything below it is an h2.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <Section size="md" className="border-ink-500/10 border-b">
      <Eyebrow>{eyebrow}</Eyebrow>
      <Heading as="h1" size="h1" className="mt-4 max-w-3xl">
        {title}
      </Heading>
      {lead ? <p className="text-lead text-ink-500 mt-6 max-w-2xl">{lead}</p> : null}
      {children ? <div className="mt-8">{children}</div> : null}
    </Section>
  );
}
