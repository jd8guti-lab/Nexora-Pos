-- =============================================================================
-- Migración: aislar por tenant las tablas de negocio.
--
-- Punto de partida (verificado contra la base viva el 2026-09-02):
--   * `tenants`, `profiles` y `business_config` ya existen (backend/esquema-supabase.sql).
--   * Las tablas de negocio —las del esquema de Papas el Labrador— NO tienen `tenant_id`
--     y NO tienen RLS: hoy la anon key las lee enteras.
--
-- Este script arregla las dos cosas: agrega `tenant_id`, lo rellena con el tenant que
-- indiques abajo, lo deja NOT NULL con default, y enciende RLS con una política que
-- compara contra el tenant del usuario autenticado.
--
-- CÓMO CORRERLO
--   1. Cambia el slug en el bloque "TENANT DESTINO" por el tenant real.
--   2. Pégalo entero en el SQL Editor de Supabase y ejecútalo.
--   3. Verifícalo con: node scripts/validar-flujo-negocio.mjs <slug>
--
-- Es idempotente: se puede volver a correr sin romper nada.
--
-- ESTADO: aplicado el 2026-09-02 sobre el tenant `las-dos-palmas`. Verificado contra la
-- base: `tenant_id` existe en las 17 tablas, es NOT NULL, tiene default
-- `public.current_tenant_id()` y la función responde. El relleno fue un no-op porque las
-- tablas de negocio están vacías.
-- =============================================================================

begin;

-- ------------------------------------------------------- TENANT DESTINO -----
-- El tenant al que pertenece TODO lo que ya está en estas tablas.
-- Cámbialo antes de ejecutar.
create temporary table _tenant_destino on commit drop as
select id, slug from public.tenants where slug = 'las-dos-palmas';

do $$
begin
  if not exists (select 1 from _tenant_destino) then
    raise exception
      'No existe el tenant destino. Créalo primero con: node scripts/crear-tenant.mjs <slug> "<nombre>"';
  end if;
end;
$$;

-- --------------------------------------------- Tenant del usuario actual -----
-- Resuelve el tenant de quien hace la petición. Dos caminos, en este orden:
--   1. `app_metadata.tenant_slug` / `user_metadata.tenant_slug` del JWT — es lo que
--      ya escribe scripts/crear-usuario-portal.mjs.
--   2. El email del JWT contra `profiles`, para usuarios creados a mano.
--
-- SECURITY DEFINER a propósito: tiene que poder leer `tenants` y `profiles` aunque el
-- que llama no los vea. Es de solo lectura y no acepta parámetros, así que no hay
-- superficie para inyección.
create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  with claims as (
    select nullif(current_setting('request.jwt.claims', true), '')::jsonb as c
  ),
  por_slug as (
    select t.id
    from public.tenants t, claims
    where t.slug = coalesce(
      nullif(claims.c -> 'app_metadata' ->> 'tenant_slug', ''),
      nullif(claims.c -> 'user_metadata' ->> 'tenant_slug', '')
    )
    limit 1
  ),
  por_email as (
    select p.tenant_id as id
    from public.profiles p, claims
    where p.email = nullif(claims.c ->> 'email', '')
    limit 1
  )
  select id from por_slug
  union all
  select id from por_email
  limit 1;
$$;

revoke all on function public.current_tenant_id() from public;
grant execute on function public.current_tenant_id() to authenticated;

-- ------------------------------------------------ Columna, relleno, RLS -----
-- Mismo tratamiento para cada tabla de negocio, en un solo sitio para que ninguna
-- se quede a medias: una tabla sin RLS anula el aislamiento de todas las demás.
--
-- `configuracion` queda FUERA a propósito: tiene `check (id = 1)`, así que sostener
-- una fila por tenant exige rediseñarla. El dashboard no la lee. Ver docs/ESTADO.md.
do $$
declare
  tabla text;
  tenant uuid := (select id from _tenant_destino);
  tablas text[] := array[
    'tipos', 'tamanos', 'categorias', 'productos', 'historial_precios',
    'proveedores', 'compras', 'abonos_compra',
    'clientes', 'precios_pactados', 'vendedores',
    'pedidos', 'lineas_pedido', 'abonos', 'comisiones',
    'gastos', 'balances'
  ];
begin
  foreach tabla in array tablas loop
    if to_regclass('public.' || tabla) is null then
      raise notice 'Se omite %: no existe en esta base.', tabla;
      continue;
    end if;

    execute format(
      'alter table public.%I add column if not exists tenant_id uuid references public.tenants(id) on delete cascade',
      tabla
    );

    execute format('update public.%I set tenant_id = $1 where tenant_id is null', tabla)
      using tenant;

    execute format('alter table public.%I alter column tenant_id set not null', tabla);
    execute format(
      'alter table public.%I alter column tenant_id set default public.current_tenant_id()',
      tabla
    );
    execute format(
      'create index if not exists idx_%s_tenant_id on public.%I (tenant_id)',
      tabla, tabla
    );

    execute format('alter table public.%I enable row level security', tabla);
    execute format('drop policy if exists "%s_por_tenant" on public.%I', tabla, tabla);
    execute format(
      'create policy "%s_por_tenant" on public.%I for all to authenticated '
      || 'using (tenant_id = public.current_tenant_id()) '
      || 'with check (tenant_id = public.current_tenant_id())',
      tabla, tabla
    );
  end loop;
end;
$$;

-- ----------------------------------------------- Unicidad por tenant --------
-- Los UNIQUE del esquema original son globales. Con dos tenants en la misma base, el
-- SKU de uno bloquearía el del otro, y eso se descubre el día que entra el segundo
-- cliente. Se reemplazan por (tenant_id, columna).
do $$
declare
  par record;
begin
  for par in
    select * from (values
      ('productos',   'sku',        'productos_sku_key'),
      ('proveedores', 'nombre',     'proveedores_nombre_key'),
      ('pedidos',     'numero_ticket', 'pedidos_numero_ticket_key'),
      ('compras',     'consecutivo', 'compras_consecutivo_key'),
      ('tipos',       'nombre',     'tipos_nombre_key'),
      ('tamanos',     'nombre',     'tamanos_nombre_key'),
      ('categorias',  'nombre',     'categorias_nombre_key')
    ) as v(tabla, columna, restriccion)
  loop
    if to_regclass('public.' || par.tabla) is null then
      continue;
    end if;

    execute format('alter table public.%I drop constraint if exists %I', par.tabla, par.restriccion);
    execute format(
      'create unique index if not exists uq_%s_tenant_%s on public.%I (tenant_id, %I)',
      par.tabla, par.columna, par.tabla, par.columna
    );
  end loop;
end;
$$;

-- `clientes` tiene un EXCLUDE que permite un solo consumidor final en toda la base.
-- Con varios tenants debe ser uno POR tenant.
do $$
begin
  if to_regclass('public.clientes') is not null then
    alter table public.clientes drop constraint if exists un_solo_consumidor_final;
    create unique index if not exists uq_clientes_consumidor_final_por_tenant
      on public.clientes (tenant_id)
      where es_consumidor_final;
  end if;
end;
$$;

commit;

-- ------------------------------------------------------------ Comprobar -----
-- Debe devolver una fila por tabla, todas con rls = true.
--
-- select c.relname as tabla, c.relrowsecurity as rls
-- from pg_class c join pg_namespace n on n.oid = c.relnamespace
-- where n.nspname = 'public'
--   and c.relname in ('pedidos','lineas_pedido','productos','clientes','proveedores',
--                     'compras','abonos','abonos_compra','comisiones','gastos','balances',
--                     'vendedores','categorias','tipos','tamanos','precios_pactados',
--                     'historial_precios')
-- order by 1;
