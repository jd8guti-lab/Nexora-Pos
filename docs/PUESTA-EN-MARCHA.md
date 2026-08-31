# PUESTA EN MARCHA — CHECKLIST OPERATIVO

**Versión:** 2026-08-30  
**Estado:** Listos para conectar un proyecto Supabase real

---

## Antes de ejecutar

### Lo que tienes que traer de Supabase

| Dato | Variable de entorno | Sensible |
|---|---|---|
| URL del proyecto | `NEXT_PUBLIC_SUPABASE_URL` | No |
| Anon Key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No |
| Service Role Key | Solo en terminal, pasos 2 y 3 | **SÍ** |

### Lo que ya existe en este repo

- [x] Infraestructura de Nexora ya preparada (`Nexora-Pos`)
- [x] Portal de clientes preparado en la rama `portal-clientes`
- [x] Script de creación de tenant: `scripts/crear-tenant.mjs`
- [x] Script de creación de usuario: `scripts/crear-usuario-portal.mjs`
- [x] Script de validación del flujo: `scripts/validar-flujo-negocio.mjs`
- [x] Script de sincronización de app: `scripts/sync-tenant-app.mjs`
- [x] Schema SQL multi-tenant: `backend/esquema-supabase.sql`
- [x] Variables de entorno preparadas (`.env.example`)

---

## Los 8 pasos — checklist rápido

| # | Paso | Dónde | Estado | Comando o archivo |
|---|---|---|---|---|
| 1 | Crear schema SQL | Panel Supabase | ⏳ | `backend/esquema-supabase.sql` |
| 2 | Registrar tenant | Terminal | ⏳ | `node scripts/crear-tenant.mjs` |
| 3 | Crear usuario del portal | Terminal | ⏳ | `node scripts/crear-usuario-portal.mjs` |
| 4 | Validar schema y datos | Terminal | ⏳ | `node scripts/validar-flujo-negocio.mjs` |
| 5 | Variables de entorno | `.env.local` + Vercel | ⏳ | Ver `.env.example` |
| 6 | Construir y copiar app | Terminal | ⏳ | `node scripts/sync-tenant-app.mjs` |
| 7 | Verificar en producción | Navegador | ⏳ | Comprobaciones de negocio |
| 8 | Agregar otro usuario/empresa | Terminal o SQL | ⏳ | Scripts adicionales |

---

## Comandos concretos

### PASO 1 — Ejecutar el schema real en Supabase

En el SQL editor de Supabase, pega y ejecuta:

```sql
-- Ver archivo: backend/esquema-supabase.sql
```

### PASO 2 — Registrar un tenant

```bash
cd C:\Users\GHOSTBOY\OneDrive\Documentos\ProyectosINF\Nexora-Pos
SUPABASE_URL=https://TU-PROYECTO.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=LA-LLAVE-SUPER-SECRETA \
node scripts/crear-tenant.mjs papas-el-labrador "Papas el Labrador" papasellabrador@user.com
```

Esto crea el tenant, el perfil del administrador y la relación con el usuario del portal.

### PASO 3 — Crear o actualizar usuario del portal

```bash
cd C:\Users\GHOSTBOY\OneDrive\Documentos\ProyectosINF\Nexora-Pos
SUPABASE_URL=https://TU-PROYECTO.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=LA-LLAVE-SUPER-SECRETA \
node scripts/crear-usuario-portal.mjs papasellabrador@user.com papas-el-labrador
```

Pide la contraseña por teclado.

### PASO 4 — Validar el flujo de negocio real

```bash
cd C:\Users\GHOSTBOY\OneDrive\Documentos\ProyectosINF\Nexora-Pos
SUPABASE_URL=https://TU-PROYECTO.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=LA-LLAVE-SUPER-SECRETA \
node scripts/validar-flujo-negocio.mjs papas-el-labrador
```

### PASO 6 — Sincronizar app del cliente

```bash
cd C:\Users\GHOSTBOY\OneDrive\Documentos\ProyectosINF\Nexora-Pos
node scripts/sync-tenant-app.mjs papas-el-labrador "C:\Users\GHOSTBOY\OneDrive\Documentos\ProyectosINF\Papas-el-Labrador"
```

Luego commitea con:

```bash
git add public/portal/papas-el-labrador/
git commit -m "feat: sincronizar app del cliente para papas-el-labrador"
git push
```

---

## Variables de entorno

### En `.env.local` (Nexora)

Cópialo de `.env.example` y llena:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="ey......"
NEXT_PUBLIC_PORTAL_URL="/portal"
NEXT_PUBLIC_SITE_URL="https://nexora-pos.co"
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION="tu-token-si-tienes"
NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID="tu-cse-si-tienes"
```

### En Vercel (igual que arriba)

Añade estas dos como Secrets en **Settings → Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Para Preview y Production.

### En `.env.local` (Papas — solo si van a probar localmente)

```bash
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_ANON_KEY="ey......"
VITE_PERSISTENCIA="supabase"
```

---

## Carpetas clave

- `/app/(portal)` — El portal (middleware, login, etc.)
- `/public/portal/` — Aquí se copian las apps de los clientes
- `/scripts/` — Scripts de administración
- `/backend/esquema-supabase.sql` — Schema SQL multi-tenant real

---

## Para seguimiento

**Cuando ejecutes cada paso, marca aquí lo que hiciste:**

```
Paso 1 (schema SQL):     [ ] Ejecutado el 20XX-XX-XX
Paso 2 (tenant):         [ ] Ejecutado el 20XX-XX-XX
Paso 3 (usuario):        [ ] Ejecutado el 20XX-XX-XX
Paso 4 (flujo):          [ ] Ejecutado el 20XX-XX-XX
Paso 5 (env vars):       [ ] Ejecutado el 20XX-XX-XX
Paso 6 (sync app):       [ ] Ejecutado el 20XX-XX-XX
Paso 7 (verificar):      [ ] Ejecutado el 20XX-XX-XX
Paso 8 (usuarios extras):[ ] Ejecutado el 20XX-XX-XX
```

---

## Checklist real de producción

Antes de dar el sistema por listo: 

1. Ejecutar el schema SQL en Supabase.
2. Registrar el tenant real del negocio.
3. Crear el usuario administrador del portal.
4. Validar que el usuario vea solo su tenant.
5. Confirmar que la app cliente se sirve con el tenant correcto.
6. Probar login real, sesión y datos del negocio.
7. Confirmar permisos, roles y negocio operativo.

Eso es lo que convierte la infraestructura preparada en un negocio funcional.

---

**Creado:** 2026-08-30  
**Por:** Copilot (GitHub)  
**Para:** Jose y Daniel, nexora-pos
