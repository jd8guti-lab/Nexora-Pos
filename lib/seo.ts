import type { Metadata } from "next";
import { modules } from "@/content/modules";
import { site } from "@/content/site";
import { siteUrl } from "./config";

/**
 * One place that builds page metadata, so no page forgets its canonical or
 * ships an Open Graph card that disagrees with its own title.
 */
export function buildMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  /** Route path, starting with a slash. */
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${siteUrl}${path === "/" ? "" : path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      type: "website",
      locale: "es_CO",
      siteName: site.name,
      title: `${title} · ${site.name}`,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${site.name}`,
      description,
    },
  };
}

/**
 * JSON-LD.
 *
 * Only facts that are actually true today. No aggregateRating, no review
 * count, no founding date, no employee count — structured data is the last
 * place to put a flattering guess, because search engines treat it as a
 * claim about the world (CLAUDE.md §7).
 *
 * TODO(guti): cuando existan la razón social, el NIT y las redes sociales,
 * entran aquí como `legalName` y `sameAs`.
 *
 * No habrá `address`: el negocio decidió el 31 de agosto de 2026 no publicar
 * ubicación. El correo tampoco entra aquí — va solo en el pie, por la misma
 * decisión (ver `content/site.ts`).
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: siteUrl,
    logo: `${siteUrl}/brand/logo.png`,
    description: site.description,
    slogan: site.claim.full,
  };
}

export function softwareJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: site.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Point of Sale",
    operatingSystem: "Web",
    description: site.description,
    url: siteUrl,
    inLanguage: "es-CO",
    featureList: modules.map((mod) => mod.name),
    // No `offers`: the prices are still TODO(guti), and publishing a price in
    // structured data that does not exist would be a lie a crawler repeats.
  };
}
