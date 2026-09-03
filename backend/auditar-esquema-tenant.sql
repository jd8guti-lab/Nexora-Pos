-- =============================================================================
-- Auditor de esquemas de tenant
--
-- Busca en un esquema la FORMA de los bugs que costaron la puesta en marcha de Papas El Labrador.
-- Sirve para cualquier empresa —`labrador`, `palmas`, y las que vengan— y se corre después de crear
-- un esquema, después de tocarlo, y antes de dar una puesta en marcha por buena.
--
-- COMO CORRERLO
--   Cambia las DOS primeras listas (el esquema y las tablas que vacía la app) y pega todo en el SQL
--   Editor de Supabase. Es una sola sentencia a propósito: con varias, el editor solo enseña el
--   resultado de la última. No escribe nada — solo lee el catálogo.
--
-- POR QUE `has_table_privilege('authenticated', ...)` Y NO MIRARLO A OJO
--   Los `revoke` del esquema van sobre el rol `authenticated`, que es con el que entra la
--   aplicación. El SQL Editor corre como `postgres`, que se los salta. **Los bugs de esta familia se
--   escaparon justamente por eso**: se comprobaron con un rol privilegiado y todo parecía bien.
--
-- LO QUE BUSCA, Y DE DONDE SALE CADA COSA
--   1. `tenant_id` sin `default auth_tenant_id()`. El navegador no manda ese valor —ni debe—, así
--      que guardar la configuración fallaba SIEMPRE.
--   2. Vaciar la base fallará por una llave foránea. `importarTodo()` empieza vaciando, así que esto
--      deja **restaurar un respaldo imposible**. Le pasó a `historial_precios` → `productos`.
--   3. y 4. Un `drop table` se lleva por delante la RLS, la política y los permisos de esa tabla.
--   5. `anon` no entra a los datos de una empresa.
--   6. Las tablas de solo-agregar: el adaptador NUNCA puede mandarles `reemplazar`. Es la lista que
--      le faltaba a quien escribió los abonos, y por eso no se dejaba anular un pedido.
--   7. Las tablas sin UPDATE: contra ellas un `on conflict do update` falla.
-- =============================================================================

with esquema as (select 'palmas'::text as nombre),   -- <<< 1. CAMBIA AQUI EL ESQUEMA

-- <<< 2. Y AQUI, las tablas que la aplicación borra en su `vaciarTodo()`. Salen del adaptador, no
-- del esquema: son las que se limpian antes de restaurar un respaldo. Si esta lista no coincide con
-- la del código, la comprobación 2 no sirve.
--
-- Las dos listas conocidas están abajo: deja activa la de la empresa que estés auditando y comenta
-- la otra. Cada una sale del `vaciarTodo()` de su adaptador, no de la memoria de nadie.
borrables (t) as (values
  -- Las dos palmas (`palmas`) — su `repositorios.ts`, `vaciarTodo()`
  ('comisiones'), ('gastos'), ('precios_pactados'),
  ('productos'), ('vendedores'), ('clientes'), ('proveedores'), ('categorias')

  -- Papas El Labrador (`labrador`) — descomenta esta y comenta la de arriba
  -- ('comisiones'), ('balances'), ('gastos'), ('precios_pactados'),
  -- ('productos'), ('vendedores'), ('clientes'), ('proveedores'),
  -- ('categorias'), ('tamanos'), ('tipos')
),

tablas as (
  select c.oid, c.relname, c.relrowsecurity, c.relforcerowsecurity
    from pg_class c, esquema e
   where c.relnamespace = e.nombre::regnamespace
     and c.relkind = 'r'                              -- solo tablas: las vistas no llevan RLS ni default
)

-- 1 ── `tenant_id` sin su default ────────────────────────────────────────────
select 1 as gravedad,
       'tenant_id sin default' as hallazgo,
       t.relname || '.tenant_id' as objeto,
       'la app no lo manda: sin `default auth_tenant_id()` todo INSERT falla' as por_que
  from tablas t
  join pg_attribute a on a.attrelid = t.oid and a.attname = 'tenant_id' and a.attnum > 0
  left join pg_attrdef d on d.adrelid = t.oid and d.adnum = a.attnum
 where coalesce(pg_get_expr(d.adbin, d.adrelid), '') not like '%auth_tenant_id%'

union all

-- 2 ── Vaciar la base fallará ────────────────────────────────────────────────
-- Una tabla que la app NO vacía, apuntando SIN cascada a una que sí vacía. En cuanto la primera
-- tenga una fila, el `delete` de la segunda falla — y `importarTodo()` empieza vaciando, así que
-- restaurar un respaldo se vuelve imposible.
select 1,
       'vaciar la base fallará',
       hija.relname || ' → ' || padre.relname || ' (' || c.conname || ')',
       case
         when not has_table_privilege('authenticated', hija.oid, 'DELETE')
           then 'la hija ni siquiera se puede borrar antes: o le pones cascada, o vaciar es imposible'
         else 'la hija no está en la lista de vaciado: bórrala también, o ponle cascada'
       end
  from pg_constraint c
  join tablas hija on hija.oid = c.conrelid
  join tablas padre on padre.oid = c.confrelid
 where c.contype = 'f'
   and c.confdeltype in ('a', 'r')                    -- no action / restrict
   and padre.relname in (select t from borrables)
   and hija.relname not in (select t from borrables)

union all

-- 3 ── RLS apagada o sin forzar ──────────────────────────────────────────────
-- Sin `force`, el DUEÑO de la tabla se salta la política. Es lo que se olvida al recrear una tabla.
select 1,
       case when not t.relrowsecurity then 'sin RLS' else 'RLS sin `force`' end,
       t.relname,
       'con varias empresas en la misma base, la RLS es la única barrera entre sus datos'
  from tablas t
 where not t.relrowsecurity or not t.relforcerowsecurity

union all

-- 4 ── RLS encendida pero sin política ───────────────────────────────────────
-- Peor que ruidoso: es silencioso. Todo devuelve vacío y parece un problema del `select`.
select 1,
       'RLS sin política',
       t.relname,
       'todo devolverá vacío y parecerá un problema del `select`, no de permisos'
  from tablas t
 where t.relrowsecurity
   and not exists (select 1 from pg_policy p where p.polrelid = t.oid)

union all

-- 5 ── `anon` con permisos ───────────────────────────────────────────────────
select 1,
       'anon tiene permisos',
       t.relname || ': ' || p.privilegio,
       'sin sesión no se entra a los datos de una empresa: quien abre la app viene del portal'
  from tablas t
  cross join (values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE')) as p(privilegio)
 where has_table_privilege('anon', t.oid, p.privilegio)

union all

-- 6 ── Tablas de solo-agregar ────────────────────────────────────────────────
-- INFORMATIVO, y es la lista que le faltaba a quien escribió los abonos: el adaptador NUNCA puede
-- mandarles `reemplazar` en `aplicar_lote`, porque esa acción ejecuta su `delete` aunque el lote
-- venga con cero filas. Contra estas tablas la acción es `agregar`.
select 3,
       'solo-agregar: nunca `reemplazar`',
       t.relname,
       'tiene el DELETE revocado: `reemplazar` fallará aunque el lote venga vacío'
  from tablas t
 where not has_table_privilege('authenticated', t.oid, 'DELETE')

union all

-- 7 ── Tablas sin UPDATE ─────────────────────────────────────────────────────
-- INFORMATIVO. Un upsert con `on conflict do update` contra ellas falla. Ya mordió una vez, en los
-- dos proyectos a la vez (31 de agosto de 2026).
select 3,
       'sin UPDATE: `on conflict do update` fallará',
       t.relname,
       'contra estas tablas el upsert tiene que ser `do nothing`'
  from tablas t
 where not has_table_privilege('authenticated', t.oid, 'UPDATE')

order by gravedad, hallazgo, objeto;

-- ------------------------------------------------------------ Cómo se lee -----
--
--   gravedad 1  ARRÉGLALO. Cada uno corresponde a un bug que ya ocurrió en producción.
--   gravedad 3  Informativo: no es un fallo, es lo que el adaptador tiene que respetar.
--
-- La comprobación 2 tiene DOS lecturas, y hay que pensarla, no obedecerla:
--
--   * Si la hija es AUDITORÍA —un historial, un kardex—, ponle `on delete cascade`: un registro que
--     apunta a un producto que ya no existe no le sirve a nadie.
--   * Si la hija son DOCUMENTOS —pedidos, facturas, abonos—, la llave foránea está haciendo su
--     trabajo: protege las facturas de que alguien borre el cliente. Entonces lo correcto NO es la
--     cascada, sino que la aplicación impida vaciar y restaurar sobre una base que ya facturó, y
--     que lo diga con un mensaje de negocio en vez de un error de llave foránea.
--
-- Cero filas de gravedad 1 no quiere decir que la aplicación funcione: el bug de los abonos vivía
-- en el CÓDIGO del adaptador, y eso solo lo caza un test que ejecute sus operaciones contra la base
-- con el rol `authenticated`. En Papas El Labrador es
-- `src/core/adapters/supabase/integracion.test.ts`.
