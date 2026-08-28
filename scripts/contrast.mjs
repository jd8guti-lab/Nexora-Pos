/**
 * WCAG 2.1 contrast audit of the brand palette.
 *
 * Run with: node scripts/contrast.mjs
 *
 * This exists because the palette is orange-forward and orange is a trap: it
 * looks high-contrast and is not. Every pairing the site actually uses is
 * listed here with the rule it has to satisfy, so a regression shows up as a
 * failing script rather than as a Lighthouse complaint at the end.
 */

const palette = {
  "brand-500": "#FF7A00",
  "brand-300": "#FFB347",
  "brand-700": "#BD5A00",
  "brand-600": "#E86F00",
  "ink-900": "#1A1D23",
  "ink-500": "#626976",
  "paper-50": "#EDEDED",
  white: "#FFFFFF",

  /* Not brand tokens: the two worst-case backdrops the hero copy can land on.
     The hero image is full-bleed and the copy sits over it, so the backdrop is
     pixels — and since 2026-08-27 there is no scrim veiling them, so these are
     the raw darkest pixels of the plate itself, not a veiled floor:

       hero-bg-min  darkest pixel in the copy column (4%-32% wide, 8%-92%
                    tall) of public/brand/hero-mockup.png. 0.672 luminance.
       hero-bg-h1   darkest pixel in the band the claim actually occupies
                    (4%-40% wide, 18%-62% tall). 0.752 luminance.

     The 8%-92% bound excludes the plate's outermost edges, where the orange
     band runs: the copy is centred in the section and never reaches them.
     That is an assumption about layout, not a fact about the image, which is
     why step 4 of the rule in CLAUDE.md §3 is not optional — the browser
     measurement over the composited pixels is what confirms it.

     Both were read off the image pixel by pixel, not sampled on a grid.
     Recompute them if the plate, the column width or the copy order change. */
  /* The "Cómo trabajamos" background art, veiled: white at 65% over its
     darkest pixel (#BAA3A0, 0.392 luminance). Recompute if the art or the
     veil changes — the veil is what decides whether body copy can sit here. */
  "process-bg": "#E7DFDE",

  "hero-bg-min": "#FDCDA4",
  "hero-bg-h1": "#FEDBB7",
};

const channel = (v) => {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const luminance = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const r = channel((n >> 16) & 255);
  const g = channel((n >> 8) & 255);
  const b = channel(n & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** kind: normal text (4.5), large text >=24px or >=18.66px bold (3), ui (3). */
const THRESHOLD = { normal: 4.5, large: 3, ui: 3 };

const rgb = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const hex = (c) =>
  "#" +
  c
    .map((v) => Math.round(v).toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

/**
 * Flatten a translucent colour onto its background.
 *
 * Tailwind's `/NN` opacity suffix is easy to reach for and impossible to
 * eyeball: `text-ink-900/75` on the orange band measures 4.29:1 and fails,
 * while `/85` clears it. Any token used with an opacity belongs below.
 */
const composite = (fg, bg, alpha) => {
  const [f, b] = [rgb(fg), rgb(bg)];
  return hex(f.map((v, i) => alpha * v + (1 - alpha) * b[i]));
};

/**
 * Only pairings the site actually uses. Combinations that were measured and
 * then banned from the design system are listed at the bottom as `banned`,
 * so the reason survives even after the code stops using them.
 */
const checks = [
  ["Cuerpo sobre blanco", "ink-900", "white", "normal"],
  ["Cuerpo secundario sobre blanco", "ink-500", "white", "normal"],
  ["Cuerpo sobre paper-50", "ink-900", "paper-50", "normal"],
  ["Cuerpo secundario sobre paper-50", "ink-500", "paper-50", "normal"],
  ["Texto sobre ink-900", "white", "ink-900", "normal"],
  ["Texto secundario sobre ink-900", "paper-50", "ink-900", "normal"],
  ["Acento de texto naranja sobre blanco", "brand-700", "white", "normal"],
  ["Acento de texto naranja sobre paper-50", "brand-700", "paper-50", "large"],
  [
    "Barra de confianza: valores brand-700 sobre paper-50",
    "brand-700",
    "paper-50",
    "large",
  ],
  ["Acento del h1 (brand-600, texto grande) sobre blanco", "brand-600", "white", "large"],
  ["Hero: lead ink-900 sobre el plate", "ink-900", "hero-bg-min", "normal"],
  ["Proceso: titulares ink-900 sobre el fondo velado", "ink-900", "process-bg", "normal"],
  ["Hero: eyebrow ink-900 sobre el plate", "ink-900", "hero-bg-min", "normal"],

  ["Boton primario: ink-900 sobre brand-500", "ink-900", "brand-500", "normal"],
  ["Boton primario hover: ink-900 sobre brand-300", "ink-900", "brand-300", "normal"],
  ["Franja naranja: ink-900 sobre brand-500", "ink-900", "brand-500", "normal"],
  ["Franja naranja: ink-900 sobre brand-300", "ink-900", "brand-300", "normal"],
  ["Boton onBrand: blanco sobre ink-900", "white", "ink-900", "normal"],
  ["Anillo de foco ink-900 sobre blanco", "ink-900", "white", "ui"],
  ["Anillo de foco ink-900 sobre brand-500", "ink-900", "brand-500", "ui"],
  ["Anillo de foco blanco sobre ink-900", "white", "ink-900", "ui"],
  ["Borde ink-500 sobre blanco", "ink-500", "white", "ui"],
];

/**
 * Translucent text, flattened onto the surface it sits on.
 * [nombre, token, alfa, fondo, tipo]
 */
const translucent = [
  ["Cierre: lead ink-900/85 sobre naranja", "ink-900", 0.85, "brand-500", "normal"],
  [
    "Cierre: lead ink-900/85 al final del degradado",
    "ink-900",
    0.85,
    "brand-300",
    "normal",
  ],
  ["Eyebrow onBrand ink-900/85 sobre naranja", "ink-900", 0.85, "brand-500", "normal"],
  ["Footer: enlaces paper-50/85 sobre ink-900", "paper-50", 0.85, "ink-900", "normal"],
  ["Footer: cuerpo paper-50/75 sobre ink-900", "paper-50", 0.75, "ink-900", "normal"],
  [
    "Footer: © y etiquetas paper-50/60 sobre ink-900",
    "paper-50",
    0.6,
    "ink-900",
    "normal",
  ],
  ["Eyebrow inverse paper-50/70 sobre ink-900", "paper-50", 0.7, "ink-900", "normal"],
  ["Portal: cuerpo paper-50/65 sobre ink-900", "paper-50", 0.65, "ink-900", "normal"],
  ["Hero: cuerpo ink-900/80 sobre el plate", "ink-900", 0.8, "hero-bg-min", "normal"],
  [
    "Proceso: cuerpo ink-900/80 sobre el fondo velado",
    "ink-900",
    0.8,
    "process-bg",
    "normal",
  ],
];

/** Measured, failed, and therefore forbidden. Documented, not used. */
const banned = [
  ["Blanco sobre brand-500", "white", "brand-500", "Boton y franja usan ink-900"],
  ["Blanco sobre brand-300", "white", "brand-300", "Extremo claro del degradado"],
  ["brand-500 como color de texto sobre blanco", "brand-500", "white", "Usa brand-700"],
  ["ink-900 al 75% sobre brand-500", "ink-900", "brand-500", "Usa /85", 0.75],
  [
    "brand-500 como color de texto sobre paper-50",
    "brand-500",
    "paper-50",
    "Usa brand-700",
  ],
  [
    "brand-600 como texto normal (no grande) sobre blanco",
    "brand-600",
    "white",
    "Solo texto grande (>=24px o >=18.66px bold); usa brand-700 en cuerpo",
  ],
  [
    "Eyebrow brand-700 sobre paper-50 (13px cuenta como texto normal)",
    "brand-700",
    "paper-50",
    "Por eso las secciones con eyebrow naranja van en blanco",
  ],
  [
    "ink-500 sobre el fondo velado de Proceso",
    "ink-500",
    "process-bg",
    "Por eso el cuerpo de esa seccion va en ink-900/80",
  ],
  [
    "ink-500 sobre el plate del hero",
    "ink-500",
    "hero-bg-min",
    "El eyebrow va en ink-900",
  ],
];

let failed = 0;
const rows = checks.map(([name, fg, bg, kind]) => {
  const r = ratio(palette[fg], palette[bg]);
  const need = THRESHOLD[kind];
  const ok = r >= need;
  if (!ok) failed += 1;
  return { name, fg, bg, kind, r, need, ok };
});

/** Same treatment for the translucent pairs, flattened first. */
const translucentRows = translucent.map(([name, fg, alpha, bg, kind]) => {
  const r = ratio(composite(palette[fg], palette[bg], alpha), palette[bg]);
  const need = THRESHOLD[kind];
  const ok = r >= need;
  if (!ok) failed += 1;
  return { name, r, need, ok };
});

const pad = (s, n) => String(s).padEnd(n);
console.log(`\n  ${pad("PAR", 46)} ${pad("RATIO", 9)} ${pad("MINIMO", 8)} ESTADO`);
console.log("  " + "-".repeat(78));
for (const row of rows) {
  console.log(
    `  ${pad(row.name, 46)} ${pad(row.r.toFixed(2) + ":1", 9)} ${pad(
      row.need.toFixed(1) + ":1",
      8,
    )} ${row.ok ? "OK" : "FALLA"}`,
  );
}
console.log("  " + "-".repeat(78));
console.log(`\n  TRANSLUCIDOS — el color aplanado sobre su fondo:`);
for (const row of translucentRows) {
  console.log(
    `  ${pad(row.name, 46)} ${pad(row.r.toFixed(2) + ":1", 9)} ${pad(
      row.need.toFixed(1) + ":1",
      8,
    )} ${row.ok ? "OK" : "FALLA"}`,
  );
}

const total = rows.length + translucentRows.length;
console.log("  " + "-".repeat(78));
console.log(`  ${total - failed}/${total} pasan`);

/**
 * Pairs that FAIL AA and are used anyway, because the owner of the brand chose
 * them with the measured number in front of him. They are listed and printed on
 * every run — never silently passed — but they do not fail the audit.
 *
 * Adding one is not a developer's call: ask, show the ratio, and only then.
 */
const authorisedExceptions = [
  [
    "Acento del h1 del hero en brand-500",
    "brand-500",
    "hero-bg-h1",
    3,
    "Decision del usuario 2026-08-27: quiere el mismo naranja del boton",
  ],
  [
    "Eyebrow de seccion en brand-500 sobre blanco",
    "brand-500",
    "white",
    4.5,
    "Decision del usuario: quiere el naranja brillante. La opcion que cumple es brand-700 (4.54:1)",
  ],
  [
    "Acento del h2 de El problema en brand-500",
    "brand-500",
    "white",
    3,
    "Decision del usuario. Texto grande, pide 3:1. brand-600 cumpliria con 3.13:1",
  ],
];

console.log(
  `\n  EXCEPCIONES AUTORIZADAS — fallan AA y se usan igual, por decision expresa:`,
);
for (const [name, fg, bg, min, why] of authorisedExceptions) {
  console.log(
    `  ${pad(name, 46)} ${pad(ratio(palette[fg], palette[bg]).toFixed(2) + ":1", 9)} ${pad("min " + min + ":1", 9)} ${why}`,
  );
}

console.log(`\n  PROHIBIDOS — medidos, fallan, no se usan en ninguna parte:`);
for (const [name, fg, bg, why, alpha] of banned) {
  const front =
    alpha === undefined ? palette[fg] : composite(palette[fg], palette[bg], alpha);
  console.log(
    `  ${pad(name, 46)} ${pad(ratio(front, palette[bg]).toFixed(2) + ":1", 9)} ${why}`,
  );
}
console.log();

process.exit(failed > 0 ? 1 : 0);
