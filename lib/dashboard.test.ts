import type { SupabaseClient, User } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import {
  DIAS_PARA_VENCER,
  fetchDashboard,
  fetchTenantContext,
  finDelDia,
  formatearKilos,
  inicioDelDia,
  slugDelUsuario,
} from "./dashboard";

type Respuesta = { data?: unknown; error?: { message: string } | null; count?: number };

type Llamada = { tabla: string; filtros: Array<[string, unknown]> };

/**
 * Doble del cliente de Supabase.
 *
 * Cada método del builder devuelve el propio objeto y `then` lo resuelve, que es
 * exactamente cómo se comporta el builder real: encadenable y esperable. Las respuestas
 * se consumen en orden por tabla, porque `fetchDashboard` consulta `pedidos` tres veces.
 */
function fakeSupabase(respuestas: Record<string, Respuesta[]>) {
  const llamadas: Llamada[] = [];
  const pendientes: Record<string, Respuesta[]> = Object.fromEntries(
    Object.entries(respuestas).map(([tabla, lista]) => [tabla, [...lista]]),
  );

  const client = {
    from(tabla: string) {
      const resultado = pendientes[tabla]?.shift() ?? { data: [], error: null };
      const llamada: Llamada = { tabla, filtros: [] };
      llamadas.push(llamada);

      const builder = {
        select: () => builder,
        order: () => builder,
        limit: () => builder,
        neq: () => builder,
        gte: () => builder,
        lt: () => builder,
        gt: () => builder,
        eq: (columna: string, valor: unknown) => {
          llamada.filtros.push([columna, valor]);
          return builder;
        },
        maybeSingle: () => Promise.resolve(resultado),
        then: (resolve: (valor: Respuesta) => unknown) =>
          Promise.resolve(resultado).then(resolve),
      };

      return builder;
    },
  };

  return { client: client as unknown as SupabaseClient, llamadas };
}

const usuario = (extra: Partial<User> = {}) =>
  ({
    id: "u1",
    email: "duena@dospalmas.com",
    app_metadata: {},
    user_metadata: {},
    ...extra,
  }) as User;

describe("inicioDelDia / finDelDia", () => {
  it("recorta a la medianoche local y avanza un día", () => {
    const referencia = new Date(2026, 8, 2, 15, 42, 7);

    expect(inicioDelDia(referencia).getHours()).toBe(0);
    expect(inicioDelDia(referencia).getDate()).toBe(2);
    expect(finDelDia(referencia).getDate()).toBe(3);
    expect(finDelDia(referencia).getHours()).toBe(0);
  });
});

describe("slugDelUsuario", () => {
  it("prefiere app_metadata sobre user_metadata", () => {
    const user = usuario({
      app_metadata: { tenant_slug: "dos-palmas" },
      user_metadata: { tenant_slug: "otro" },
    });

    expect(slugDelUsuario(user)).toBe("dos-palmas");
  });

  it("devuelve null cuando el usuario no trae tenant", () => {
    expect(slugDelUsuario(usuario())).toBeNull();
    expect(slugDelUsuario(null)).toBeNull();
  });
});

describe("fetchTenantContext", () => {
  it("resuelve el tenant por el slug de la metadata", async () => {
    const { client, llamadas } = fakeSupabase({
      tenants: [
        { data: { id: "t1", slug: "dos-palmas", nombre: "Las dos palmas" }, error: null },
      ],
    });

    const tenant = await fetchTenantContext(
      client,
      usuario({ app_metadata: { tenant_slug: "dos-palmas" } }),
    );

    expect(tenant).toEqual({ id: "t1", slug: "dos-palmas", nombre: "Las dos palmas" });
    expect(llamadas[0]?.tabla).toBe("tenants");
  });

  it("cae al perfil por correo cuando no hay slug en la metadata", async () => {
    const { client, llamadas } = fakeSupabase({
      profiles: [
        {
          data: {
            tenant_id: "t9",
            tenants: { id: "t9", slug: "dos-palmas", nombre: "Las dos palmas" },
          },
          error: null,
        },
      ],
    });

    const tenant = await fetchTenantContext(client, usuario());

    expect(tenant?.id).toBe("t9");
    expect(llamadas[0]?.tabla).toBe("profiles");
  });

  it("normaliza el join anidado cuando PostgREST lo devuelve como arreglo", async () => {
    const { client } = fakeSupabase({
      profiles: [
        {
          data: {
            tenant_id: "t9",
            tenants: [{ id: "t9", slug: "dos-palmas", nombre: "Las dos palmas" }],
          },
          error: null,
        },
      ],
    });

    expect((await fetchTenantContext(client, usuario()))?.slug).toBe("dos-palmas");
  });

  it("devuelve null cuando el usuario no pertenece a ningún negocio", async () => {
    const { client } = fakeSupabase({ profiles: [{ data: null, error: null }] });

    expect(await fetchTenantContext(client, usuario())).toBeNull();
  });

  it("propaga el error de Supabase con un mensaje legible", async () => {
    const { client } = fakeSupabase({
      tenants: [{ data: null, error: { message: "JWT expired" } }],
    });

    await expect(
      fetchTenantContext(
        client,
        usuario({ app_metadata: { tenant_slug: "dos-palmas" } }),
      ),
    ).rejects.toThrow(/JWT expired/);
  });
});

describe("fetchDashboard", () => {
  const ahora = new Date(2026, 8, 2, 12, 0, 0);
  const hace45Dias = new Date(ahora.getTime() - 45 * 86_400_000).toISOString();

  const respuestasCompletas = (): Record<string, Respuesta[]> => ({
    pedidos: [
      {
        data: [
          {
            id: "p1",
            numero_ticket: "T-001",
            fecha: ahora.toISOString(),
            estado: "ENTREGADO",
            estado_pago: "PAGADO",
            total: 560000,
            saldo_pendiente: 0,
            cliente_snapshot: { nombre_mostrar: "La Esquina" },
            lineas_pedido: [{ kg: 200 }],
          },
          {
            id: "p2",
            numero_ticket: "T-002",
            fecha: ahora.toISOString(),
            estado: "GENERADO",
            estado_pago: "ABONADO",
            total: 240000,
            saldo_pendiente: 90000,
            cliente_snapshot: { nombre_empresa: "Doña Marta" },
            lineas_pedido: [{ kg: 100 }, { kg: 50 }],
          },
        ],
        error: null,
      },
      { data: [{ saldo_pendiente: 90000 }, { saldo_pendiente: 1400000 }], error: null },
      {
        data: [
          {
            id: "p3",
            numero_ticket: "T-003",
            fecha: hace45Dias,
            estado: "ENTREGADO",
            estado_pago: "PENDIENTE",
            total: 1400000,
            saldo_pendiente: 1400000,
            cliente_snapshot: { nombre_persona: "Distribuidora del Valle" },
          },
        ],
        error: null,
      },
    ],
    abonos: [{ data: [{ valor: 560000 }, { valor: 150000 }], error: null }],
    productos: [{ data: null, error: null, count: 3 }],
  });

  it("resume el día a partir de las filas reales", async () => {
    const { client } = fakeSupabase(respuestasCompletas());

    const datos = await fetchDashboard(client, "t1", ahora);

    expect(datos.pedidosHoy).toEqual({ total: 2, porEntregar: 1, kg: 350 });
    expect(datos.vendidoHoy).toEqual({ facturado: 800000, cobrado: 710000 });
    expect(datos.catalogo.productosActivos).toBe(3);
    expect(datos.cartera).toEqual({ pendiente: 1490000, documentos: 2 });
  });

  it("arma los dos listados con el nombre congelado del cliente", async () => {
    const { client } = fakeSupabase(respuestasCompletas());

    const datos = await fetchDashboard(client, "t1", ahora);

    expect(datos.pedidosDelDia.map((pedido) => pedido.cliente)).toEqual([
      "La Esquina",
      "Doña Marta",
    ]);
    expect(datos.carteraVencida).toHaveLength(1);
    expect(datos.carteraVencida[0]?.cliente).toBe("Distribuidora del Valle");
    expect(datos.carteraVencida[0]?.diasVencido).toBe(45);
  });

  it("filtra cada consulta por el tenant recibido", async () => {
    const { client, llamadas } = fakeSupabase(respuestasCompletas());

    await fetchDashboard(client, "t1", ahora);

    expect(llamadas).toHaveLength(5);
    for (const llamada of llamadas) {
      expect(llamada.filtros).toContainEqual(["tenant_id", "t1"]);
    }
  });

  it("no rompe cuando las tablas están vacías", async () => {
    const { client } = fakeSupabase({});

    const datos = await fetchDashboard(client, "t1", ahora);

    expect(datos.pedidosHoy).toEqual({ total: 0, porEntregar: 0, kg: 0 });
    expect(datos.vendidoHoy).toEqual({ facturado: 0, cobrado: 0 });
    expect(datos.catalogo.productosActivos).toBe(0);
    expect(datos.pedidosDelDia).toEqual([]);
    expect(datos.carteraVencida).toEqual([]);
  });

  it("falla entero si una sola consulta falla", async () => {
    const respuestas = respuestasCompletas();
    respuestas.abonos = [
      { data: null, error: { message: "permission denied for table abonos" } },
    ];
    const { client } = fakeSupabase(respuestas);

    await expect(fetchDashboard(client, "t1", ahora)).rejects.toThrow(
      /permission denied/,
    );
  });

  it("cuenta un pedido sin nombre de cliente sin dejar la fila en blanco", async () => {
    const { client } = fakeSupabase({
      pedidos: [
        {
          data: [
            {
              id: "p1",
              numero_ticket: null,
              fecha: ahora.toISOString(),
              estado: null,
              estado_pago: null,
              total: null,
              saldo_pendiente: null,
              cliente_snapshot: null,
              lineas_pedido: null,
            },
          ],
          error: null,
        },
      ],
    });

    const datos = await fetchDashboard(client, "t1", ahora);

    expect(datos.pedidosDelDia[0]?.cliente).toBe("Cliente sin nombre");
    expect(datos.pedidosDelDia[0]?.ticket).toBe("—");
    expect(datos.pedidosDelDia[0]?.estado).toBe("GENERADO");
    expect(datos.pedidosHoy.kg).toBe(0);
  });
});

describe("formato", () => {
  it("muestra los kilos con dos decimales", () => {
    expect(formatearKilos(350)).toMatch(/350,00 kg/);
  });

  it("mantiene el plazo de vencimiento en 30 días", () => {
    expect(DIAS_PARA_VENCER).toBe(30);
  });
});
