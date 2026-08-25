import type { PricingFeatureRow, PricingPlan, SectionIntro } from "./types";

export const pricingIntro: SectionIntro = {
  eyebrow: "Precios",
  title: "Pagas por lo que usas",
  lead: "Tres formas de empezar. Los dos primeros planes son puntos de partida: si tu negocio necesita algo distinto, se ajusta.",
} as const;

/**
 * The three plans.
 *
 * TODO(guti): los precios de Esencial y Negocio. No los invento — un precio
 * inventado en un sitio público es una promesa que después toca sostener.
 * Mientras tanto la tarjeta muestra el marcador y el CTA lleva a contacto.
 *
 * Same for what each plan includes: the feature lists below are the shape the
 * offer should take, not a commitment. Review them before publishing.
 */
export const pricingPlans: readonly PricingPlan[] = [
  {
    id: "esencial",
    name: "Esencial",
    tagline: "Para empezar a vender y controlar el inventario.",
    price: "TODO(guti): precio",
    priceNote: "por mes",
    features: [
      "Punto de venta e inventario",
      "Reportes de ventas",
      "Un punto de venta",
      "Migración de tus productos",
      "Soporte por WhatsApp",
    ],
    cta: { label: "Hablemos", href: "/contacto" },
    featured: false,
  },
  {
    id: "negocio",
    name: "Negocio",
    tagline: "Cuando ya manejas proveedores, cartera y varios usuarios.",
    price: "TODO(guti): precio",
    priceNote: "por mes",
    features: [
      "Todo lo del plan Esencial",
      "Clientes, proveedores y contabilidad",
      "Roles y permisos por usuario",
      "Reportes de márgenes y utilidad",
      "Soporte prioritario",
    ],
    cta: { label: "Hablemos", href: "/contacto" },
    featured: true,
  },
  {
    id: "a-medida",
    name: "A medida",
    tagline: "Cuando tu operación no se parece a ninguna otra.",
    price: "Hablemos",
    priceNote: "según lo que necesites",
    features: [
      "Los siete módulos",
      "Módulos y campos construidos para ti",
      "Varias sedes",
      "Integraciones con lo que ya usas",
      "Acompañamiento directo",
    ],
    cta: { label: "Cuéntanos tu caso", href: "/contacto" },
    featured: false,
  },
] as const;

/**
 * The collapsible comparison table.
 *
 * TODO(guti): confirma fila por fila. Está escrito como el reparto que tiene
 * sentido, no como el que ya existe.
 */
export const pricingComparison: readonly PricingFeatureRow[] = [
  {
    feature: "Punto de venta",
    values: { esencial: true, negocio: true, "a-medida": true },
  },
  {
    feature: "Inventario",
    values: { esencial: true, negocio: true, "a-medida": true },
  },
  {
    feature: "Reportes",
    values: { esencial: "Básicos", negocio: "Completos", "a-medida": "Completos" },
  },
  {
    feature: "Clientes y cartera",
    values: { esencial: false, negocio: true, "a-medida": true },
  },
  {
    feature: "Proveedores",
    values: { esencial: false, negocio: true, "a-medida": true },
  },
  {
    feature: "Contabilidad",
    values: { esencial: false, negocio: true, "a-medida": true },
  },
  {
    feature: "Roles y permisos",
    values: { esencial: false, negocio: true, "a-medida": true },
  },
  {
    feature: "Puntos de venta",
    values: { esencial: "1", negocio: "Hasta 3", "a-medida": "Los que necesites" },
  },
  {
    feature: "Sedes",
    values: { esencial: "1", negocio: "1", "a-medida": "Varias" },
  },
  {
    feature: "Módulos hechos a medida",
    values: { esencial: false, negocio: false, "a-medida": true },
  },
] as const;
