import type { FaqItem, SectionIntro } from "./types";

export const faqIntro: SectionIntro = {
  eyebrow: "Preguntas frecuentes",
  title: "Lo que todo el mundo pregunta antes de decidir",
} as const;

/**
 * The FAQ.
 *
 * Read this before editing: several answers below are hard product facts that
 * only you can confirm — whether it runs offline, whether it does DIAN
 * electronic invoicing, how long an implementation takes. Those carry a
 * TODO(guti) and are written so that the placeholder is visible on the page
 * rather than hidden in a comment. An honest gap beats a confident guess
 * (CLAUDE.md §7).
 *
 * The rest — data ownership, leaving, custom modules, support — follow
 * directly from how the product is sold, so they are answered plainly.
 */
export const faq: readonly FaqItem[] = [
  {
    id: "datos-mios",
    question: "¿Mis datos son míos?",
    answer:
      "Sí. Tus productos, tus ventas, tus clientes y tu cartera son tuyos. Nosotros los guardamos y los protegemos, pero no son nuestros ni los usamos para otra cosa.",
  },
  {
    id: "si-me-voy",
    question: "¿Qué pasa si un día me quiero ir?",
    answer:
      "Te llevas tu información. Te la entregamos en un formato que puedas abrir y cargar en otro lado. No cobramos por irte ni te dejamos los datos secuestrados.",
  },
  {
    id: "sin-internet",
    question: "¿Funciona sin internet?",
    answer:
      "TODO(guti): responde esto tú. Es una de las tres preguntas que más deciden una venta de POS en Colombia, y no la puedo contestar por ti. Si el sistema sigue vendiendo sin conexión y sincroniza al volver, dilo aquí con esas palabras. Si no, dilo también: es mejor que se sepa antes y no el primer día que se cae el internet.",
  },
  {
    id: "factura-dian",
    question: "¿Emite factura electrónica DIAN?",
    answer:
      "TODO(guti): responde esto tú. Di si ya está, si se integra con un proveedor tecnológico autorizado, o si todavía no. No inventes un estado de cumplimiento con la DIAN.",
  },
  {
    id: "cuanto-tarda",
    question: "¿Cuánto tarda la implementación?",
    answer:
      "Depende del tamaño del inventario y de cuánta información haya que migrar. Después de la primera reunión te damos una fecha concreta y nos comprometemos con ella. TODO(guti): si ya tienes un rango típico de tu experiencia, ponlo aquí.",
  },
  {
    id: "modulo-nuevo",
    question: "¿Puedo pedir un módulo que no existe?",
    answer:
      "Sí, y es literalmente a lo que nos dedicamos. Nos cuentas qué necesita hacer tu negocio, te decimos qué implica y lo construimos. No es un ticket que se pierde en una fila.",
  },
  {
    id: "varias-sedes",
    question: "¿Sirve para varias sedes?",
    answer:
      "Sí, con el plan a medida. Cada sede maneja su caja y su inventario, y los reportes los puedes ver por sede o consolidados.",
  },
  {
    id: "que-soporte",
    question: "¿Qué soporte incluye?",
    answer:
      "Te responde quien construyó el software, no un centro de llamadas leyendo un guion. Capacitamos a tu equipo al arrancar y quedamos disponibles después. TODO(guti): define aquí el canal y el horario reales, para no prometer lo que no puedas sostener.",
  },
  {
    id: "equipos",
    question: "¿Necesito comprar computadores nuevos?",
    answer:
      "TODO(guti): responde esto tú. Di qué necesita el sistema para funcionar — si corre en un navegador, si sirve con el computador que ya tienen, qué impresora y qué lector de código de barras soporta.",
  },
  {
    id: "quien-esta-detras",
    question: "¿Quién está detrás de nexora-pos?",
    answer:
      "Un equipo pequeño. Eso significa que hablas directo con quien hace el software y que no te pasan de área en área. También significa que no somos una multinacional, y preferimos que lo sepas de entrada.",
  },
] as const;
