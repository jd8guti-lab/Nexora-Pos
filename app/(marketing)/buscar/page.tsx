import { PageHeader } from "@/components/layout/page-header";
import { Section } from "@/components/layout/section";
import { GoogleSearch } from "@/components/search/google-search";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Buscar",
  description: "Busca contenido de nexora-pos con Google Custom Search.",
  path: "/buscar",
});

export default function SearchPage() {
  return (
    <>
      <PageHeader
        eyebrow="Buscar"
        title="Busca información de nexora-pos"
        lead="Aquí puedes buscar dentro de la web usando Google Custom Search cuando tengas el ID del motor configurado."
      />

      <Section>
        <GoogleSearch />
      </Section>
    </>
  );
}
