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

/**
 * "Quiénes somos", built on the meaning of the isotype: the "N" stands for
 * connection, flow and growth (CLAUDE.md §3). That trio is the narrative
 * thread, so it is the structure of the section rather than a decoration.
 *
 * The closing paragraph is honest about the size of the team. TODO(guti):
 * ajústalo cuando quieras — es lo único aquí que habla de ti.
 */
export const about = {
  intro: {
    eyebrow: "Quiénes somos",
    title: "Por qué la N",
    lead: "El isotipo no es un adorno. Las tres ideas que lo forman son las mismas con las que construimos el software.",
  } satisfies SectionIntro,

  meanings: [
    {
      id: "conexion",
      title: "Conexión",
      description:
        "Caja, inventario, proveedores y cuentas dejan de ser islas. Lo que pasa en una se ve en las otras.",
    },
    {
      id: "flujo",
      title: "Flujo",
      description:
        "El sistema sigue el orden en que tú ya trabajas. No te obliga a dar vueltas para hacer lo de siempre.",
    },
    {
      id: "crecimiento",
      title: "Crecimiento",
      description:
        "Empiezas con lo que necesitas hoy y activas lo demás cuando el negocio lo pida, sin cambiar de sistema.",
    },
  ],

  body: [
    "Somos un equipo pequeño. Construimos este POS para un negocio real, resolviendo problemas reales, y funcionó lo suficientemente bien como para querer llevarlo a más gente.",
    "No tenemos un call center ni un departamento de ventas. Cuando escribes, te contesta alguien que conoce el código por dentro. Es más lento de escalar y mucho mejor para ti.",
  ],
} as const;

export const cta = {
  title: "Hecho para ti. Pensado para crecer contigo.",
  body: "Cuéntanos cómo trabajas y te mostramos cómo quedaría tu sistema. Sin compromiso y sin presentación de ventas.",
  primary: { label: "Agendar demo", href: "/contacto" },
  secondary: { label: "Ver precios", href: "/precios" },
} as const;

export const modulesIntro: SectionIntro = {
  eyebrow: "Módulos",
  title: "Siete módulos. Activas los que necesitas.",
  lead: "No tienes que llevarte todo desde el primer día. Empiezas por donde te aprieta y vas sumando cuando el negocio lo pida.",
} as const;
