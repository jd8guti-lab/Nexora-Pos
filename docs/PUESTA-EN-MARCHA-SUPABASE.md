# Puesta en marcha de Supabase

Los pasos para dejar el portal funcionando con datos reales. Se hacen **una vez** para el proyecto,
y después un bloque corto por cada empresa cliente nueva.

Está escrito para hacerse de arriba abajo. Si algo falla a mitad, no sigas: casi todo lo de aquí
toca datos de un negocio que factura.

> **Qué se pudo verificar y qué no.** El esquema, las políticas RLS, las funciones de escritura y
> el aislamiento entre empresas están probados contra un Postgres real (`npm run test` en el repo
> de Papas El Labrador levanta uno y corre el SQL entero). Lo que **no** se ha podido probar sin un
> proyecto de Supabase de verdad es: Supabase Auth, Realtime, y que PostgREST acepte las consultas
> con tablas embebidas. Eso es lo que hay que mirar con atención en el paso 7.

---

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

## 1. Correr el esquema

En el panel de Supabase, **SQL Editor**, pega y ejecuta el contenido de:

```
Papas el Labrador/docs/esquema-supabase.sql
```

Crea las 18 tablas del negocio, la tabla `tenants`, las políticas RLS, las funciones de escritura
y la publicación de Realtime.

**Si la última sentencia falla** (`alter publication supabase_realtime add table ...`), es porque
alguna de esas tablas ya estaba publicada. Quita de la lista las que ya estén y vuelve a correr
solo esa sentencia; el resto ya quedó.

Para comprobar que quedó bien, en el SQL Editor:

```sql
select count(*) from pg_policy;                    -- debe haber al menos 19
select count(*) from pg_class where relnamespace = 'public'::regnamespace
  and relkind = 'r' and not relrowsecurity;        -- TIENE que dar 0
```

Ese segundo número es el importante: **una sola tabla sin RLS es una fuga de datos de una empresa a
otra.**

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
  '{"prefijoTicket":"JOS-LL-","consecutivoActual":38326,"anchoPapelMm":80}'::jsonb
from tenants where slug = 'papas-el-labrador';
```

> **El `consecutivoActual` importa.** Es el número de la última factura que el negocio ya imprimió
> con XUMA-POS. Si lo pones más bajo, se repiten números de factura ya entregados. Confírmalo con
> el dueño antes de correr esto.

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

## 8. Empresas siguientes

Para el próximo cliente, solo los pasos 2, 3, 4 y 6, con su propio slug. El esquema y las
políticas ya están.

---

## Lo que este montaje NO hace

Conviene decirlo antes de entregar, no después:

- **Sin internet no se factura.** Al pasar de IndexedDB a Supabase, la app dejó de funcionar sin
  conexión, y el propio código del negocio anota que en la bodega se cae la señal. Fue una decisión
  consciente para poder entregar. Si el negocio se para un día por esto, la solución es
  offline-first con sincronización, no un parche.
- **Un solo usuario por empresa.** Por decisión del dueño de El Labrador, dentro de la app no hay
  roles ni perfiles: quien entra ve todo. Quién registró cada documento se guarda como texto.
- **No hay "olvidé mi contraseña".** Se cambia corriendo otra vez el script del paso 3.
- **No hay límite de intentos de login.** Lo trae Supabase por su cuenta hasta cierto punto; si
  hace falta más, se configura en el panel.
