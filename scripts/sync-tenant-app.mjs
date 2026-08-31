#!/usr/bin/env node

/**
 * Construir y sincronizar la app del cliente para un tenant.
 *
 * Uso:
 *   node scripts/sync-tenant-app.mjs <tenant-slug> <path-to-papas-repo>
 *
 * Ejemplo:
 *   node scripts/sync-tenant-app.mjs papas-el-labrador "C:/Users/VICTUS/projects/Papas el Labrador"
 *
 * Verificaciones:
 * - Que .env.local esté presente en Nexora (para las claves de Supabase)
 * - Que package.json exista en la ruta de Papas
 * - Que npm run build funcione
 *
 * Luego copia todo el build a public/portal/<tenant-slug>/ y sugiere commitear.
 */

import { execSync } from "child_process";
import { existsSync, rmSync, cpSync, readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = new URL(".", import.meta.url).pathname;
const projectRoot = resolve(__dirname, "..");

const tenantSlug = process.argv[2];
const papasPath = process.argv[3];

if (!tenantSlug || !papasPath) {
  console.error(
    "❌ Uso: sync-tenant-app.mjs <tenant-slug> <path-to-papas-repo>"
  );
  console.error("");
  console.error("Ejemplo:");
  console.error(
    '  node scripts/sync-tenant-app.mjs papas-el-labrador "C:/Users/VICTUS/projects/Papas el Labrador"'
  );
  process.exit(1);
}

console.log(`📦 Sincronizando app para tenant: ${tenantSlug}`);
console.log(`📁 Ruta de Papas: ${papasPath}`);

// 1. Verificar que .env.local existe en Nexora
const envLocalPath = resolve(projectRoot, ".env.local");
if (!existsSync(envLocalPath)) {
  console.error("❌ No encontré .env.local en el proyecto Nexora.");
  console.error("   Cópialo de .env.example y llénalo con tus claves.");
  process.exit(1);
}

console.log("✓ .env.local encontrado en Nexora");

// 2. Leer .env.local para verificar que tiene las claves
const envContent = readFileSync(envLocalPath, "utf8");
const hasUrl =
  envContent.includes("NEXT_PUBLIC_SUPABASE_URL=") &&
  !envContent.includes('NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto');
const hasKey =
  envContent.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY=") &&
  !envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key');

if (!hasUrl || !hasKey) {
  console.error("❌ .env.local no tiene claves de Supabase válidas.");
  console.error("   Lleña NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

console.log("✓ Claves de Supabase presentes en .env.local");

// 3. Verificar que Papas existe
const papasPackageJson = resolve(papasPath, "frontend", "package.json");
if (!existsSync(papasPackageJson)) {
  console.error(`❌ No encontré ${papasPackageJson}`);
  console.error("   Verifica que la ruta a Papas sea correcta.");
  process.exit(1);
}

console.log("✓ Proyecto Papas encontrado");

// 4. Construir
console.log("\n🔨 Construyendo aplicación...");
try {
  execSync("npm run build", {
    cwd: resolve(papasPath, "frontend"),
    stdio: "inherit",
  });
} catch (err) {
  console.error("❌ Error construyendo la app. Revisa los errores arriba.");
  process.exit(1);
}

console.log("✓ Construcción completada");

// 5. Copiar a public/portal/<tenant-slug>/
const sourceDir = resolve(papasPath, "frontend", "dist");
const targetDir = resolve(projectRoot, "public", "portal", tenantSlug);

if (!existsSync(sourceDir)) {
  console.error(`❌ No encontré la carpeta dist en ${sourceDir}`);
  process.exit(1);
}

console.log(`\n📂 Copiando a public/portal/${tenantSlug}/...`);

if (existsSync(targetDir)) {
  rmSync(targetDir, { recursive: true, force: true });
}

cpSync(sourceDir, targetDir, { recursive: true });

console.log(`✓ App copiada a public/portal/${tenantSlug}/`);

// 6. Sugerir commit
console.log("\n✅ Listo. Pasos siguientes:");
console.log("");
console.log(`  git add public/portal/${tenantSlug}/`);
console.log(
  `  git commit -m "feat: sincronizar app del cliente para ${tenantSlug}"`
);
console.log(`  git push`);
console.log("");
