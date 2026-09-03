-- =============================================================================
-- Registrar a Las dos palmas como empresa del portal · 3 de septiembre de 2026
--
-- COMO CORRERLO
--   Una sentencia por consulta en el SQL Editor de Supabase, en este orden. Antes de empezar,
--   corre `backend/auditar-esquema-tenant.sql` (ya apunta a `palmas`): si el esquema todavia no
--   existe, primero va `docs/esquema-supabase.sql` del repositorio de Las-dos-palmas, y despues
--   hay que EXPONER el esquema en Settings -> API, que es el paso que mas se olvida.
--
-- LO QUE FALTA RELLENAR
--   Dos datos reales, marcados con TODO(guti). No los invento: un NIT equivocado sale impreso en
--   la factura de un negocio real.
-- =============================================================================


-- 1 ─────────────────────────────────────────────────────────── La empresa ───
-- El slug es la carpeta bajo /portal/ y es lo que compara el middleware. No se reutiliza nunca.

insert into public.tenants (slug, nombre, nit)
values ('las-dos-palmas', 'Las dos palmas', 'TODO(guti): el NIT real');


-- 2 ──────────────────────────────────────────────────── NO insertes config ───
--
-- ⚠️ Aqui NO va un `insert into palmas.configuracion`, y no es un olvido.
--
-- `sembrarSiEstaVacia()` (src/core/casos-uso/sistema.ts de esa app) siembra el catalogo la primera
-- vez SOLO si no hay configuracion: esa fila es la marca de "esta base ya se uso". Si se inserta a
-- mano, la aplicacion entra, lee la marca, no siembra nada y el dueño ve el portal VACIO.
--
-- Eso es literalmente lo que paso con Papas El Labrador el 2026-09-02, y costo media sesion
-- buscarlo en la conexion cuando el problema estaba en esta fila.
--
-- La siembra ya trae lo que hace falta: prefijo `LDP-` (src/core/seed/catalogo.ts) y consecutivo
-- en 0, distintos de los de El Labrador. Los datos del negocio —NIT, telefono, direccion— los
-- llena el dueño en Ajustes, y de ahi salen impresos en su ticket.


-- 3 ────────────────────────────────────────────────── El usuario del portal ───
-- El usuario se crea en el panel: Authentication -> Users -> Add user, con correo y contraseña.
-- `scripts/crear-usuario-portal.mjs` haria esto solo, pero necesita la service_role, que esta
-- rotada.
--
-- Esta sentencia es la que le dice a que empresa pertenece. Va en `app_metadata`
-- (`raw_app_meta_data`), NUNCA en `user_metadata`: eso ultimo lo edita el propio usuario desde el
-- navegador, y podria reasignarse a otra empresa y leer sus datos.

update auth.users u
   set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
     || jsonb_build_object('tenant_id', t.id::text, 'tenant_slug', t.slug)
  from public.tenants t
 where t.slug = 'las-dos-palmas'
   and u.email = 'TODO(guti): el correo del dueño';

-- El usuario tiene que CERRAR SESION y volver a entrar despues de esto: el tenant viaja dentro del
-- JWT, y el que ya tenga en el navegador se emitio sin estos campos.


-- 4 ─────────────────────────────────────────────────────────── Comprobar ────
-- Tiene que devolver una fila con el slug y el id de la empresa.
--
-- select u.email,
--        u.raw_app_meta_data ->> 'tenant_slug' as slug,
--        u.raw_app_meta_data ->> 'tenant_id'   as tenant_id
--   from auth.users u
--  where u.raw_app_meta_data ->> 'tenant_slug' = 'las-dos-palmas';
