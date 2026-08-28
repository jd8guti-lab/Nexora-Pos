import { whatsapp } from "./site";
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
  primaryCta: { label: "Agendar una cita", href: whatsapp.href, external: true },
  // Points at the section further down, not at /modulos: the modules page is
  // no longer part of what the home talks about, and the nav stays in-page.
  secondaryCta: { label: "Ver casos reales", href: "/#casos" },
} as const;

export const problem = {
  intro: {
    eyebrow: "El problema",
    title: "El software genérico te obliga a adaptarte.",
    titleAccent: "El nuestro se adapta a ti.",
    lead: "No es que los sistemas de caja sean malos. Es que están hechos para un negocio promedio, y el tuyo no lo es.",
  } satisfies SectionIntro,

  canned: {
    title: "Plantilla única",
    subtitle: "Tú te adaptas al sistema",
    points: [
      { emphasis: "Funciones", rest: "que no necesitas y no puedes quitar." },
      { emphasis: "Procesos rígidos", rest: "que no se ajustan a tu negocio." },
      { emphasis: "Reportes limitados", rest: "o que no responden lo que buscas." },
      { emphasis: "Cambios", rest: "costosos, lentos o simplemente no disponibles." },
      { emphasis: "Soporte genérico", rest: "que no entiende tu negocio." },
    ],
  } satisfies ComparisonColumn,

  tailored: {
    title: "Con nexora-pos",
    subtitle: "El sistema se adapta a ti",
    points: [
      { emphasis: "Activas solo lo que usas.", rest: "Sin pagar de más." },
      { emphasis: "Se ajusta a tu forma de trabajar,", rest: "no al revés." },
      { emphasis: "Campos y reportes", rest: "hechos para lo que realmente necesitas." },
      { emphasis: "Si necesitas algo nuevo,", rest: "lo hablamos y lo construimos." },
      { emphasis: "El soporte", rest: "lo da quien desarrolló el sistema." },
    ],
  } satisfies ComparisonColumn,
} as const;

export const pillarsIntro: SectionIntro = {
  eyebrow: "Lo que nos define",
  title: "Seis cosas que no negociamos",
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

/**
 * The closing band, which is also the page's contact section: the nav links to
 * it as "Contacto".
 *
 * It used to offer "Ver precios" beside the appointment. That button is gone
 * with the pricing section — pointing at a page the home no longer talks about
 * was the kind of loose end the user spotted immediately.
 */
export const cta = {
  eyebrow: "Contacto",
  title: "Hecho para ti. Pensado para crecer contigo.",
  body: "Cuéntanos cómo trabajas y te mostramos cómo quedaría tu sistema. Sin compromiso y sin presentación de ventas.",
  primary: { label: "Agendar una cita", href: whatsapp.href, external: true },
} as const;

/**
 * The call to action that closes every section of the home.
 *
 * One line and one button, the same in all of them: the user asked for a way
 * to book without scrolling to the end. The `note` changes nothing about where
 * it goes — it only says out loud that it opens WhatsApp, because a button
 * that leaves the site should say so before it is tapped.
 */
export const sectionCta = {
  label: "Agendar una cita",
  note: "Te escribimos por WhatsApp, sin formularios.",
  href: whatsapp.href,
} as const;

export const modulesIntro: SectionIntro = {
  eyebrow: "Módulos",
  title: "Siete módulos. Activas los que necesitas.",
  lead: "No tienes que llevarte todo desde el primer día. Empiezas por donde te aprieta y vas sumando cuando el negocio lo pida.",
} as const;
