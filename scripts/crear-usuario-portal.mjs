#!/usr/bin/env node
/**
 * Crea (o actualiza) el usuario de una empresa cliente en el portal.
 *
 * Se corre A MANO, en tu máquina, UNA vez por cliente. Necesita la `service_role` key, que se
 * salta todas las políticas RLS: con ella se leen y se borran los datos de TODAS las empresas.
 *
 *   * No la pongas en `.env.local` ni en Vercel ni en ninguna variable `NEXT_PUBLIC_`.
 *   * No la pegues en un chat, ni siquiera con quien te está ayudando a programar.
 *   * Si alguna vez se filtra, se rota desde Supabase (Settings → API → Reset).
 *
 * La contraseña se pide por teclado, no por argumento: lo que se escribe en la línea de comandos
 * queda en el historial del shell.
 *
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/crear-usuario-portal.mjs papasellabrador@user.com papas-el-labrador
 *
 * El `tenant_id` se busca en la tabla `tenants` por su slug, así que esa fila tiene que existir
 * antes (ver docs/PUESTA-EN-MARCHA-SUPABASE.md).
 */

import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";

function morir(mensaje) {
  console.error(`\n  ${mensaje}\n`);
  process.exit(1);
}

const [email, slug] = process.argv.slice(2);
const url = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!email || !slug) {
  morir("Uso: node scripts/crear-usuario-portal.mjs <correo> <slug-de-la-empresa>");
}
if (!url || !serviceRole) {
  morir("Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en el entorno.");
}

/** Pide la contraseña por teclado. No se puede ocultar sin dependencias, así que se avisa. */
async function pedirContrasena() {
  const lector = createInterface({ input: process.stdin, output: process.stdout });
  try {
    console.log("\n  Ojo: lo que escribas se va a ver en pantalla.");
    const clave = await new Promise((resolver) =>
      lector.question(`  Contraseña para ${email}: `, resolver),
    );
    if (clave.trim().length < 8) morir("La contraseña debe tener al menos 8 caracteres.");
    return clave;
  } finally {
    lector.close();
  }
}

const db = createClient(url, serviceRole, { auth: { persistSession: false } });

const { data: tenant, error: errorTenant } = await db
  .from("tenants")
  .select("id, nombre")
  .eq("slug", slug)
  .maybeSingle();

if (errorTenant) morir(`No se pudo consultar la empresa: ${errorTenant.message}`);
if (!tenant) {
  morir(
    `No existe una empresa con el slug "${slug}" en la tabla \`tenants\`.\n` +
      "  Créala primero — ver docs/PUESTA-EN-MARCHA-SUPABASE.md.",
  );
}

const password = await pedirContrasena();

// `app_metadata` y NO `user_metadata`: `user_metadata` lo puede editar el propio usuario desde el
// navegador, así que ahí el cliente podría reasignarse a otra empresa y leer sus datos.
const app_metadata = { tenant_id: tenant.id, tenant_slug: slug };

const { data: creado, error } = await db.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  app_metadata,
});

if (error) {
  // Si ya existe, se actualiza en vez de fallar: así este script sirve para cambiar la contraseña.
  const { data: lista } = await db.auth.admin.listUsers();
  const existente = lista?.users.find((u) => u.email === email);
  if (!existente) morir(`No se pudo crear el usuario: ${error.message}`);

  const { error: errorUpdate } = await db.auth.admin.updateUserById(existente.id, {
    password,
    app_metadata,
  });
  if (errorUpdate) morir(`No se pudo actualizar el usuario: ${errorUpdate.message}`);

  console.log(`\n  Actualizado: ${email} → ${tenant.nombre} (${slug})\n`);
} else {
  console.log(`\n  Creado: ${creado.user.email} → ${tenant.nombre} (${slug})\n`);
}

console.log(`  Entra en /portal y te lleva a /portal/${slug}/\n`);
