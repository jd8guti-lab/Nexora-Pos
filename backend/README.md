# `backend/` — el SQL de la plataforma

Aquí vive **solo** el SQL que es de nexora-pos, no de una empresa cliente. El de cada aplicación
vive en su propio repositorio, en su `docs/esquema-supabase.sql`, y el paso a paso está en
`docs/PUESTA-EN-MARCHA-SUPABASE.md`.

| Archivo | Qué es |
| --- | --- |
| `auditar-esquema-tenant.sql` | **Se corre.** Busca en un esquema la forma de los bugs conocidos. |
| `0-limpiar-public.sql` | Se corre **antes** de crear un esquema nuevo, si `public` trae restos. |
| `revertir-migracion-descartada.sql` | Alternativa conservadora al anterior. Es una **o** la otra. |
| `esquema-supabase.sql` | **OBSOLETO.** No lo ejecutes. Es el primer intento de multi-tenancy. |

## El auditor

Se corre **después de crear un esquema, después de tocarlo, y antes de dar una puesta en marcha por
buena**. Cambia dos listas al principio —el nombre del esquema y las tablas que la app vacía en su
`vaciarTodo()`— y pégalo en el SQL Editor. No escribe nada.

Cada comprobación sale de un bug que **ya ocurrió en producción** durante la puesta en marcha de
Papas El Labrador, el 2 y 3 de septiembre de 2026:

| Comprobación | El bug del que sale |
| --- | --- |
| `tenant_id` sin default | Guardar la configuración fallaba siempre: el navegador no manda ese valor, y sin default el INSERT llevaba un nulo. |
| Vaciar la base fallará | `historial_precios` impedía borrar `productos`, y como restaurar empieza vaciando, **restaurar un respaldo era imposible**. |
| RLS sin `force` · RLS sin política | Un `drop table` se lleva la RLS, la política y los permisos. La tabla queda abierta, o invisible para la app. |
| `anon` con permisos | Quien abre la app viene del login del portal. Sin sesión no se entra. |
| Solo-agregar: nunca `reemplazar` | El adaptador mandaba los abonos con `reemplazar`, que ejecuta su `delete` aunque el lote venga vacío. No dejaba anular un pedido ni restaurar. |
| Sin UPDATE | Un `on conflict do update` contra una tabla sin UPDATE falla. Mordió en los dos proyectos a la vez. |

**Está probado, no supuesto.** Se verificó contra el esquema `labrador` real cargado en PGlite,
reintroduciendo cada defecto uno por uno y comprobando que lo señala. Un auditor que nunca se ha
visto encontrar nada no sirve de nada.

### Lo que el auditor NO puede ver

Mira el **esquema**, no el código. El bug de los abonos —`reemplazar` contra una tabla con el
`delete` revocado— vivía en el adaptador, y ahí solo llega un test que ejecute sus operaciones
contra la base **con el rol `authenticated`**: los `revoke` van sobre ese rol, y el SQL Editor corre
como `postgres`, que se los salta. Eso es lo que dejó pasar los cuatro.

En Papas El Labrador ese test es `src/core/adapters/supabase/integracion.test.ts`. La comprobación
"solo-agregar" del auditor le deja a cualquier otra aplicación la lista exacta de tablas que revisar
en su adaptador.
