import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { rutaDeTenant, slugDeRuta, tenantDeMetadatos } from "@/lib/portal/tenant";

/**
 * The portal gate.
 *
 * Everything under `/portal/<slug>/` is a tenant's application: static files built from a separate
 * project and served from `public/portal/<slug>/`. This middleware decides three things:
 *
 *  1. **Is there a session?** Without one, back to `/portal` to sign in.
 *  2. **Is this URL yours?** A client typing another company's slug gets bounced. Row Level
 *     Security would stop the data anyway, but a client should never see another company's app
 *     shell, let alone its name in the tab title.
 *  3. **Is this a page or a file?** A single-page app owns its own routing, so any path without a
 *     file extension is rewritten to that tenant's `index.html`. Without this, reloading on
 *     `/portal/papas-el-labrador/pedidos` would 404.
 *
 * Tenant resolution used to be a TODO here. This is it.
 */

/** Paths that are the marketing site, not the portal. They pass straight through. */
function esDelPortal(pathname: string): boolean {
  return pathname === "/portal" || pathname.startsWith("/portal/");
}

/**
 * A request for a file (`.js`, `.css`, `.png`) rather than a page.
 *
 * Used to decide whether to rewrite to `index.html`, and to skip the network round-trip that
 * validating a token costs — an app boot is dozens of asset requests.
 */
function pideUnArchivo(pathname: string): boolean {
  return /\.[a-z0-9]+$/i.test(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!esDelPortal(pathname)) return NextResponse.next();

  const slug = slugDeRuta(pathname);

  // `/portal` itself is the login page: it must stay reachable without a session, and without
  // Supabase even being configured — otherwise a missing env var takes down the front door too.
  if (slug === null) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without configuration there is no way to tell who is asking, so nobody gets in. Failing
  // closed: the alternative would be serving a client's application to anyone.
  if (!url || !anonKey) return redirigirAlLogin(request, pathname);

  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookies) => {
        // The refreshed session has to travel back to the browser, or the next request arrives
        // with the stale token and the session dies mid-shift.
        for (const { name, value } of cookies) request.cookies.set(name, value);
        respuesta = NextResponse.next({ request });
        for (const { name, value, options } of cookies) {
          respuesta.cookies.set(name, value, options);
        }
      },
    },
  });

  const { data, error } = await supabase.auth.getUser();
  const tenant = error === null ? tenantDeMetadatos(data.user?.app_metadata) : null;

  if (tenant === null) return redirigirAlLogin(request, pathname);

  // A client may only reach its own company's app.
  if (tenant.slug !== slug) {
    return NextResponse.redirect(new URL(rutaDeTenant(tenant.slug), request.url));
  }

  /*
   * Do NOT redirect `/portal/<slug>` to `/portal/<slug>/` here. It looks like the obvious fix for
   * the blank page that shape used to produce, and it is an infinite redirect loop: Next strips
   * the trailing slash with a 308 of its own, this would put it back, and the browser ping-pongs
   * until it gives up. Shipped on 3 September 2026; it left the portal login unusable, because a
   * successful sign-in lands exactly on that URL.
   *
   * The blank page was the tenant app's to fix, and it is fixed there: its router's `basename` now
   * drops the trailing slash, so both shapes match. See `rutaBase()` in each app.
   */

  // The app owns its routing from here on: anything that is not a file is its index.
  if (!pideUnArchivo(pathname)) {
    return NextResponse.rewrite(new URL(`/portal/${slug}/index.html`, request.url), respuesta);
  }

  return respuesta;
}

function redirigirAlLogin(request: NextRequest, destino: string) {
  const url = new URL("/portal", request.url);
  // Remember where they were headed, so signing in doesn't dump them at the front door.
  url.searchParams.set("destino", destino);
  return NextResponse.redirect(url);
}

export const config = {
  // Static assets of the marketing site and the image optimizer never need any of this.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/).*)"],
};
