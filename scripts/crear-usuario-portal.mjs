#!/usr/bin/env node

/**
 * Crear o actualizar usuario del portal.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/crear-usuario-portal.mjs usuario@email.com tenant-slug
 *
 * Pide la contraseña por stdin (no por argumento, para no quedar en el historial).
 *
 * Si el usuario ya existe, actualiza su contraseña.
 * Si no existe, lo crea con la empresa en app_metadata.
 */

import { createClient } from "@supabase/supabase-js";
import * as readline from "readline";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.argv[2];
const tenantSlug = process.argv[3];

if (!url || !serviceRoleKey) {
  console.error(
    "❌ Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno."
  );
  process.exit(1);
}

if (!email || !tenantSlug) {
  console.error("❌ Uso: creator-usuario-portal.mjs <email> <tenant-slug>");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

async function askPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Contraseña: ", (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function main() {
  console.log(`📧 Email: ${email}`);
  console.log(`🏢 Tenant: ${tenantSlug}`);

  const password = await askPassword();

  if (!password || password.length < 8) {
    console.error("❌ La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  try {
    // Verificar que el tenant existe
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, slug, nombre")
      .eq("slug", tenantSlug)
      .single();

    if (tenantError) {
      console.error(`❌ Tenant no encontrado: ${tenantSlug}`);
      console.error(tenantError.message);
      process.exit(1);
    }

    console.log(`✓ Tenant encontrado: ${tenant.nombre} (ID: ${tenant.id})`);

    // Crear o actualizar el usuario
    const { data: existingUser } = await supabase.auth.admin.getUserById(
      // Primero intentamos buscar por email
      // Supabase Auth no tiene un `getByEmail` en admin, así que intentamos crear
      // y si existe, actualizamos
    );

    // En la práctica, usamos upsert: buscamos, y si no existe creamos
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        app_metadata: { tenant_id: tenant.id, tenant_slug: tenantSlug },
        email_confirm: true,
      });

    if (authError && authError.message.includes("already exists")) {
      // El usuario existe, actualizamos su contraseña y metadata
      const { data: users, error: searchError } =
        await supabase.auth.admin.listUsers();

      if (searchError) {
        console.error(`❌ No se pudo buscar el usuario: ${searchError.message}`);
        process.exit(1);
      }

      const user = users.users.find((u) => u.email === email);

      if (!user) {
        console.error(`❌ Usuario no encontrado después de búsqueda.`);
        process.exit(1);
      }

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          password,
          app_metadata: { tenant_id: tenant.id, tenant_slug: tenantSlug },
        }
      );

      if (updateError) {
        console.error(`❌ Error actualizando usuario: ${updateError.message}`);
        process.exit(1);
      }

      console.log(`✓ Contraseña actualizada para ${email}`);
    } else if (authError) {
      console.error(`❌ Error creando usuario: ${authError.message}`);
      process.exit(1);
    } else {
      console.log(`✓ Usuario creado: ${email}`);
      console.log(`✓ Tenant asignado en app_metadata: ${tenantSlug}`);
    }

    console.log("\n✅ Listo. El usuario puede entrar en el portal.\n");
  } catch (err) {
    console.error(`❌ Error inesperado: ${err.message}`);
    process.exit(1);
  }
}

main();
