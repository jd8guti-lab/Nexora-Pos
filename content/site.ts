import type { ContactChannel, TrustMetric } from "./types";

/**
 * Brand constants and company data.
 *
 * Anything marked TODO(guti) is a placeholder because the real value does not
 * exist yet. CLAUDE.md §7: an honest placeholder beats a pretty lie. Do not
 * fill these in by guessing — they are tracked in docs/ESTADO.md.
 */

export const site = {
  /** Always lowercase, always hyphenated. */
  name: "nexora-pos",
  descriptor: "SOFTWARE A MEDIDA · PERSONALIZABLE · ESCALABLE",
  /** Short descriptor, for the horizontal lockup where space is tight. */
  descriptorShort: "SOFTWARE A MEDIDA · PERSONALIZABLE",
  tagline: "Software de punto de venta a medida, personalizable y modular.",

  /** The claim. Rendered in three parts: the last one goes in brand-500. */
  claim: {
    lead: "Tu negocio. Tu forma.",
    accent: "Nuestro software.",
  },

  /** The closing line, used on the final CTA band. */
  closing: "Hecho para ti. Pensado para crecer contigo.",

  /** One-sentence pitch, reused in metadata. */
  description:
    "Un POS que se adapta a cómo tú ya trabajas, no al revés. Inventario, caja, facturación y reportes, con los módulos que de verdad usas.",

  /** TODO(guti): razón social y NIT reales para las páginas legales. */
  legalName: "TODO(guti): razón social",
  taxId: "TODO(guti): NIT",
} as const;

/**
 * Contact channels for the footer and /contacto.
 * TODO(guti): número de WhatsApp, correo y ciudad reales.
 */
export const contact: readonly ContactChannel[] = [
  {
    kind: "whatsapp",
    label: "WhatsApp",
    value: "TODO(guti): número",
    href: null,
  },
  {
    kind: "email",
    label: "Correo",
    value: "TODO(guti): correo",
    href: null,
  },
  {
    kind: "city",
    label: "Dónde estamos",
    value: "TODO(guti): ciudad",
    href: null,
  },
] as const;

/**
 * The trust bar. These are claims about how the product works, not numbers
 * about the company — CLAUDE.md §7 forbids inventing client counts, years of
 * experience or installations.
 *
 * TODO(guti): confirma que las cuatro son ciertas hoy. Si "Funciona sin
 * internet" todavía no aplica, dímelo y la cambiamos por otra real.
 */
export const trustMetrics: readonly TrustMetric[] = [
  { value: "100%", label: "Personalizable" },
  { value: "7", label: "Módulos que activas cuando los necesitas" },
  { value: "Cifrados", label: "Tus datos, siempre protegidos" },
  { value: "Directo", label: "Soporte con quien construyó el software" },
] as const;
