import { LegalDocument } from "@/components/sections/legal-document";
import { terms } from "@/content/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Términos de servicio",
  description: "Condiciones de uso del sitio web de nexora-pos.",
  path: "/legal/terminos",
});

export default function TermsPage() {
  return <LegalDocument document={terms} />;
}
