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

  /**
   * The claim, in the pieces the hero needs to style it.
   *
   * `underlined` carries the brand underline, `accent` the brand colour, and
   * `middle` is the plain sentence between them. Splitting it here rather
   * than in JSX keeps the rule of CLAUDE.md §5: changing a text never means
   * touching a component.
   */
  claim: {
    underlined: "Tu negocio.",
    middle: "Tu forma.",
    accent: "Nuestro software.",
    /** The whole thing, for places that need it as one string. */
    full: "Tu negocio. Tu forma. Nuestro software.",
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
 * The one number the site books appointments through.
 *
 * Every "Agendar una cita" on the site points here — nav, hero, the CTA at the
 * end of each section and the closing band — so the destination is decided in
 * one place. The message is prefilled so the conversation starts with context
 * instead of "Hola".
 *
 * `wa.me` wants the number with country code and nothing else: no +, no spaces.
 */
export const whatsapp = {
  number: "+57 313 271 2410",
  href: `https://wa.me/573132712410?text=${encodeURIComponent(
    "Hola, quiero agendar una cita para ver nexora-pos.",
  )}`,
} as const;

/**
 * The contact channels shown everywhere: the footer and /contacto.
 *
 * There is no city here. The business decided on 2026-08-31 not to publish a
 * location: the product is sold and supported remotely, and an address the
 * company does not actually receive visitors at is a liability, not a signal.
 */
export const contact: readonly ContactChannel[] = [
  {
    kind: "whatsapp",
    label: "WhatsApp",
    value: whatsapp.number,
    href: whatsapp.href,
  },
] as const;

/**
 * The email, which by the owner's decision (2026-08-31) appears ONLY in the
 * footer — not on /contacto, which already has the form, and not in the JSON-LD.
 *
 * Kept separate from `contact` rather than added to it precisely so that
 * "only in the footer" is enforced by what imports it, not by remembering.
 */
export const emailContact: ContactChannel = {
  kind: "email",
  label: "Correo",
  value: "nexoraposonline@gmail.com",
  href: "mailto:nexoraposonline@gmail.com",
} as const;

/** What the footer shows: the shared channels plus the email. */
export const footerContact: readonly ContactChannel[] = [
  ...contact,
  emailContact,
] as const;

/**
 * The trust bar. These are claims about how the product works, not numbers
 * about the company — CLAUDE.md §7 forbids inventing client counts, years of
 * experience or installations.
 *
 * The five are restatements of the pillars in §4 of CLAUDE.md, which is the
 * only way to keep them honest: nothing here is a figure about the company.
 *
 * The labels are short on purpose — 24 characters or fewer. At the size the
 * band uses, that is what fits on one line in its column; the moment one wraps,
 * that column grows and the row stops reading as a single glance.
 *
 * TODO(guti): confirma que las cinco son ciertas hoy.
 */
export const trustMetrics: readonly TrustMetric[] = [
  { value: "100%", label: "Personalizable" },
  { value: "A medida", label: "Se ajusta a tus procesos" },
  { value: "Modular", label: "Activas solo lo que usas" },
  { value: "Cifrados", label: "Tus datos, protegidos" },
  { value: "Directo", label: "Soporte de quien lo hizo" },
] as const;
