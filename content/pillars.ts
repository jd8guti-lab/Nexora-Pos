import { Boxes, Headphones, Puzzle, ShieldCheck, SlidersHorizontal } from "lucide-react";
import type { Pillar } from "./types";

/**
 * The five pillars, verbatim from the brand manual. The set is fixed: no
 * renaming, no sixth pillar, no reordering (CLAUDE.md §4).
 *
 * Icons match the manual's own iconography.
 */
export const pillars: readonly Pillar[] = [
  {
    id: "a-medida",
    title: "A medida",
    description: "Se adapta a los procesos únicos de tu negocio.",
    icon: SlidersHorizontal,
  },
  {
    id: "personalizable",
    title: "Personalizable",
    description: "Configura módulos, campos, reportes y más.",
    icon: Puzzle,
  },
  {
    id: "modular",
    title: "Modular",
    description: "Activa solo lo que necesitas, cuando lo necesitas.",
    icon: Boxes,
  },
  {
    id: "seguro",
    title: "Seguro",
    description: "Tu información siempre protegida.",
    icon: ShieldCheck,
  },
  {
    id: "soporte-real",
    title: "Soporte real",
    description: "Estamos contigo en cada paso del camino.",
    icon: Headphones,
  },
] as const;
