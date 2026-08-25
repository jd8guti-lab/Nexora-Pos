import { Hammer, PencilRuler, Sprout, Store, Truck, Utensils } from "lucide-react";
import type { SectionIntro, UseCase } from "./types";

export const useCasesIntro: SectionIntro = {
  eyebrow: "Casos de uso",
  title: "Para negocios que no caben en una plantilla",
  lead: "Estos son tipos de negocio, no clientes nuestros. Sirven para que veas cómo cambia el sistema según lo que vendes y cómo lo vendes.",
} as const;

/**
 * Business types, not customers.
 *
 * The lead above says so out loud, because a grid of business categories on a
 * marketing page reads as a client list unless you state otherwise — and
 * CLAUDE.md §7 forbids implying customers we do not have.
 *
 * Each one names the modules it leans on, so the mapping to the seven modules
 * stays concrete instead of decorative.
 */
export const useCases: readonly UseCase[] = [
  {
    id: "tienda-de-barrio",
    business: "Tienda de barrio",
    pain: "Vendes rápido y fías a medio barrio. La libreta de los que deben no cuadra con la caja.",
    outcome:
      "Cobras en segundos, la cartera queda registrada y sabes quién debe qué sin buscar en la libreta.",
    modules: ["punto-de-venta", "clientes", "inventario"],
    icon: Store,
  },
  {
    id: "distribuidora",
    business: "Distribuidora",
    pain: "Manejas cientos de referencias y varios proveedores, y nunca sabes cuál te dejó el mejor precio.",
    outcome:
      "Comparas precios de compra, controlas lo que debes y ves qué referencia de verdad rota.",
    modules: ["inventario", "proveedores", "reportes"],
    icon: Truck,
  },
  {
    id: "restaurante",
    business: "Restaurante",
    pain: "La cocina va a un ritmo y la caja a otro. Al cierre nadie sabe cuánto se gastó en insumos.",
    outcome:
      "La venta descuenta los insumos y el cierre del día te dice qué dejó cada plato.",
    modules: ["punto-de-venta", "inventario", "contabilidad"],
    icon: Utensils,
  },
  {
    id: "ferreteria",
    business: "Ferretería",
    pain: "Vendes por unidad, por metro y por bulto, y ningún sistema enlatado entiende eso.",
    outcome:
      "Cada producto se maneja en la unidad que de verdad usas, sin cuentas aparte.",
    modules: ["inventario", "punto-de-venta", "proveedores"],
    icon: Hammer,
  },
  {
    id: "comercializadora-agricola",
    business: "Comercializadora agrícola",
    pain: "Los precios se mueven por semana y compras a productores con condiciones distintas cada uno.",
    outcome:
      "Registras cada compra con sus condiciones y ves el margen real cuando el precio cambia.",
    modules: ["proveedores", "contabilidad", "reportes"],
    icon: Sprout,
  },
  {
    id: "papeleria",
    business: "Papelería",
    pain: "Temporada escolar a tope y el resto del año tranquilo, con mil referencias pequeñas.",
    outcome:
      "Sabes qué reponer antes de la temporada y qué lleva meses ocupando estante.",
    modules: ["inventario", "reportes", "punto-de-venta"],
    icon: PencilRuler,
  },
] as const;
