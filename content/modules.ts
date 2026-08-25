import {
  BarChart3,
  Calculator,
  Package,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
} from "lucide-react";
import type { Module } from "./types";

/**
 * The seven modules, in the manual's order. Fixed set: no inventing an
 * eighth, no renaming (CLAUDE.md §4).
 *
 * `summary` is the one-liner for the home grid; `description` and `bullets`
 * feed the per-module blocks on /modulos. Nothing here claims a feature that
 * has not been built — if something is on the roadmap rather than shipped,
 * it does not belong in this file.
 *
 * TODO(guti): revisa los bullets módulo por módulo y quita lo que el POS
 * todavía no haga. Es lo único de este archivo que no puedo confirmar yo.
 */
export const modules: readonly Module[] = [
  {
    id: "punto-de-venta",
    name: "Punto de venta",
    summary: "Vende rápido, cobra sin enredos y cuadra la caja al cerrar.",
    description:
      "La pantalla donde pasas el día. Buscas el producto, lo cobras y sigues con el siguiente cliente. Al cerrar, el cuadre de caja te dice qué entró, en qué forma de pago y si algo no coincide.",
    bullets: [
      "Venta por código de barras o por búsqueda",
      "Varias formas de pago en una misma factura",
      "Apertura y cierre de caja con cuadre",
      "Devoluciones y anulaciones con su registro",
    ],
    icon: ShoppingCart,
  },
  {
    id: "inventario",
    name: "Inventario",
    summary: "Sabes qué tienes, qué se está acabando y qué no rota.",
    description:
      "Existencias al día sin tener que contar a mano. El sistema descuenta con cada venta, te avisa cuando algo llega al mínimo y te muestra qué lleva meses quieto en la bodega.",
    bullets: [
      "Existencias en tiempo real",
      "Alertas de mínimos y de producto sin rotación",
      "Entradas, salidas y ajustes con su motivo",
      "Manejo por categorías y por unidades de medida",
    ],
    icon: Package,
  },
  {
    id: "contabilidad",
    name: "Contabilidad",
    summary: "Las cuentas de tu negocio, sin hojas de cálculo paralelas.",
    description:
      "Lo que vendes y lo que gastas queda registrado donde debe estar. Cuando tu contador pida los números, los sacas del sistema y no de una libreta.",
    bullets: [
      "Registro de ingresos y egresos",
      "Cuentas por cobrar y por pagar",
      "Cierres por período",
      "Exportación para tu contador",
    ],
    icon: Calculator,
  },
  {
    id: "reportes",
    name: "Reportes",
    summary: "Qué se vende, cuándo y quién compra. En números, no en corazonadas.",
    description:
      "Los informes que de verdad usas para decidir: qué producto sostiene el negocio, qué día vendes más, qué margen te está dejando cada categoría.",
    bullets: [
      "Ventas por día, producto, categoría y vendedor",
      "Márgenes y utilidad",
      "Comparativos entre períodos",
      "Exportación a Excel y PDF",
    ],
    icon: BarChart3,
  },
  {
    id: "clientes",
    name: "Clientes",
    summary: "Quién te compra, cuánto te debe y hace cuánto no vuelve.",
    description:
      "El historial de cada cliente en un solo lugar: qué ha comprado, qué le fiaste y cuándo fue la última vez que pasó por tu negocio.",
    bullets: [
      "Ficha con historial de compras",
      "Cartera y control de crédito",
      "Datos para facturación",
      "Clientes frecuentes e inactivos",
    ],
    icon: Users,
  },
  {
    id: "proveedores",
    name: "Proveedores",
    summary: "A quién le compras, a qué precio y qué le debes.",
    description:
      "Órdenes de compra, recepción de mercancía y lo que le debes a cada proveedor. Sin llamar a preguntar cuánto quedó pendiente de la última remisión.",
    bullets: [
      "Ficha de proveedor con historial",
      "Órdenes de compra y recepción",
      "Cuentas por pagar",
      "Comparación de precios de compra",
    ],
    icon: Truck,
  },
  {
    id: "usuarios",
    name: "Usuarios",
    summary: "Cada quien ve lo suyo, y queda registro de quién hizo qué.",
    description:
      "Le das a cada persona el acceso que necesita y nada más. Si algo se anuló o se cambió un precio, sabes quién fue y a qué hora.",
    bullets: [
      "Roles y permisos por módulo",
      "Registro de actividad",
      "Varios usuarios por caja o por sede",
      "Bloqueo de acciones sensibles",
    ],
    icon: UserCog,
  },
] as const;
