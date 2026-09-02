import { createBrowserClient } from "@supabase/ssr";

/**
 * The Supabase client for the browser.
 *
 * It stores the session in **cookies**, not `localStorage`, so `middleware.ts` can decide on the
 * server whether there is a session before serving a single byte of a tenant's app. It is also
 * what lets the client app — a separate Vite bundle served under `/portal/<slug>/` — pick up the
 * same session without any handoff code: same origin, same cookies.
 *
 * The anon key is PUBLIC by design: it ships inside the JavaScript the browser downloads. What
 * keeps one company from reading another's data is Row Level Security in the database, not the
 * secrecy of this key. The service_role key must never appear in this repository.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Cópialas del proyecto de Supabase (Settings → API) a .env.local. " +
        "Ver docs/PUESTA-EN-MARCHA-SUPABASE.md.",
    );
  }

  return createBrowserClient(url, anonKey);
}
