import type { Metadata, Viewport } from "next";
import { Figtree, Poppins } from "next/font/google";
import { JsonLd } from "@/components/seo/json-ld";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/config";
import { organizationJsonLd } from "@/lib/seo";
import "./globals.css";

/**
 * Figtree, the interface and copy typeface.
 *
 * Chosen by measuring the reference art rather than by eye. Three metrics
 * were taken off the mock-ups and compared against ten candidates:
 * x-height/cap-height (reference 0.704 — Figtree 0.706, the closest of all),
 * total advance over cap height, and per-glyph ink proportions for C/o/n/s/c.
 * Figtree ranked first or near-first on each. Poppins ranked last on every
 * one of them, which settles it: the art is not set in Poppins, and its
 * single-storey "a" does not match either.
 *
 * Only the five weights the site uses are loaded; every extra weight is a
 * file the visitor pays for.
 */
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-sans-brand",
});

/**
 * Poppins stays, but only for the wordmark.
 *
 * `LogoLockup` composes "nexora-pos" in type on dark and orange grounds
 * because there is no artwork for those (CLAUDE.md §3). That composition
 * imitates the real logotype, so it must not drift to a different typeface
 * just because the body font changed. One weight only — 700 is all it sets.
 */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  variable: "--font-poppins-wordmark",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CO" className={`${figtree.variable} ${poppins.variable}`}>
      <body className="min-h-dvh antialiased">
        {children}
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
