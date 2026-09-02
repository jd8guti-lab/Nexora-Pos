# Puesta en marcha de Supabase

Los pasos para dejar el portal funcionando con datos reales. Se hacen **una vez** para el proyecto,
y después un bloque corto por cada empresa o usuario nuevo (§8).

Está escrito para hacerse de arriba abajo. Si algo falla a mitad, no sigas: casi todo lo de aquí
toca datos de un negocio que factura.

---

## Dónde está todo

Son **dos repositorios**, y hay que clonar los dos:

| Repositorio | Qué es | Rama con este trabajo |
|---|---|---|
| [`jd8guti-lab/Nexora-Pos`](https://github.com/jd8guti-lab/Nexora-Pos) | El sitio público y **el portal**: login, middleware y los scripts | `feat/portal-clientes` |
| [`jd8guti-lab/Papas-el-Labrador`](https://github.com/jd8guti-lab/Papas-el-Labrador) | La aplicación del cliente y **el esquema SQL** | `feat/supabase-multi-tenant` |

**Ninguna de las dos está fusionada a `main` todavía.** Se dejaron en rama a propósito: hasta que
los pasos de este documento estén hechos y verificados, `main` sigue teniendo la versión anterior,
que funciona.

Archivos que vas a tocar:

| Archivo | Repo | Para qué |
|---|---|---|
| `docs/esquema-supabase.sql` | Papas | El SQL completo. Paso 1 |
| `scripts/crear-usuario-portal.mjs` | Nexora | Crea usuarios. Paso 3 |
| `scripts/sync-tenant-app.mjs` | Nexora | Construye y trae la app del cliente. Paso 6 |
| `.env.example` | Nexora | La plantilla de variables. Paso 5 |

## Qué está hecho y qué no

**Hecho, y probado contra un Postgres real** (el `npm run test` de CADA repositorio de cliente
levanta uno con PGlite y corre su esquema entero — no hace falta Docker):

- **Dos empresas listas**: Papas El Labrador (esquema `labrador`, 18 tablas) y Las dos palmas
  (esquema `palmas`, 19 tablas), cada una con `tenant_id` y RLS. `public` guarda solo lo compartido:
  `tenants` y `auth_tenant_id()`.
- El aislamiento entre empresas: que una no lea ni escriba los datos de otra, y que **ninguna tabla
  quede sin RLS** en ninguno de los tres esquemas.
- Las escrituras atómicas (`aplicar_lote`, `registrar_pedido`) y el consecutivo de factura, que
  **nunca repite un número**.
- El adaptador de Supabase de las DOS aplicaciones.
- El portal: login, resolución de tenant en el middleware, y que sin sesión no baje ni el
  JavaScript de la app.

**Falta, y es lo que hace este documento:** conectar un proyecto de Supabase real, crear el
usuario, sembrar los datos y desplegar.

**No se pudo probar sin ese proyecto**, así que hay que mirarlo con atención en el paso 7:
Supabase Auth de verdad, Realtime, que PostgREST acepte las consultas con tablas embebidas, y que
los esquemas queden **expuestos** en Settings → API.

**Dos cosas que quedaron a medias a propósito, y conviene saberlas antes de entregar:**

1. **Dentro de una empresa no hay roles.** RLS separa empresas, no personas. En Las dos palmas eso
   significa que el PIN que separa "facturación" de "administración" **sigue sin ser seguridad**:
   esconde el menú, no los datos. Cerrarlo es trabajo aparte y está detallado en su
   `src/core/adapters/supabase/README.md`.
2. **El consecutivo puede dejar un HUECO en Las dos palmas.** Nunca un duplicado —eso lo garantiza
   la base—, pero reservar el número y escribir el pedido son dos llamadas HTTP. En Papas El
   Labrador no pasa: ahí el pedido se escribe con `registrar_pedido`, que hace las dos cosas en la
   misma transacción.

## Antes de empezar

Necesitas, del proyecto de Supabase (**Settings → API**):

| Dato | Dónde va | ¿Es secreto? |
|---|---|---|
| **URL del proyecto** | `.env.local` y Vercel | No |
| **anon / public key** | `.env.local` y Vercel | **No.** Viaja dentro del JavaScript que baja el navegador. Lo que protege los datos es RLS. |
| **service_role key** | Solo en tu terminal, en los pasos 3 y 4 | **Sí, y mucho.** Se salta TODAS las políticas RLS: con ella se leen y se borran los datos de todas las empresas. |

**La `service_role` no va en ningún archivo del repositorio, ni en Vercel, ni en una variable que
empiece por `NEXT_PUBLIC_` o `VITE_`** — todo lo que empieza así termina dentro del bundle que se
le entrega al cliente. Tampoco se la pases a nadie por chat. Si se filtra, se rota desde
Settings → API → Reset.

---

## 1. Correr los esquemas

### Un esquema de Postgres por aplicación

Antes de pegar nada, entiende el reparto, porque decide todo lo demás:

| Esquema | Qué vive ahí |
|---|---|
| `public` | Lo COMPARTIDO por la plataforma: la tabla `tenants` y la función `auth_tenant_id()` |
| `labrador` | Las 18 tablas de Papas El Labrador |
| `palmas` | Las 19 tablas de Las dos palmas |

**Por qué no están todas en `public`:** las dos aplicaciones definen `productos` y `pedidos` con
columnas distintas —papa contra queso— y dos tablas con el mismo nombre no caben en un esquema.

**Y por qué no un proyecto de Supabase por empresa:** la app del cliente **reutiliza la sesión en
cookies que abre el portal**. El login y los datos tienen que estar en el mismo proyecto; separarlos
significaría un login aparte y otra contraseña para cada cliente.

### Pegar y ejecutar

En el panel de Supabase, **SQL Editor**, el contenido de cada archivo, entero y de una vez:

```
Papas el Labrador/docs/esquema-supabase.sql     -> crea `public.tenants` y el esquema `labrador`
Las dos palmas/docs/esquema-supabase.sql        -> crea el esquema `palmas`
```

El orden no importa: los dos crean `public.tenants` con `if not exists`, así que el segundo no pisa
lo del primero.

Cada uno crea sus tablas, sus políticas RLS, sus permisos, las funciones de escritura y la
publicación de Realtime.

**Si la última sentencia falla** (`alter publication supabase_realtime add table ...`), es porque
alguna de esas tablas ya estaba publicada. Quita de la lista las que ya estén y vuelve a correr solo
esa sentencia; el resto ya quedó.

### Exponer los esquemas — el paso que más se olvida

**Settings → API → *Exposed schemas*: agrega `labrador` y `palmas`.**

Supabase solo expone `public` por defecto. Sin este paso PostgREST devuelve **404 en todas las
consultas** y parece que la aplicación está rota, cuando lo único que pasa es que no sabe que ese
esquema existe.

### Comprobar que quedó bien

```sql
select count(*) from pg_policy;                    -- debe haber al menos 38 (19 + 20)
select ns.nspname, c.relname
  from pg_class c join pg_namespace ns on ns.oid = c.relnamespace
 where ns.nspname in ('public', 'labrador', 'palmas')
   and c.relkind = 'r' and not c.relrowsecurity;   -- TIENE que dar 0 filas
```

Esa segunda consulta es la importante: **una sola tabla sin RLS es una fuga de datos de una empresa
a otra.** Vuelve a correrla después de cada tabla nueva.

> Los dos repositorios ya la corren solos en cada `npm run test`, contra un Postgres real en WASM
> (PGlite). Si tocas un `esquema-supabase.sql`, ese test te dice si lo rompiste **antes** de llegar
> aquí.

## 2. Registrar la empresa

Una fila por empresa cliente. Para El Labrador:

```sql
insert into tenants (slug, nombre, nit)
values ('papas-el-labrador', 'Papas El Labrador', '16645676-5');
```

El `slug` es lo que aparece en la URL (`/portal/papas-el-labrador`) y el nombre de la carpeta
dentro de `public/portal/`. Usa minúsculas, números y guiones.

Y su configuración de facturación, que es de donde sale el consecutivo del ticket:

```sql
insert into configuracion (tenant_id, negocio, facturacion)
select id,
  '{"nombre":"El Labrador","propietario":"Jose Moreno","nit":"16645676-5",
    "telefono":"3164164263","direccion":"CRA. 29 # 19-62","ciudad":"Cali - Santa Elena"}'::jsonb,
  '{"prefijoTicket":"JOS-LL-","consecutivoActual":0,"anchoPapelMm":80}'::jsonb
from tenants where slug = 'papas-el-labrador';
```

### Sobre el `consecutivoActual`

Es el número de la factura. Cada ticket que el negocio imprime lleva uno que sube de uno en uno:
`JOS-LL-000001`, luego `JOS-LL-000002`. El `prefijoTicket` es la parte fija y el
`consecutivoActual` es el último emitido — o sea, **la próxima factura será ese número más uno**.

**Arranca en 0 por decisión del dueño de nexora-pos (30 de agosto de 2026):** el negocio estrena
sistema y empieza la cuenta limpia, no continúa la serie de XUMA-POS —el software que usaban
antes—, que iba por 38326.

> **El prefijo se queda como está: `JOS-LL-`, el mismo de XUMA-POS.** Se planteó cambiarlo y el
> dueño decidió dejarlo (30 de agosto de 2026). **No lo cambies por tu cuenta.**
>
> La consecuencia, para que nadie se sorprenda: los primeros tickets del sistema nuevo repiten
> números que XUMA-POS ya emitió hace años. Para la operación diaria no molesta; solo se notaría
> cruzando facturas viejas con nuevas —un contador revisando años atrás, por ejemplo.
>
> Si algún día se decide separarlas, es cambiar el prefijo en dos sitios: aquí y en
> `construirConfiguracion()` de `src/core/seed/catalogo.ts`. Los dos tienen que coincidir.

## 3. Crear el usuario

Desde el repo de nexora-pos, con la `service_role` **solo en esa línea de comando**:

```bash
SUPABASE_URL=https://TU-PROYECTO.supabase.co SUPABASE_SERVICE_ROLE_KEY=LA-LLAVE node scripts/crear-usuario-portal.mjs papasellabrador@user.com papas-el-labrador
```

Te pide la contraseña por teclado (no por argumento, para que no quede en el historial del shell).

El script pone la empresa en el **`app_metadata`** del usuario. Esto no es un detalle: si estuviera
en `user_metadata`, el propio cliente podría editarlo desde el navegador, reasignarse a otra
empresa y leer sus datos. `app_metadata` solo se escribe con la `service_role`.

El mismo comando sirve para **cambiar la contraseña** más adelante: si el usuario ya existe, lo
actualiza.

## 4. Sembrar los datos reales

El catálogo real de la empresa —sus clientes, productos y proveedores— está en
`src/core/seed/datos-reales.ts` del repo de Papas El Labrador.

La forma más segura de subirlo, porque no depende de la sesión ni de RLS:

1. Abre la app con la base local (`npm run dev` en el repo de Papas).
2. Deja que siembre el catálogo real y verifica en pantalla que está completo.
3. **Ajustes → Exportar respaldo**. Te deja un JSON.
4. Entra al portal ya publicado con el usuario del paso 3 y usa **Ajustes → Restaurar respaldo**.

Así los datos entran por el mismo camino que usará el negocio a diario, con RLS activo y el
`tenant_id` puesto por la base. Si algo del mapeo estuviera mal, se ve aquí y no con el cliente
facturando.

## 5. Variables de entorno

**En `.env.local` del repo de nexora-pos** (cópialo de `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=la-anon-key
```

**En Vercel**, las mismas dos, para Production y Preview.

**En el repo de Papas El Labrador**, un `.env.local` con:

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=la-anon-key
```

## 6. Construir y traer la app del cliente

Desde el repo de nexora-pos:

```bash
node scripts/sync-tenant-app.mjs papas-el-labrador "C:/Users/VICTUS/projects/Papas el Labrador"
```

Construye la app con la ruta base correcta y con `VITE_PERSISTENCIA=supabase`, y copia el
resultado a `public/portal/papas-el-labrador/`.

**El paso 5 tiene que estar hecho antes.** Vite incrusta las variables `VITE_*` dentro del bundle
al construir: lo que no esté presente en ese momento no existe después, por más que se configure
Vercel. El script lo comprueba y se niega a construir sin configuración, precisamente para que no
se despliegue una app que arranca y falla al primer clic.

**Esa carpeta se commitea.** Es lo que despliega Vercel; sin ella el portal sirve un 404.

Cada vez que cambie algo en la app del cliente, se vuelve a correr este comando y se commitea.

## 7. Verificar — la parte que no se pudo automatizar

Con el portal desplegado, y **antes** de entregárselo al negocio:

1. **La puerta.** Sin sesión, abre `/portal/papas-el-labrador/pedidos`: tiene que mandarte al
   login. Abre también un `.js` de `/portal/papas-el-labrador/assets/`: tampoco debe bajar.
2. **Entrar.** Con `papasellabrador@user.com` debe llevarte directo a la app.
3. **Recargar adentro.** Estando en `/portal/papas-el-labrador/pedidos`, recarga con F5. Tiene que
   seguir ahí, no volver al inicio.
4. **Que PostgREST responda.** Abre Clientes, Productos, Pedidos y Reportes. Si algo sale vacío
   estando la base con datos, mira la consola: casi siempre es RLS o un `select` con tabla
   embebida.
5. **El consecutivo.** Registra un pedido y confirma el número del ticket. Después abre dos
   pestañas y registra un pedido en cada una casi al tiempo: **no pueden llevarse el mismo
   número**, y no puede quedar un hueco.
6. **La atomicidad.** Con las herramientas del navegador, corta la red a mitad de registrar un
   pedido. Tiene que fallar **completo**: ni pedido escrito sin su cobro, ni consecutivo avanzado.
7. **Realtime.** Abre la app en dos equipos distintos. Registra un pedido en uno; en el otro debe
   aparecer solo, sin recargar, en menos de un segundo.
8. **El aislamiento.** Crea un segundo tenant de prueba con su usuario, entra con él y confirma que
   no ve ni un dato del primero. Prueba también a escribir a mano la URL de la otra empresa: debe
   rebotarte a la tuya.
9. **La factura.** Imprime una y cuádrala contra `docs/PRUEBA-ACEPTACION.md` del repo de Papas.

## 8. Agregar un perfil nuevo

"Perfil nuevo" puede ser dos cosas muy distintas. **Los dos casos ya funcionan sin tocar código**,
pero el camino no es el mismo.

### 8.a — Otro USUARIO de la misma empresa

Por ejemplo: el dueño y su hija, los dos entrando a El Labrador. Es solo correr el script del paso
3 otra vez con otro correo y el **mismo slug**:

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/crear-usuario-portal.mjs hija@empresa.com papas-el-labrador
```

No hay nada más que hacer: no se toca el esquema, ni se construye nada, ni se despliega.

**Lo que hay que saber antes de ofrecerlo:** dentro de la aplicación **no hay roles**. Los dos
usuarios ven exactamente lo mismo —las ganancias, las deudas, todo— y los dos pueden borrar. Fue
decisión del dueño de El Labrador (un solo perfil), y el sistema no simula nada intermedio. Si
alguna vez hacen falta permisos por persona, hay que reintroducir la entidad completa (`usuarios`,
`auth_id`, políticas por rol); no quedó nada a medias esperando.

Lo único que sí distingue a las personas es el texto de "Atendió" en la factura y el campo
`registrado_por` de cada documento, que se escriben a mano.

### 8.b — Otra EMPRESA cliente

Por ejemplo: subir un segundo negocio a la plataforma, al lado de El Labrador. Tiene su propia
aplicación, su propia base de datos aislada y su propia URL.

**Si esa empresa usa la misma aplicación que El Labrador** (es decir, otro comercializador de papa
con el mismo sistema), son cuatro pasos:

1. **Paso 2** con su slug, nombre y NIT, más su fila de `configuracion` (¡su propio prefijo y
   consecutivo de factura!).
2. **Paso 3** para crear su usuario, con ese slug.
3. **Paso 6** para construir y copiar su aplicación:
   ```bash
   node scripts/sync-tenant-app.mjs el-slug-nuevo "ruta/al/proyecto"
   ```
   Queda en `public/portal/el-slug-nuevo/`. Se commitea.
4. Desplegar.

El esquema, las políticas RLS y el middleware ya sirven a cualquier número de empresas: no hay que
tocarlos. El aislamiento se prueba solo con que existan dos.

**Si esa empresa usa una aplicación DISTINTA** (otro giro de negocio, otro proyecto), es lo mismo:
el portal no sabe ni le importa qué hay dentro de `public/portal/<slug>/`. Lo único que ese
proyecto tiene que cumplir, sea cual sea su stack:

| Requisito | Por qué |
|---|---|
| Construir con la ruta base `/portal/<slug>/` | Si no, sus assets dan 404 |
| Que su router use esa misma base | Si no, recargar en una ruta interna manda al inicio |
| Dejar un `index.html` en la raíz de su build | Es a donde el middleware reescribe las rutas |

Si además guarda datos en el mismo Supabase, sus tablas necesitan `tenant_id` y RLS con el mismo
patrón del esquema actual. **Si crea tablas sin RLS, esa empresa expone sus datos a las demás** —
la comprobación del paso 1 (`... and not relrowsecurity` tiene que dar 0) hay que volver a
correrla después de cada tabla nueva.

### La segunda empresa ya está escogida: Las dos palmas

Comercializadora de quesos. Repo propio: **`jd8guti-lab/Las-dos-palmas`**, rama
`feat/portal-y-factura`. Es la misma plataforma que El Labrador con otro giro de negocio —compras a
la planta, inventario con mermas, transformaciones—, así que le aplica el caso "misma aplicación"
de arriba.

**Lo que ya está hecho** (31 de agosto de 2026), para que no se rehaga:

- Su aplicación **ya sabe vivir bajo un subcamino**: `vite.config.ts` lee `VITE_BASE` y el router
  toma su `basename` de `import.meta.env.BASE_URL`. Verificado sirviendo el build bajo
  `/portal/las-dos-palmas/`: cero 404 y recargar en `/pedidos` abre Pedidos.
- Su factura tiene el mismo arreglo que la de El Labrador: impresión desde un documento aparte,
  ancho a cargo del driver, y el pie `www.nexora-pos.online`.

- **Su adaptador de Supabase ya está escrito** (31 de agosto de 2026): cliente, sesión, mapeo y los
  13 repositorios, más un esquema multi-tenant en el esquema `palmas` que **se ejecuta en cada
  `npm run test`** contra un Postgres real. Se enciende con `VITE_PERSISTENCIA=supabase`.

**Lo que le falta, y hay que decirlo claro:**

- **Los dos perfiles todavía no son seguridad.** RLS separa EMPRESAS, no personas: cualquier sesión
  de la empresa puede consultar la contabilidad aunque el menú se la esconda. Los tres pasos para
  cerrarlo están en el bloque de RLS de su SQL y en su `src/core/adapters/supabase/README.md`.
- **El consecutivo puede dejar un hueco.** `siguiente_numero_ticket()` es atómica y nunca repite un
  número, pero reservar y escribir el pedido son dos llamadas HTTP: si la segunda falla, queda un
  número sin usar. Cerrarlo pide un `registrarConTicket()` en su contrato que llame a la RPC
  `registrar_pedido`, **que ya está escrita**.
- **"Vaciar base" ya no vacía todo**: el kardex y los documentos tienen DELETE revocado y se quedan.
  Conviene avisarlo en Ajustes antes de que alguien lo descubra apretando el botón.

Sus datos para los pasos 2 y 3, cuando llegue el momento:

```sql
insert into tenants (slug, nombre, nit)
values ('las-dos-palmas', 'Las dos palmas', 'TODO(guti): el NIT real');
```

```sql
insert into configuracion (tenant_id, negocio, facturacion)
select id,
  '{"nombre":"Las dos palmas","propietario":"","nit":"","telefono":"","direccion":"","ciudad":""}'::jsonb,
  '{"prefijoTicket":"LDP-","consecutivoActual":0,"anchoPapelMm":80}'::jsonb
from tenants where slug = 'las-dos-palmas';
```

**El prefijo es `LDP-` y el consecutivo arranca en 0**, distintos de los de El Labrador. No es un
detalle de estilo: dos empresas con el mismo prefijo y el mismo número emitirían facturas
duplicadas. Los datos del negocio van vacíos a propósito — esa aplicación se entrega con ellos en
blanco para que el dueño los llene en Ajustes, y así salen impresos en su ticket.

---

### Lo que NO hay que hacer nunca

- **No reutilizar un slug.** Es la carpeta y es lo que compara el middleware.
- **No copiar la fila de `configuracion` de una empresa a otra sin cambiar el consecutivo.** Dos
  empresas con el mismo prefijo y el mismo número emitirían facturas duplicadas.
- **No poner el `tenant_id` en `user_metadata`.** El script lo pone en `app_metadata` por una razón:
  `user_metadata` lo puede editar el propio usuario desde el navegador, y podría reasignarse a otra
  empresa.

---

## Lo que este montaje NO hace

Conviene decirlo antes de entregar, no después:

- **Sin internet no se factura.** Al pasar de IndexedDB a Supabase, la app dejó de funcionar sin
  conexión, y el propio código del negocio anota que en la bodega se cae la señal. Fue una decisión
  consciente para poder entregar. Si el negocio se para un día por esto, la solución es
  offline-first con sincronización, no un parche.
- **No hay roles.** Se pueden crear los usuarios que se quieran para una empresa (§8.a), pero
  **todos ven y pueden hacer lo mismo**: las ganancias, las deudas, y borrar. Fue decisión del dueño
  de El Labrador. Quién registró cada documento se guarda como texto, no como usuario.
- **No hay "olvidé mi contraseña".** Se cambia corriendo otra vez el script del paso 3.
- **No hay límite de intentos de login.** Lo trae Supabase por su cuenta hasta cierto punto; si
  hace falta más, se configura en el panel.
