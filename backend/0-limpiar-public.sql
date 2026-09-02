-- =============================================================================
-- PASO 0 — Dejar `public` limpio antes de correr los esquemas nuevos.
--
-- ⚠️  ESTO BORRA TABLAS. Léelo antes de pegarlo.
--
-- POR QUÉ HACE FALTA
--   `docs/esquema-supabase.sql` de Papas empieza con `create table public.tenants (`,
--   SIN `if not exists`. Tu base ya tiene una `public.tenants` distinta —creada por el
--   viejo `backend/esquema-supabase.sql` de nexora-pos, sin la columna `nit`— así que
--   el paso 1 aborta con «relation "tenants" already exists» en su primera sentencia.
--
--   Además `public` arrastra 19 tablas del dominio de la papa que el diseño nuevo
--   sustituye por el esquema `labrador`. Si se quedan, conviven dos copias del mismo
--   dominio y nadie sabrá cuál manda.
--
-- QUÉ SE PIERDE — comprobado con la `service_role` el 2026-09-02
--   * Las 17 tablas de negocio de `public`: 0 filas. No se pierde nada.
--   * `public.configuracion`: 1 fila de prueba (nombre "Test", ciudad "Cali").
--   * `public.tenants`: 3 filas (demo-tenant, papas-el-labrador, las-dos-palmas).
--     Se vuelven a crear en el paso 2. Abajo queda la consulta para copiarlas antes.
--   * `public.profiles`: 2 filas (un admin de cada empresa). El diseño nuevo no usa
--     esta tabla: la empresa del usuario vive en su `app_metadata`, y esos usuarios de
--     Auth NO se tocan aquí — siguen existiendo.
--
--   Los usuarios de Supabase Auth no se borran. Esto es solo el esquema `public`.
--
-- ANTES DE CORRERLO
--   Guarda lo que hay, por si acaso:
--     select slug, nombre, activo from public.tenants order by slug;
--     select tenant_id, email, rol from public.profiles;
--     select * from public.configuracion;
-- =============================================================================

begin;

-- ------------------------------------------------- Dominio de la papa -----
-- Se van enteras: su reemplazo es el esquema `labrador`, que crea el paso 1.
drop view if exists public.deuda_proveedores;

drop table if exists
  public.comisiones,
  public.abonos,
  public.lineas_pedido,
  public.pedidos,
  public.abonos_compra,
  public.compras,
  public.precios_pactados,
  public.historial_precios,
  public.productos,
  public.clientes,
  public.proveedores,
  public.vendedores,
  public.balances,
  public.gastos,
  public.categorias,
  public.tipos,
  public.tamanos,
  public.configuracion
cascade;

-- --------------------------------------- Plataforma, versión antigua -----
-- `profiles` y `business_config` no existen en el diseño nuevo. `tenants` sí, pero
-- con otras columnas (`nit`, `creado_en`), así que la crea el paso 1 desde cero.
drop table if exists
  public.business_config,
  public.profiles,
  public.tenants
cascade;

-- ------------------------------------ Restos del PR #2 (descartado) -----
drop function if exists public.current_tenant_id();

commit;

-- ------------------------------------------------------------ Comprobar -----
-- Tiene que dar 0 filas: `public` queda sin tablas propias.
--
-- select c.relname
--   from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
--  where ns.nspname = 'public' and c.relkind in ('r', 'v')
--  order by 1;
--
-- Ahora sí, sigue con el paso 1 de docs/PUESTA-EN-MARCHA-SUPABASE.md.
