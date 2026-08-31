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
| Service Role Key | Solo en terminal, paso 3 | **SÍ** |

### Lo que ya existe en este repo

- [x] Código del portal completo (`Nexora-Pos`)
- [x] Código de la app del cliente (rama `feat/supabase-multi-tenant` en Papas)
- [x] Esquema SQL multi-tenant (en Papas: `backend/esquema-supabase.sql`)
- [x] Script de creación de usuarios: `scripts/crear-usuario-portal.mjs`
- [x] Script de sincronización de app: `scripts/sync-tenant-app.mjs`
- [x] Variables de entorno preparadas (`.env.example`)

---

## Los 8 pasos — checklist rápido

| # | Paso | Dónde | Estado | Comando o archivo |
|---|---|---|---|---|
| 1 | Correr esquema SQL | Panel Supabase | ⏳ | Papas: `backend/esquema-supabase.sql` |
| 2 | Registrar empresa | SQL query | ⏳ | Paso 2 de la guía completa |
| 3 | Crear usuario | Terminal | ⏳ | `node scripts/crear-usuario-portal.mjs` |
| 4 | Sembrar datos | App local → Respaldo | ⏳ | Paso 4 de la guía completa |
| 5 | Variables de entorno | `.env.local` + Vercel | ⏳ | Ver `.env.example` |
| 6 | Construir y copiar app | Terminal | ⏳ | `node scripts/sync-tenant-app.mjs` |
| 7 | Verificar en producción | Navegador | ⏳ | 9 comprobaciones en la guía |
| 8 | Agregar otro usuario/empresa | Terminal o SQL | ⏳ | Opciones 8.a y 8.b |

---

## Comandos concretos

### PASO 3 — Crear usuario para El Labrador

```bash
cd C:\Users\GHOSTBOY\OneDrive\Documentos\ProyectosINF\Nexora-Pos
SUPABASE_URL=https://TU-PROYECTO.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=LA-LLAVE-SUPER-SECRETA \
node scripts/crear-usuario-portal.mjs papasellabrador@user.com papas-el-labrador
```

(Pide la contraseña por teclado.)

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
- `backend/esquema-supabase.sql` — Schema SQL (en Papas)

---

## Para seguimiento

**Cuando ejecutes cada paso, marca aquí lo que hiciste:**

```
Paso 1 (esquema SQL):    [ ] Ejecutado el 20XX-XX-XX
Paso 2 (tenant):         [ ] Ejecutado el 20XX-XX-XX
Paso 3 (usuario):        [ ] Ejecutado el 20XX-XX-XX
Paso 4 (datos):          [ ] Ejecutado el 20XX-XX-XX
Paso 5 (env vars):       [ ] Ejecutado el 20XX-XX-XX
Paso 6 (sync app):       [ ] Ejecutado el 20XX-XX-XX
Paso 7 (verificar):      [ ] Ejecutado el 20XX-XX-XX
Paso 8 (usuarios extras):[ ] Ejecutado el 20XX-XX-XX
```

---

## Guía completa

Para entender en profundidad cada paso y las comprobaciones, lee:

📄 **Archivo adjunto en la conversación:** "GUÍA COMPLETA: PUESTA EN MARCHA DE SUPABASE Y PORTAL"

Tiene:
- Explicación detallada de cada paso
- SQL completo
- Qué verificar en producción
- Cómo agregar más usuarios o empresas
- Lo que NO hay que hacer nunca

---

**Creado:** 2026-08-30  
**Por:** Copilot (GitHub)  
**Para:** Jose y Daniel, nexora-pos
