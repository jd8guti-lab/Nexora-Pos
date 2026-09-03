/**
 * Which company a portal session belongs to.
 *
 * Both values live in the user's `app_metadata`, never in `user_metadata`: `user_metadata` can be
 * edited by the user from the browser, so a client could reassign itself to another company and
 * read its data. `app_metadata` is only writable with the service_role key.
 *
 * `slug` is what appears in the URL (`/portal/papas-el-labrador`). Keeping it in the token means
 * the middleware can check "is this URL yours?" without a database round-trip on every request —
 * including every asset request of the app it serves.
 */
export interface TenantDeSesion {
  /** The `tenants.id` row in Supabase. What RLS matches against. */
  readonly id: string;
  /** The folder under `/portal/` where this company's app is served. */
  readonly slug: string;
}

/** Reads the tenant out of a Supabase user's `app_metadata`, or `null` if it isn't there. */
export function tenantDeMetadatos(metadatos: unknown): TenantDeSesion | null {
  if (typeof metadatos !== "object" || metadatos === null) return null;

  const registro = metadatos as Record<string, unknown>;
  const id = registro["tenant_id"];
  const slug = registro["tenant_slug"];

  if (typeof id !== "string" || id === "") return null;
  if (typeof slug !== "string" || slug === "") return null;

  return { id, slug };
}

/**
 * The first path segment under `/portal/`, or `null` for `/portal` itself.
 *
 * `/portal/papas-el-labrador/pedidos` → `papas-el-labrador`
 */
export function slugDeRuta(pathname: string): string | null {
  const resto = pathname.replace(/^\/portal\/?/, "");
  if (resto === "") return null;

  const [slug] = resto.split("/");
  return slug === undefined || slug === "" ? null : slug;
}

/** Where a tenant lands after signing in. */
export function rutaDeTenant(slug: string): string {
  return `/portal/${slug}/`;
}

/**
 * `/portal/<slug>` with no trailing slash — the one URL shape that serves a blank page.
 *
 * The tenant app's router is built with `basename="/portal/<slug>/"`, and React Router refuses to
 * match a URL that does not start with the basename: `/portal/las-dos-palmas` is not
 * `/portal/las-dos-palmas/`, so it matches nothing and renders **nothing**. The page loads, the
 * bundle runs, the console says `<Router basename> is not able to match the URL`, and the client
 * sees white.
 *
 * Signing in never produces this shape —`rutaDeTenant` appends the slash— so it stayed hidden
 * until someone typed the URL by hand. It affects every tenant, not the one that found it.
 */
export function faltaLaBarraFinal(pathname: string): boolean {
  return /^\/portal\/[^/]+$/.test(pathname);
}
