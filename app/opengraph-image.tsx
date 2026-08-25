import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The Open Graph card.
 *
 * Drawn rather than screenshotted, with the brand tokens written out as
 * literals because next/og renders outside the app's CSS — this is the one
 * place a hex may appear (CLAUDE.md §3 bans them in .tsx components, and
 * this is an image generator, not a component).
 *
 * Text on the orange bar is ink-900, for the same measured reason it is
 * everywhere else: white on #FF7A00 is 2.61:1.
 */
const INK = "#1A1D23";
const BRAND = "#FF7A00";
const BRAND_LIGHT = "#FFB347";
const PAPER = "#F2F4F7";
const MUTED = "#69707E";

export default async function OpenGraphImage() {
  // The real mark, embedded. Drawing an "N" by hand here would be recreating
  // the isotype by eye, which CLAUDE.md §3 forbids.
  const isotype = await readFile(join(process.cwd(), "public/brand/isotype.png"));
  const isotypeSrc = `data:image/png;base64,${isotype.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        padding: 72,
        fontFamily: "sans-serif",
      }}
    >
      {/* Decorative orange wash, top right. */}
      <div
        style={{
          position: "absolute",
          top: -220,
          right: -160,
          width: 700,
          height: 700,
          borderRadius: 9999,
          background: `linear-gradient(135deg, ${BRAND}, ${BRAND_LIGHT})`,
          opacity: 0.16,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            color: MUTED,
            fontWeight: 600,
          }}
        >
          {site.descriptor}
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: 40,
            fontSize: 84,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.05,
            color: INK,
          }}
        >
          {site.claim.lead}&nbsp;
          <span style={{ color: "#BD5A00" }}>{site.claim.accent}</span>
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: MUTED,
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          {site.tagline}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- next/og
              renders to a raster; next/image has no meaning here. */}
        <img src={isotypeSrc} width={64} height={64} alt="" />
        {/* satori needs display:flex spelled out on any node with more
            than one child — here the text plus the coloured span. */}
        <div
          style={{
            display: "flex",
            fontSize: 40,
            fontWeight: 700,
            color: INK,
            letterSpacing: -1,
          }}
        >
          nexora
          <span style={{ color: "#BD5A00" }}>-pos</span>
        </div>
        <div
          style={{
            marginLeft: "auto",
            padding: "14px 28px",
            borderRadius: 9999,
            backgroundColor: PAPER,
            color: MUTED,
            fontSize: 24,
            fontWeight: 600,
          }}
        >
          {site.closing}
        </div>
      </div>
    </div>,
    size,
  );
}
