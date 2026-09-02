/**
 * Datos reales del dashboard del portal, leídos de Supabase.
 *
 * Todo lo que se lee aquí está aislado por `tenant_id`. El filtro explícito de cada
 * consulta es redundante con la RLS que instala `backend/migracion-tenant-negocio.sql`,
 * y así debe quedarse: la RLS es la que manda, y el filtro es lo que hace que un fallo
 * de política se vea como cero filas en vez de como los datos de otro cliente.
 *
 * Lo que el esquema NO puede responder, y por qué el dashboard no lo pregunta:
 * el módulo de inventario se eliminó del negocio (no hay `lotes`, `movimientos` ni
 * saldos), así que no existe "cuánto queda" ni "por acabarse". En su lugar se muestran
 * el catálogo activo y la cartera, que sí salen de tablas reales.
 */

import type { SupabaseClient, User } from "@supabase/supabase-js";

/** Un pedido vence a los 30 días de tomado: el esquema no guarda fecha de vencimiento. */
export const DIAS_PARA_VENCER = 30;

/** Cuántas filas se traen para los dos listados del dashboard. */
export const LIMITE_LISTADO = 8;

export type TenantContext = {
  id: string;
  slug: string;
  nombre: string;
};

export type EstadoPedido = "GENERADO" | "ENTREGADO" | "ANULADO";

export type PedidoDelDia = {
  id: string;
  ticket: string;
  fecha: string;
  cliente: string;
  total: number;
  saldoPendiente: number;
  estado: EstadoPedido;
  kg: number;
};

export type CuentaVencida = {
  id: string;
  ticket: string;
  fecha: string;
  cliente: string;
  saldoPendiente: number;
  diasVencido: number;
};

export type DashboardData = {
  pedidosHoy: { total: number; porEntregar: number; kg: number };
  vendidoHoy: { facturado: number; cobrado: number };
  catalogo: { productosActivos: number };
  cartera: { pendiente: number; documentos: number };
  pedidosDelDia: PedidoDelDia[];
  carteraVencida: CuentaVencida[];
};

type ClienteSnapshot = {
  nombre_mostrar?: string | null;
  nombre_empresa?: string | null;
  nombre_persona?: string | null;
};

type PedidoRow = {
  id: string;
  numero_ticket: string | null;
  fecha: string;
  estado: string | null;
  estado_pago: string | null;
  total: number | null;
  saldo_pendiente: number | null;
  cliente_snapshot: ClienteSnapshot | null;
  lineas_pedido?: Array<{ kg: number | null }> | null;
};

/**
 * Nombre legible del cliente a partir del snapshot congelado en el pedido.
 * Se lee del snapshot y no de `clientes` a propósito: el pedido tiene que seguir
 * diciendo a quién se le vendió aunque el cliente se renombre después.
 */
function nombreCliente(snapshot: ClienteSnapshot | null): string {
  if (!snapshot) return "Cliente sin nombre";

  return (
    snapshot.nombre_mostrar ??
    snapshot.nombre_empresa ??
    snapshot.nombre_persona ??
    "Cliente sin nombre"
  );
}

function numero(valor: number | null | undefined): number {
  return typeof valor === "number" && Number.isFinite(valor) ? valor : 0;
}

function estadoPedido(valor: string | null): EstadoPedido {
  return valor === "ENTREGADO" || valor === "ANULADO" ? valor : "GENERADO";
}

function kgDelPedido(row: PedidoRow): number {
  return (row.lineas_pedido ?? []).reduce((suma, linea) => suma + numero(linea.kg), 0);
}

/** Medianoche local del día de `referencia`. El negocio cierra por día calendario. */
export function inicioDelDia(referencia: Date): Date {
  const inicio = new Date(referencia);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

export function finDelDia(referencia: Date): Date {
  const fin = inicioDelDia(referencia);
  fin.setDate(fin.getDate() + 1);
  return fin;
}

function diasDesde(fecha: string, referencia: Date): number {
  const transcurrido = referencia.getTime() - new Date(fecha).getTime();
  return Math.max(0, Math.floor(transcurrido / 86_400_000));
}

/** El slug del tenant tal como lo escribe `scripts/crear-usuario-portal.mjs`. */
export function slugDelUsuario(user: User | null): string | null {
  const app = (user?.app_metadata as { tenant_slug?: string } | undefined)?.tenant_slug;
  const meta = (user?.user_metadata as { tenant_slug?: string } | undefined)?.tenant_slug;

  return app ?? meta ?? null;
}

/**
 * Resuelve a qué tenant pertenece el usuario autenticado.
 *
 * Primero por el slug de la metadata del JWT, que es lo que ya escriben los scripts de
 * puesta en marcha. Si no lo trae, cae al perfil por correo, para usuarios creados a
 * mano en el panel de Supabase. Devuelve `null` si el usuario no pertenece a ninguno:
 * eso no es un error, es un usuario sin negocio asignado.
 */
export async function fetchTenantContext(
  supabase: SupabaseClient,
  user: User | null,
): Promise<TenantContext | null> {
  if (!user) return null;

  const slug = slugDelUsuario(user);

  if (slug) {
    const { data, error } = await supabase
      .from("tenants")
      .select("id, slug, nombre")
      .eq("slug", slug)
      .eq("activo", true)
      .maybeSingle();

    if (error) {
      throw new Error(`No se pudo leer el negocio del usuario: ${error.message}`);
    }

    if (data) {
      return { id: data.id, slug: data.slug, nombre: data.nombre };
    }
  }

  if (!user.email) return null;

  const { data: perfil, error: perfilError } = await supabase
    .from("profiles")
    .select("tenant_id, tenants(id, slug, nombre)")
    .eq("email", user.email)
    .maybeSingle();

  if (perfilError) {
    throw new Error(`No se pudo leer el perfil del usuario: ${perfilError.message}`);
  }

  // El join anidado llega como objeto o como arreglo de uno según la cardinalidad
  // que PostgREST deduzca; se normalizan los dos.
  const relacion = perfil?.tenants as
    | { id: string; slug: string; nombre: string }
    | Array<{ id: string; slug: string; nombre: string }>
    | null
    | undefined;
  const tenant = Array.isArray(relacion) ? relacion[0] : relacion;

  if (!tenant) return null;

  return { id: tenant.id, slug: tenant.slug, nombre: tenant.nombre };
}

/**
 * Las seis cifras del dashboard, en paralelo.
 *
 * Se lanzan juntas porque ninguna depende de otra y el portal se abre en el celular del
 * dueño: cuatro viajes en serie se notan. Si una falla, falla el conjunto — media pantalla
 * de números correctos y media en blanco es peor que un error honesto.
 */
export async function fetchDashboard(
  supabase: SupabaseClient,
  tenantId: string,
  ahora: Date = new Date(),
): Promise<DashboardData> {
  const desde = inicioDelDia(ahora).toISOString();
  const hasta = finDelDia(ahora).toISOString();
  const corteVencimiento = new Date(
    ahora.getTime() - DIAS_PARA_VENCER * 86_400_000,
  ).toISOString();

  const [pedidosHoy, abonosHoy, productos, cartera, vencidas] = await Promise.all([
    supabase
      .from("pedidos")
      .select(
        "id, numero_ticket, fecha, estado, estado_pago, total, saldo_pendiente, cliente_snapshot, lineas_pedido(kg)",
      )
      .eq("tenant_id", tenantId)
      .neq("estado", "ANULADO")
      .gte("fecha", desde)
      .lt("fecha", hasta)
      .order("fecha", { ascending: false }),

    supabase
      .from("abonos")
      .select("valor")
      .eq("tenant_id", tenantId)
      .gte("fecha", desde)
      .lt("fecha", hasta),

    supabase
      .from("productos")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("activo", true),

    supabase
      .from("pedidos")
      .select("saldo_pendiente")
      .eq("tenant_id", tenantId)
      .neq("estado", "ANULADO")
      .gt("saldo_pendiente", 0),

    supabase
      .from("pedidos")
      .select(
        "id, numero_ticket, fecha, estado, estado_pago, total, saldo_pendiente, cliente_snapshot",
      )
      .eq("tenant_id", tenantId)
      .neq("estado", "ANULADO")
      .gt("saldo_pendiente", 0)
      .lt("fecha", corteVencimiento)
      .order("fecha", { ascending: true })
      .limit(LIMITE_LISTADO),
  ]);

  const fallo =
    pedidosHoy.error ??
    abonosHoy.error ??
    productos.error ??
    cartera.error ??
    vencidas.error;

  if (fallo) {
    throw new Error(`No se pudieron cargar los datos del negocio: ${fallo.message}`);
  }

  const filasHoy = (pedidosHoy.data ?? []) as PedidoRow[];
  const filasVencidas = (vencidas.data ?? []) as PedidoRow[];
  const filasCartera = (cartera.data ?? []) as Array<{ saldo_pendiente: number | null }>;
  const filasAbonos = (abonosHoy.data ?? []) as Array<{ valor: number | null }>;

  const pedidosDelDia: PedidoDelDia[] = filasHoy.map((row) => ({
    id: row.id,
    ticket: row.numero_ticket ?? "—",
    fecha: row.fecha,
    cliente: nombreCliente(row.cliente_snapshot),
    total: numero(row.total),
    saldoPendiente: numero(row.saldo_pendiente),
    estado: estadoPedido(row.estado),
    kg: kgDelPedido(row),
  }));

  const carteraVencida: CuentaVencida[] = filasVencidas.map((row) => ({
    id: row.id,
    ticket: row.numero_ticket ?? "—",
    fecha: row.fecha,
    cliente: nombreCliente(row.cliente_snapshot),
    saldoPendiente: numero(row.saldo_pendiente),
    diasVencido: diasDesde(row.fecha, ahora),
  }));

  return {
    pedidosHoy: {
      total: pedidosDelDia.length,
      porEntregar: pedidosDelDia.filter((pedido) => pedido.estado === "GENERADO").length,
      kg: pedidosDelDia.reduce((suma, pedido) => suma + pedido.kg, 0),
    },
    vendidoHoy: {
      facturado: pedidosDelDia.reduce((suma, pedido) => suma + pedido.total, 0),
      cobrado: filasAbonos.reduce((suma, abono) => suma + numero(abono.valor), 0),
    },
    catalogo: {
      productosActivos: productos.count ?? 0,
    },
    cartera: {
      pendiente: filasCartera.reduce(
        (suma, fila) => suma + numero(fila.saldo_pendiente),
        0,
      ),
      documentos: filasCartera.length,
    },
    pedidosDelDia: pedidosDelDia.slice(0, LIMITE_LISTADO),
    carteraVencida,
  };
}

const formateadorPesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const formateadorKilos = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formateadorFecha = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** El peso colombiano no usa decimales. */
export function formatearPesos(valor: number): string {
  return formateadorPesos.format(valor);
}

export function formatearKilos(valor: number): string {
  return `${formateadorKilos.format(valor)} kg`;
}

export function formatearFecha(fecha: Date | string): string {
  return formateadorFecha.format(typeof fecha === "string" ? new Date(fecha) : fecha);
}
