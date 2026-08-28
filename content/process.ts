import type { ProcessStep, SectionIntro } from "./types";

export const processIntro: SectionIntro = {
  eyebrow: "Cómo trabajamos",
  title: "Cuatro pasos,",
  titleAccent: "sin sorpresas",
  lead: "No te entregamos un instalador y te deseamos suerte. Entramos a ver cómo trabajas, montamos el sistema alrededor de eso y nos quedamos hasta que esté andando.",
} as const;

/**
 * The four steps, in order. Nothing here promises a duration: how long an
 * implementation takes depends on the business, and inventing a number would
 * be inventing a commitment (CLAUDE.md §7).
 */
export const processSteps: readonly ProcessStep[] = [
  {
    step: 1,
    title: "Entendemos tu operación",
    description:
      "Nos sentamos contigo a ver cómo vendes, cómo recibes mercancía y cómo cuadras el día. De ahí sale qué módulos necesitas y cuáles sobran.",
  },
  {
    step: 2,
    title: "Configuramos tu sistema",
    description:
      "Montamos los módulos, los campos y los reportes que definimos. Si tu negocio hace algo que ningún POS contempla, ahí es donde se construye.",
  },
  {
    step: 3,
    title: "Migramos tus datos",
    description:
      "Traemos tus productos, precios, clientes y proveedores desde donde estén: otro sistema, un Excel o una libreta. Revisamos contigo que todo haya quedado bien.",
  },
  {
    step: 4,
    title: "Acompañamos la puesta en marcha",
    description:
      "Capacitamos a tu equipo y estamos pendientes los primeros días, que es cuando salen las dudas de verdad. Después seguimos disponibles.",
  },
] as const;
