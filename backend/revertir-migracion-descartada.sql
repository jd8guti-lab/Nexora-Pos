-- =============================================================================
-- Revertir la migración descartada del PR #2 (cerrado sin fusionar).
--
-- QUÉ DESHACE
--   Aquel PR agregó al esquema `public`, sobre las tablas planas heredadas:
--     * la columna `tenant_id` en 17 tablas, NOT NULL y con default;
--     * un índice `idx_<tabla>_tenant_id` por tabla;
--     * una política `<tabla>_por_tenant` y RLS activada;
--     * la función `public.current_tenant_id()`;
--     * y reemplazó los UNIQUE globales por `(tenant_id, columna)`.
--
--   La arquitectura que quedó en `main` no usa nada de eso: cada aplicación tiene
--   su propio esquema (`labrador`, `palmas`) y su propia función `auth_tenant_id()`.
--
-- QUÉ NO TOCA
--   No borra ninguna fila. Las 17 tablas están vacías —comprobado con la
--   `service_role`— así que esto es puramente estructural.
--
-- CÓMO CORRERLO
--   Pégalo entero en el SQL Editor de Supabase. Es idempotente.
-- =============================================================================

begin;

-- ------------------------------------------- Políticas, índices y columna -----
do $$
declare
  tabla text;
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
      raise notice 'Se omite %: no existe.', tabla;
      continue;
    end if;

    execute format('drop policy if exists "%s_por_tenant" on public.%I', tabla, tabla);
    execute format('drop index if exists public.idx_%s_tenant_id', tabla);

    -- Al soltar la columna se van con ella su default, su FK y los índices que la usen.
    execute format('alter table public.%I drop column if exists tenant_id', tabla);
  end loop;
end;
$$;

-- --------------------------------------------------------------- Función -----
drop function if exists public.current_tenant_id();

-- ------------------------------------------- Restituir los UNIQUE de antes -----
-- La migración los había cambiado por (tenant_id, columna). Al no existir ya esa
-- columna, esos índices se fueron solos; hay que devolver los originales o estas
-- tablas se quedan sin la unicidad que su esquema declaraba.
do $$
declare
  par record;
begin
  for par in
    select * from (values
      ('productos',   'sku',           'productos_sku_key'),
      ('proveedores', 'nombre',        'proveedores_nombre_key'),
      ('pedidos',     'numero_ticket', 'pedidos_numero_ticket_key'),
      ('compras',     'consecutivo',   'compras_consecutivo_key'),
      ('tipos',       'nombre',        'tipos_nombre_key'),
      ('tamanos',     'nombre',        'tamanos_nombre_key'),
      ('categorias',  'nombre',        'categorias_nombre_key')
    ) as v(tabla, columna, restriccion)
  loop
    if to_regclass('public.' || par.tabla) is null then
      continue;
    end if;

    execute format('drop index if exists public.uq_%s_tenant_%s', par.tabla, par.columna);

    if not exists (
      select 1 from pg_constraint
      where conrelid = ('public.' || par.tabla)::regclass
        and conname = par.restriccion
    ) then
      execute format(
        'alter table public.%I add constraint %I unique (%I)',
        par.tabla, par.restriccion, par.columna
      );
    end if;
  end loop;
end;
$$;

-- El EXCLUDE de `clientes`: un solo consumidor final en toda la tabla, que es como
-- estaba antes de que la migración lo volviera uno por tenant.
do $$
begin
  if to_regclass('public.clientes') is not null then
    drop index if exists public.uq_clientes_consumidor_final_por_tenant;

    if not exists (
      select 1 from pg_constraint
      where conrelid = 'public.clientes'::regclass
        and conname = 'un_solo_consumidor_final'
    ) then
      alter table public.clientes
        add constraint un_solo_consumidor_final
        exclude (es_consumidor_final with =) where (es_consumidor_final);
    end if;
  end if;
end;
$$;

commit;

-- ------------------------------------------------------------------- RLS -----
-- A PROPÓSITO no se apaga la RLS que activó la migración.
--
-- Antes de aquel PR estas tablas NO tenían RLS: la anon key las leía enteras. Ahora
-- quedan con RLS activada y sin ninguna política, que en Postgres significa "nadie
-- lee, nadie escribe" salvo la `service_role`. Para unas tablas heredadas, vacías y
-- destinadas a desaparecer, eso es mejor que devolverlas a estar expuestas.
--
-- Si de verdad quieres el estado exacto de antes, descomenta:
--
-- do $$
-- declare
--   tabla text;
--   tablas text[] := array['tipos','tamanos','categorias','productos','historial_precios',
--                          'proveedores','compras','abonos_compra','clientes','precios_pactados',
--                          'vendedores','pedidos','lineas_pedido','abonos','comisiones',
--                          'gastos','balances'];
-- begin
--   foreach tabla in array tablas loop
--     if to_regclass('public.' || tabla) is not null then
--       execute format('alter table public.%I disable row level security', tabla);
--     end if;
--   end loop;
-- end;
-- $$;

-- ------------------------------------------------------------ Comprobar -----
-- Ninguna fila: ya no queda tenant_id en public.
--
-- select table_name from information_schema.columns
-- where table_schema = 'public' and column_name = 'tenant_id'
--   and table_name <> 'profiles';
--
-- Y la función tiene que haber desaparecido (404 al llamarla por PostgREST):
--
-- select proname from pg_proc where proname = 'current_tenant_id';
