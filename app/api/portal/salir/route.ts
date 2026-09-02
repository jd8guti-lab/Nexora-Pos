import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Signs the client out and sends them back to the front door.
 *
 * It lives outside `/portal/` on purpose: everything under that path is gated by the middleware,
 * and a signed-out request would bounce before it ever got here.
 *
 * `GET` rather than `POST` because the app that links here is a separate bundle served as static
 * files — it has no server to post to and no CSRF token to send. The exposure is that a crafted
 * link could sign someone out, which costs them one login and no data.
 */
export async function GET(request: NextRequest) {
  const almacen = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll: () => almacen.getAll(),
        setAll: (lista) => {
          for (const { name, value, options } of lista) almacen.set(name, value, options);
        },
      },
    },
  );

  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/portal", request.url));
}
