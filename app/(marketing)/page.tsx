import { Section } from "@/components/layout/section";
import { site } from "@/content/site";

/**
 * Home.
 *
 * Fase 1 leaves this as the scaffold's proof of life: the layout, the type
 * scale and the tokens, nothing more. The thirteen real sections arrive in
 * Fase 3, each one composed from components/sections/.
 */
export default function HomePage() {
  return (
    <Section size="lg">
      <p className="text-eyebrow tracking-eyebrow text-ink-500">{site.descriptor}</p>
      <h1 className="text-display mt-6 max-w-3xl">
        {site.claim.lead} <span className="text-brand-700">{site.claim.accent}</span>
      </h1>
      <p className="text-lead text-ink-500 mt-6 max-w-xl">{site.description}</p>
    </Section>
  );
}
