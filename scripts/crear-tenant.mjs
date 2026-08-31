#!/usr/bin/env node

/**
 * Crear o actualizar un tenant del portal.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/crear-tenant.mjs tenant-slug "Nombre del negocio" [admin-email]
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tenantSlug = process.argv[2];
const tenantName = process.argv[3];
const adminEmail = process.argv[4];

if (!url || !serviceRoleKey) {
  console.error("❌ Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

if (!tenantSlug || !tenantName) {
  console.error("❌ Uso: node scripts/crear-tenant.mjs <tenant-slug> " + '"<nombre del negocio>" [admin-email]');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

async function main() {
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .upsert(
      {
        slug: tenantSlug,
        nombre: tenantName,
        activo: true,
      },
      { onConflict: "slug" }
    )
    .select("id, slug, nombre, activo")
    .single();

  if (tenantError) {
    console.error(`❌ Error creando el tenant ${tenantSlug}: ${tenantError.message}`);
    process.exit(1);
  }

  console.log(`✓ Tenant listo: ${tenant.nombre} (${tenant.slug})`);

  if (adminEmail) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          email: adminEmail,
          tenant_id: tenant.id,
          nombre: tenantName,
          rol: "admin",
        },
        { onConflict: "tenant_id,email" }
      )
      .select("id, email, rol")
      .single();

    if (profileError) {
      console.error(`❌ Error creando perfil del administrador: ${profileError.message}`);
      process.exit(1);
    }

    console.log(`✓ Perfil de administrador listo: ${profile.email} (${profile.rol})`);
  }

  console.log("\n✅ Tenant registrado correctamente.\n");
}

main().catch((err) => {
  console.error(`❌ Error inesperado: ${err.message}`);
  process.exit(1);
});
