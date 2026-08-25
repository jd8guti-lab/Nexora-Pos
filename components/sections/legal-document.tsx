import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { Heading } from "@/components/ui/heading";
import type { LegalDocument as LegalDocumentType } from "@/content/types";

/**
 * Renders a legal document.
 *
 * Measure is capped at ~65 characters: legal text is the copy people are
 * least willing to read, and a full-width line makes it worse.
 */
export function LegalDocument({ document }: { document: LegalDocumentType }) {
  return (
    <>
      <PageHeader eyebrow="Legal" title={document.title} lead={document.intro} />

      <Section>
        <p className="text-small text-ink-500">
          Última actualización: {document.updatedAt}
        </p>

        <div className="mt-10 flex max-w-[65ch] flex-col gap-10">
          {document.sections.map((section) => (
            <section key={section.heading}>
              <Heading as="h2" size="h3">
                {section.heading}
              </Heading>
              <div className="mt-4 flex flex-col gap-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-body text-ink-500">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </Section>
    </>
  );
}
