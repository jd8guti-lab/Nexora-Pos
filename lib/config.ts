/**
 * Runtime configuration.
 *
 * The portal is a separate project. Today it is a placeholder route in this
 * app, but the "Ingresar al portal" button reads this value so the day the
 * portal moves to its own domain nothing but an env var changes.
 */

/** Where "Ingresar al portal" points. Override with NEXT_PUBLIC_PORTAL_URL. */
export const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL ?? "/portal";

/** True while the portal still lives inside this app. */
export const portalIsInternal = portalUrl.startsWith("/");

/**
 * Canonical origin, used for metadata, sitemap and Open Graph.
 *
 * The real domain, confirmed on 2026-08-31. It is also what the tenants' printed receipts show as
 * the software's footer, so the two must not drift apart.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://nexora-pos.online"
).replace(/\/$/, "");

/** Routes that must never reach a search index. */
export const noIndexRoutes = ["/portal", "/kitchen-sink"] as const;
