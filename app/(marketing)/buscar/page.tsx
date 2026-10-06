import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { GoogleSearch } from "@/components/search/google-search";
import { googleSearchEnabled } from "@/lib/config";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Buscar",
  description: "Busca contenido de nexora-pos con Google Custom Search.",
  path: "/buscar",
});

/*
 * The whole page is the Google Custom Search widget. Without `NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID`
 * the widget renders nothing, and what shipped was a heading over an empty section — a page that
 * looks broken to whoever lands on it. It 404s instead until the engine id exists.
 *
 * Nothing links here yet, on purpose: the widget pulls a script from cse.google.com, and putting a
 * third-party script in the nav of every page is a decision for the owner, not a side effect of
 * this page existing. It is out of `sitemap.ts` for the same reason.
 */
export default function SearchPage() {
  if (!googleSearchEnabled) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow="Buscar"
        title="Busca información de nexora-pos"
        lead="Escribe lo que buscas y Google te muestra las páginas de este sitio que lo mencionan."
      />

      <Section>
        <GoogleSearch />
      </Section>
    </>
  );
}
