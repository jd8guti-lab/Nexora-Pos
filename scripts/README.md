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

**Sale usado en:** PASO 3 de `docs/PUESTA-EN-MARCHA.md`

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
1. Verifica que `.env.local` existe en Nexora (con claves de Supabase)
2. Construye `frontend/` del repo de Papas con `npm run build`
3. Copia el dist a `public/portal/papas-el-labrador/`
4. Imprime los comandos git necesarios para commitear

**Sale usado en:** PASO 6 de `docs/PUESTA-EN-MARCHA.md`

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

Ver también: `docs/PUESTA-EN-MARCHA.md`
