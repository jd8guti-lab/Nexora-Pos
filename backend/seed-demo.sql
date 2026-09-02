-- =============================================================================
-- Datos de prueba para ver el dashboard del portal con números.
--
-- REQUISITO: correr antes `backend/migracion-tenant-negocio.sql`, que es el que crea
-- la columna `tenant_id` que este archivo rellena.
--
-- NO son datos reales de ningún cliente. Es un seed para verificación manual, y por eso
-- todo lo que inserta lleva el prefijo DEMO en el consecutivo o en el nombre: se puede
-- localizar y borrar. Al final del archivo está el bloque de limpieza.
--
-- CÓMO CORRERLO
--   1. Cambia el slug del tenant destino, igual que en la migración.
--   2. Pégalo en el SQL Editor de Supabase.
--   3. Abre /portal, entra con el usuario de ese tenant y compara.
-- =============================================================================

begin;

create temporary table _tenant_demo on commit drop as
select id from public.tenants where slug = 'las-dos-palmas';

do $$
begin
  if not exists (select 1 from _tenant_demo) then
    raise exception 'No existe el tenant destino. Créalo antes con scripts/crear-tenant.mjs.';
  end if;
end;
$$;

-- ------------------------------------------------------------- Catálogo -----
insert into public.tipos (tenant_id, nombre, orden)
select t.id, v.nombre, v.orden
from _tenant_demo t, (values ('DEMO Capira', 1), ('DEMO Parda', 2)) as v(nombre, orden)
on conflict do nothing;

insert into public.categorias (tenant_id, nombre, orden)
select t.id, 'DEMO General', 1 from _tenant_demo t
on conflict do nothing;

insert into public.productos (
  tenant_id, sku, nombre, tipo_id, estado, categoria_id,
  presentacion_venta_default, presentaciones_habilitadas,
  precio_cliente_bulto, precio_cliente_kilo_manual, activo
)
select
  t.id,
  v.sku,
  v.nombre,
  (select tp.id from public.tipos tp where tp.tenant_id = t.id and tp.nombre = 'DEMO Capira'),
  'SUCIA',
  (select c.id from public.categorias c where c.tenant_id = t.id and c.nombre = 'DEMO General'),
  'BULTO',
  '{BULTO,KILO}',
  v.precio_bulto,
  v.precio_kilo,
  true
from _tenant_demo t, (values
  ('DEMO-001', 'DEMO Papa Capira Cero',     140000, 3000),
  ('DEMO-002', 'DEMO Papa Capira Pollera',  120000, 2600),
  ('DEMO-003', 'DEMO Papa Parda Comercial',  95000, 2100)
) as v(sku, nombre, precio_bulto, precio_kilo)
on conflict do nothing;

-- ------------------------------------------------------------- Clientes -----
insert into public.clientes (tenant_id, nombre_empresa, telefono_principal, ciudad, tipo)
select t.id, v.nombre, v.telefono, 'Cali', v.tipo
from _tenant_demo t, (values
  ('DEMO Restaurante La Esquina', '3001112233', 'RESTAURANTE'),
  ('DEMO Tienda Doña Marta',      '3004445566', 'MINORISTA'),
  ('DEMO Distribuidora del Valle','3007778899', 'MAYORISTA')
) as v(nombre, telefono, tipo)
on conflict do nothing;

-- -------------------------------------------------------------- Pedidos -----
-- Dos de hoy (uno pagado, uno por entregar con saldo) y uno viejo con saldo, que es el
-- que debe aparecer en "Cartera vencida" por pasar de 30 días.
insert into public.pedidos (
  tenant_id, numero_ticket, fecha, cliente_id, cliente_snapshot,
  subtotal, total, estado, estado_pago, saldo_pendiente, atendio
)
select
  t.id,
  v.ticket,
  v.fecha,
  c.id,
  jsonb_build_object('nombre_mostrar', c.nombre_empresa, 'telefono_principal', c.telefono_principal),
  v.total,
  v.total,
  v.estado,
  v.estado_pago,
  v.saldo,
  'DEMO'
from _tenant_demo t
cross join (values
  ('DEMO-2026-0001', now() - interval '3 hours', 'DEMO Restaurante La Esquina',  560000, 'ENTREGADO', 'PAGADO',    0),
  ('DEMO-2026-0002', now() - interval '1 hour',  'DEMO Tienda Doña Marta',        240000, 'GENERADO',  'ABONADO',   90000),
  ('DEMO-2026-0003', now() - interval '45 days', 'DEMO Distribuidora del Valle', 1400000, 'ENTREGADO', 'PENDIENTE', 1400000)
) as v(ticket, fecha, cliente, total, estado, estado_pago, saldo)
join public.clientes c on c.tenant_id = t.id and c.nombre_empresa = v.cliente
on conflict do nothing;

insert into public.lineas_pedido (
  tenant_id, pedido_id, producto_id, nombre_producto_snapshot,
  cantidad, presentacion, kg, precio_aplicado, kg_por_bulto_snapshot, subtotal, orden
)
select
  t.id, p.id, pr.id, pr.nombre,
  v.cantidad, 'BULTO', v.cantidad * 50, pr.precio_cliente_bulto, 50,
  v.cantidad * pr.precio_cliente_bulto, 0
from _tenant_demo t
cross join (values
  ('DEMO-2026-0001', 'DEMO-001', 4),
  ('DEMO-2026-0002', 'DEMO-002', 2),
  ('DEMO-2026-0003', 'DEMO-003', 14)
) as v(ticket, sku, cantidad)
join public.pedidos p   on p.tenant_id  = t.id and p.numero_ticket = v.ticket
join public.productos pr on pr.tenant_id = t.id and pr.sku          = v.sku
on conflict do nothing;

-- Lo cobrado hoy: el pedido pagado completo más el abono parcial del segundo.
insert into public.abonos (tenant_id, pedido_id, fecha, valor, metodo, registrado_por)
select t.id, p.id, now() - interval '2 hours', v.valor, 'EFECTIVO', 'DEMO'
from _tenant_demo t
cross join (values
  ('DEMO-2026-0001', 560000),
  ('DEMO-2026-0002', 150000)
) as v(ticket, valor)
join public.pedidos p on p.tenant_id = t.id and p.numero_ticket = v.ticket
on conflict do nothing;

commit;

-- ------------------------------------------------------------- Limpieza -----
-- Para borrar el seed cuando entren los datos reales:
--
-- delete from public.abonos        where pedido_id in (select id from public.pedidos where numero_ticket like 'DEMO-%');
-- delete from public.lineas_pedido where pedido_id in (select id from public.pedidos where numero_ticket like 'DEMO-%');
-- delete from public.pedidos       where numero_ticket like 'DEMO-%';
-- delete from public.clientes      where nombre_empresa like 'DEMO %';
-- delete from public.productos     where sku like 'DEMO-%';
-- delete from public.categorias    where nombre like 'DEMO %';
-- delete from public.tipos         where nombre like 'DEMO %';
