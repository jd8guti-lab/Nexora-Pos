import type { ComparisonColumn, SectionIntro } from "./types";

/**
 * Copy for the home sections.
 *
 * Voice: Colombian Spanish, tuteo, short sentences, real work — inventario,
 * caja, facturas, proveedores, cuadre del día. No agency jargon, no emoji.
 * Nothing here claims a client, a figure or a track record.
 */

export const hero = {
  lead: "Un POS que se adapta a cómo tú ya trabajas, no al revés.",
  body: "Cada negocio tiene su forma de vender, de manejar el inventario y de cuadrar el día. En vez de pedirte que cambies la tuya, construimos el sistema alrededor de ella.",
  primaryCta: { label: "Agendar demo", href: "/contacto" },
  secondaryCta: { label: "Ver los módulos", href: "/modulos" },
} as const;

export const problem = {
  intro: {
    eyebrow: "El problema",
    title: "El software enlatado te pone a trabajar para él",
    lead: "No es que los sistemas de caja sean malos. Es que están hechos para un negocio promedio, y el tuyo no lo es.",
  } satisfies SectionIntro,

  canned: {
    title: "Con un POS enlatado",
    points: [
      "Pagas por módulos que nunca vas a abrir.",
      "Acomodas tu forma de trabajar a lo que el programa permite.",
      "Lo que te falta se resuelve por fuera, en un cuaderno o en Excel.",
      "Pedir un cambio es abrir un ticket y esperar sin fecha.",
      "El soporte lo atiende alguien que no sabe cómo funciona tu negocio.",
    ],
  } satisfies ComparisonColumn,

  tailored: {
    title: "Con nexora-pos",
    points: [
      "Activas los módulos que usas y no pagas por el resto.",
      "El sistema se ajusta a tus procesos, incluso a los raros.",
      "Los campos y reportes que necesitas están dentro, no aparte.",
      "Si necesitas algo nuevo, hablamos y lo construimos.",
      "El soporte lo da quien escribió el software.",
    ],
  } satisfies ComparisonColumn,
} as const;

export const pillarsIntro: SectionIntro = {
  eyebrow: "Lo que nos define",
  title: "Cinco cosas que no negociamos",
} as const;

export const modulesIntro: SectionIntro = {
  eyebrow: "Módulos",
  title: "Siete módulos. Activas los que necesitas.",
  lead: "No tienes que llevarte todo desde el primer día. Empiezas por donde te aprieta y vas sumando cuando el negocio lo pida.",
} as const;
