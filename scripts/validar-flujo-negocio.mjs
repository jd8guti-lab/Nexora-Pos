#!/usr/bin/env node

/**
 * Validación del flujo real de negocio para un tenant.
 *
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/validar-flujo-negocio.mjs tenant-slug
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tenantSlug = process.argv[2];

if (!url || !serviceRoleKey) {
  console.error("❌ Falta SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

if (!tenantSlug) {
  console.error("❌ Uso: node scripts/validar-flujo-negocio.mjs <tenant-slug>");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey);

async function main() {
  console.log(`🔎 Validando tenant: ${tenantSlug}`);

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, slug, nombre, activo")
    .eq("slug", tenantSlug)
    .maybeSingle();

  if (tenantError) {
    console.error(`❌ Error consultando el tenant: ${tenantError.message}`);
    process.exit(1);
  }

  if (!tenant) {
    console.error(`❌ No existe el tenant ${tenantSlug}.`);
    console.error("   Crearlo antes con: node scripts/crear-tenant.mjs <slug> " + '"<nombre>"');
    process.exit(1);
  }

  console.log(`✓ Tenant existe: ${tenant.nombre}`);
  console.log(`✓ Estado activo: ${tenant.activo ? "sí" : "no"}`);

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, email, rol")
    .eq("tenant_id", tenant.id);

  if (profilesError) {
    console.error(`❌ Error consultando perfiles del tenant: ${profilesError.message}`);
    process.exit(1);
  }

  console.log(`✓ Perfiles del tenant: ${profiles?.length ?? 0}`);

  const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();

  if (authUsersError) {
    console.error(`❌ Error consultando usuarios de Auth: ${authUsersError.message}`);
    process.exit(1);
  }

  const matchingUsers = authUsers.users.filter((user) => {
    const tenantSlugFromMetadata = user.app_metadata?.tenant_slug;
    return tenantSlugFromMetadata === tenantSlug;
  });

  console.log(`✓ Usuarios del portal vinculados al tenant: ${matchingUsers.length}`);

  if (!matchingUsers.length) {
    console.warn("⚠️ No hay usuarios de Auth vinculados a este tenant.");
    console.warn("   Ejecuta: node scripts/crear-usuario-portal.mjs <email> <tenant-slug>");
  }

  const businessConfig = await supabase
    .from("business_config")
    .select("id, config")
    .eq("tenant_id", tenant.id)
    .maybeSingle();

  if (businessConfig.error && businessConfig.error.code !== "PGRST116") {
    console.error(`❌ Error consultando configuración del negocio: ${businessConfig.error.message}`);
    process.exit(1);
  }

  console.log(
    `✓ Configuración de negocio: ${businessConfig.data ? "presenta" : "sin datos aún"}`
  );

  console.log("\n✅ Flujo del negocio validado para el tenant.\n");
}

main().catch((err) => {
  console.error(`❌ Error inesperado: ${err.message}`);
  process.exit(1);
});
