import { portalUrl } from "@/lib/config";
import type { FooterColumn, NavLink } from "./types";

/** Main navigation. Order matters: it mirrors the reading order of the home. */
export const navLinks: readonly NavLink[] = [
  { label: "Módulos", href: "/modulos" },
  { label: "Casos", href: "/casos" },
  { label: "Precios", href: "/precios" },
  { label: "Contacto", href: "/contacto" },
] as const;

/** Secondary action in the nav. */
export const portalLink: NavLink = {
  label: "Ingresar al portal",
  href: portalUrl,
  external: !portalUrl.startsWith("/"),
} as const;

/** Primary action, repeated across the site. */
export const primaryCta: NavLink = {
  label: "Agendar demo",
  href: "/contacto",
} as const;

export const footerColumns: readonly FooterColumn[] = [
  {
    title: "Producto",
    links: [
      { label: "Módulos", href: "/modulos" },
      { label: "Casos de uso", href: "/casos" },
      { label: "Precios", href: "/precios" },
    ],
  },
  {
    title: "Compañía",
    links: [
      { label: "Quiénes somos", href: "/#quienes-somos" },
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
