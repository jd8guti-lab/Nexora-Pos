# Scripts de administración

Los scripts en esta carpeta automatizan tareas de implementación multi-tenant.

## `crear-usuario-portal.mjs`

**Propósito:** Crear o actualizar un usuario de Supabase Auth asignado a un tenant.

**Uso:**
```bash
SUPABASE_URL=https://tu-proyecto.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=la-llave-secreta \
node scripts/crear-usuario-portal.mjs usuario@email.com tenant-slug
```

**Ejemplo:**
```bash
SUPABASE_URL=https://abc123.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAi... \
node scripts/crear-usuario-portal.mjs papasellabrador@user.com papas-el-labrador
```

**Qué hace:**
1. Verifica que el tenant existe en la tabla `tenants`
2. Crea un usuario en Supabase Auth (o actualiza su contraseña si existe)
3. Asigna el tenant al usuario en `app_metadata.tenant_id`
4. La contraseña se pide por teclado, no por argumento (seguridad)

**Se usa en:** el paso 3 de `docs/PUESTA-EN-MARCHA-SUPABASE.md`

---

## `sync-tenant-app.mjs`

**Propósito:** Construir la app del cliente y copiarla a `public/portal/<tenant>/`.

**Uso:**
```bash
node scripts/sync-tenant-app.mjs <tenant-slug> <ruta-al-repo-papas>
```

**Ejemplo:**
```bash
node scripts/sync-tenant-app.mjs papas-el-labrador "C:\Users\VICTUS\projects\Papas el Labrador"
```

**Qué hace:**
1. Verifica que hay configuración de Supabase (`VITE_*`) **en el repo del cliente**, porque Vite
   incrusta esas variables en el bundle al construir: lo que no esté ahí en ese momento no existe
   después
2. Construye el proyecto del cliente con `npm run build`, con la ruta base `/portal/<slug>/`
3. Copia su `dist/` a `public/portal/<slug>/`
4. Imprime los comandos git necesarios para commitear

> El proyecto del cliente se construye **en su propia carpeta**, la que le pasas como segundo
> argumento. Este repositorio no tiene ni debe tener un `frontend/`: llegó a haber uno con 260 MB de
> `node_modules` y ni un archivo de código, y está en `.gitignore` para que no vuelva.

**Se usa en:** el paso 6 de `docs/PUESTA-EN-MARCHA-SUPABASE.md`

---

## Requisitos

- **Node.js 18+**
- **@supabase/supabase-js** (ya instalado)
- **.env.local** en Nexora con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Seguridad

- `SUPABASE_SERVICE_ROLE_KEY` nunca se guarda en el repo, nunca se commitea, nunca entra en Vercel
- Se pasa directamente en la terminal (línea de comandos)
- Si la necesitas otra vez, extráela del panel de Supabase > Settings > API
- Las contraseñas de usuarios se piden por teclado, no por argumento

---

## Troubleshooting

**"Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY"**
→ Estás ejecutando el script sin las variables. Usa el formato arriba.

**"No encontré .env.local"**
→ Crea `.env.local` en Nexora. Cópialo de `.env.example` y llénalo.

**"Error construyendo la app"**
→ El build de Papas falló. Revisa los errores en la consola. Probablemente falte instalar las dependencias (`npm install` en `frontend/`).

**"No encontré la carpeta dist"**
→ El build de Papas no generó `dist/`. Revisa que `npm run build` corrió sin errores.

---

Ver también: `docs/PUESTA-EN-MARCHA-SUPABASE.md`
