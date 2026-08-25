import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/config";

/**
 * The public routes, and only those. /portal and /kitchen-sink are excluded
 * on purpose: one is a placeholder and the other is a development page.
 */
const routes = [
  { path: "/", priority: 1 },
  { path: "/modulos", priority: 0.9 },
  { path: "/precios", priority: 0.9 },
  { path: "/casos", priority: 0.8 },
  { path: "/contacto", priority: 0.8 },
  { path: "/legal/privacidad", priority: 0.2 },
  { path: "/legal/terminos", priority: 0.2 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.map(({ path, priority }) => ({
    url: `${siteUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority,
  }));
}
