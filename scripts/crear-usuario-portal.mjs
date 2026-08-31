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
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, slug, nombre")
      .eq("slug", tenantSlug)
      .maybeSingle();

    if (tenantError) {
      console.error(`❌ Error consultando el tenant ${tenantSlug}: ${tenantError.message}`);
      process.exit(1);
    }

    if (!tenant) {
      console.error(`❌ Tenant no encontrado: ${tenantSlug}`);
      console.error("   Primero crea el tenant con el schema y el script de creación del negocio.");
      process.exit(1);
    }

    console.log(`✓ Tenant encontrado: ${tenant.nombre} (ID: ${tenant.id})`);

    const { data: users, error: listUsersError } = await supabase.auth.admin.listUsers();

    if (listUsersError) {
      console.error(`❌ No se pudo buscar usuarios: ${listUsersError.message}`);
      process.exit(1);
    }

    const user = users.users.find((item) => item.email?.toLowerCase() === email.toLowerCase());

    if (user) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password,
        app_metadata: {
          tenant_id: tenant.id,
          tenant_slug: tenantSlug,
          role: "admin",
        },
      });

      if (updateError) {
        console.error(`❌ Error actualizando usuario: ${updateError.message}`);
        process.exit(1);
      }

      console.log(`✓ Usuario existente actualizado: ${email}`);
      console.log(`✓ Tenant asignado en app_metadata: ${tenantSlug}`);
    } else {
      const { error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        app_metadata: {
          tenant_id: tenant.id,
          tenant_slug: tenantSlug,
          role: "admin",
        },
        email_confirm: true,
      });

      if (createError) {
        console.error(`❌ Error creando usuario: ${createError.message}`);
        process.exit(1);
      }

      console.log(`✓ Usuario creado: ${email}`);
      console.log(`✓ Tenant asignado en app_metadata: ${tenantSlug}`);
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          email,
          tenant_id: tenant.id,
          nombre: email.split("@")[0],
          rol: "admin",
        },
        { onConflict: "tenant_id,email" }
      );

    if (profileError) {
      console.error(`❌ Error creando perfil del usuario: ${profileError.message}`);
      process.exit(1);
    }

    console.log("\n✅ Listo. El usuario puede entrar en el portal.\n");
  } catch (err) {
    console.error(`❌ Error inesperado: ${err.message}`);
    process.exit(1);
  }
}

main();
