import { LegalDocument } from "@/components/sections/legal-document";
import { privacy } from "@/content/legal";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tratamiento de datos personales",
  description:
    "Qué datos personales recoge nexora-pos, para qué los usa y cómo ejercer tus derechos, conforme a la Ley 1581 de 2012.",
  path: "/legal/privacidad",
});

export default function PrivacyPage() {
  return <LegalDocument document={privacy} />;
}
