import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/config";
import "./globals.css";

/**
 * Poppins, the brand typeface. Only the five weights the manual names are
 * loaded — 300/400/500/600/700 — because every extra weight is a font file
 * the visitor pays for.
 */
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
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
    <html lang="es-CO" className={poppins.variable}>
      <head>
        {/*
          Framer Motion writes the entrance animation's starting state —
          opacity:0 — straight into the server-rendered markup. If JavaScript
          never runs (blocked, failed, a text browser), every revealed section
          would stay invisible and the site would look empty. Content must not
          depend on JavaScript to be readable.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
