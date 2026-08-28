import { portalUrl } from "@/lib/config";
import { whatsapp } from "./site";
import type { FooterColumn, NavLink } from "./types";

/**
 * Main navigation. Order matters: it mirrors the reading order of the home.
 *
 * **These are anchors, not pages.** The user asked for a nav that moves down
 * the page instead of leaving it, so every entry points at a section id that
 * the home actually renders — `#problema`, `#proceso`, `#casos`. Adding one
 * means adding the section; a link to an id that is not on the page is a
 * link that silently does nothing.
 *
 * "Contacto" points at the closing band above the footer, which is the page's
 * contact block — not at /contacto. The form is still there and the footer
 * links to it; the nav stays on the page, which is what was asked.
 */
export const navLinks: readonly NavLink[] = [
  { label: "El problema", href: "/#problema" },
  { label: "Cómo trabajamos", href: "/#proceso" },
  { label: "Casos reales", href: "/#casos" },
  { label: "Contacto", href: "/#contacto" },
] as const;

/** Secondary action in the nav. */
export const portalLink: NavLink = {
  label: "Ingresar al portal",
  href: portalUrl,
  external: !portalUrl.startsWith("/"),
} as const;

/**
 * Primary action, repeated across the site — and it now opens WhatsApp on the
 * number in `content/site.ts` rather than the contact form. The user asked for
 * "agendar la cita de una vez": one tap, no form in between. The form is still
 * there at /contacto and the footer links to it.
 */
export const primaryCta: NavLink = {
  label: "Agendar una cita",
  href: whatsapp.href,
  external: true,
} as const;

export const footerColumns: readonly FooterColumn[] = [
  {
    title: "Producto",
    links: [
      { label: "Módulos", href: "/modulos" },
      { label: "Casos reales", href: "/#casos" },
      { label: "Precios", href: "/precios" },
    ],
  },
  {
    title: "Compañía",
    links: [
      { label: "El problema", href: "/#problema" },
      { label: "Cómo trabajamos", href: "/#proceso" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Tratamiento de datos", href: "/legal/privacidad" },
      { label: "Términos de servicio", href: "/legal/terminos" },
    ],
  },
] as const;
