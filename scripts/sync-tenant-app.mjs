#!/usr/bin/env node
/**
 * Builds a tenant's application and copies it into `public/portal/<slug>/`.
 *
 * Why the compiled build and not the source: the tenant apps are separate projects with their own
 * stacks. Papas El Labrador is React 18 + Tailwind 3 + react-router; this site is React 19 +
 * Tailwind 4 + the App Router. One bundle cannot hold two Reacts and one PostCSS pipeline cannot
 * compile two major versions of Tailwind. Shipping the built output sidesteps all of it: the app
 * runs exactly as its own tests verified it, byte for byte.
 *
 * The result is committed to this repository. That is the price of serving it from here without
 * merging the two projects, and it is what lets Vercel deploy the whole thing without building a
 * second project it knows nothing about.
 *
 *   node scripts/sync-tenant-app.mjs papas-el-labrador "C:/Users/VICTUS/projects/Papas el Labrador"
 *
 * The path can also come from `RUTA_APP_TENANT`.
 */

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(fileURLToPath(new URL("..", import.meta.url)));

function morir(mensaje) {
  console.error(`\n  ${mensaje}\n`);
  process.exit(1);
}

const [slug, rutaArgumento] = process.argv.slice(2);
const rutaOrigen = rutaArgumento ?? process.env.RUTA_APP_TENANT;

if (!slug) morir("Falta el slug del tenant. Ejemplo: node scripts/sync-tenant-app.mjs papas-el-labrador <ruta>");
if (!/^[a-z0-9-]+$/.test(slug)) morir(`El slug "${slug}" no sirve como carpeta: usa minúsculas, números y guiones.`);
if (!rutaOrigen) morir("Falta la ruta del proyecto del tenant (argumento 2 o RUTA_APP_TENANT).");

const origen = resolve(rutaOrigen);
if (!existsSync(join(origen, "package.json"))) {
  morir(`En "${origen}" no hay un package.json. ¿Es esa la carpeta del proyecto?`);
}

// La ruta base tiene que coincidir con dónde lo sirve el portal, o los assets dan 404 y el router
// de la app no reconoce las URLs al recargar.
const base = `/portal/${slug}/`;

console.log(`\n  Construyendo ${slug} desde ${origen}`);
console.log(`  Ruta base: ${base}\n`);

try {
  execFileSync("npm", ["run", "build"], {
    cwd: origen,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: { ...process.env, VITE_BASE: base, VITE_PERSISTENCIA: "supabase" },
  });
} catch {
  morir("El build del tenant falló. No se copió nada: el portal se queda con la versión anterior.");
}

const dist = join(origen, "dist");
const indice = join(dist, "index.html");

if (!existsSync(indice) || !statSync(indice).isFile()) {
  morir(`El build terminó pero no dejó un index.html en ${dist}. No se copia nada.`);
}

const destino = join(RAIZ, "public", "portal", slug);

// Se vacía antes de copiar: si no, los assets de builds viejos se quedan ahí para siempre, y con
// el tiempo la carpeta pesa más de lo que sirve.
rmSync(destino, { recursive: true, force: true });
mkdirSync(destino, { recursive: true });
cpSync(dist, destino, { recursive: true });

console.log(`\n  Listo: public/portal/${slug}/`);
console.log("  Recuerda commitear la carpeta — es lo que despliega Vercel.\n");
