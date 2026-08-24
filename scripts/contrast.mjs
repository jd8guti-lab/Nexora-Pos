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
  "ink-900": "#1A1D23",
  "ink-500": "#69707E",
  "paper-50": "#F2F4F7",
  white: "#FFFFFF",
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

/** Measured, failed, and therefore forbidden. Documented, not used. */
const banned = [
  ["Blanco sobre brand-500", "white", "brand-500", "Boton y franja usan ink-900"],
  ["Blanco sobre brand-300", "white", "brand-300", "Extremo claro del degradado"],
  ["brand-500 como color de texto sobre blanco", "brand-500", "white", "Usa brand-700"],
  [
    "brand-500 como color de texto sobre paper-50",
    "brand-500",
    "paper-50",
    "Usa brand-700",
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
console.log(`  ${rows.length - failed}/${rows.length} pasan`);

console.log(`\n  PROHIBIDOS — medidos, fallan, no se usan en ninguna parte:`);
for (const [name, fg, bg, why] of banned) {
  console.log(
    `  ${pad(name, 46)} ${pad(ratio(palette[fg], palette[bg]).toFixed(2) + ":1", 9)} ${why}`,
  );
}
console.log();

process.exit(failed > 0 ? 1 : 0);
