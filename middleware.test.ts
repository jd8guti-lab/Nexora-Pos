// @vitest-environment node
/**
 * The portal gate.
 *
 * This is the file that decides whether a request for a client's application gets served, so its
 * behaviour is worth pinning down: no session, a session for another company, a page versus a
 * file, and the marketing site passing through untouched.
 *
 * Supabase is stubbed. What is under test is the routing decision, not the token validation —
 * that belongs to Supabase, and the data behind it is protected by Row Level Security regardless.
 */
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

const { middleware } = await import("./middleware");

/** A signed-in user of the given company. */
function sesionDe(slug: string) {
  return {
    data: { user: { app_metadata: { tenant_id: `id-${slug}`, tenant_slug: slug } } },
    error: null,
  };
}

const sinSesion = { data: { user: null }, error: null };

const pedir = (ruta: string) => middleware(new NextRequest(`https://nexora-pos.co${ruta}`));

beforeEach(() => {
  getUser.mockReset();
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://ejemplo.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "llave-anonima-de-prueba";
});

describe("the marketing site", () => {
  it.each(["/", "/precios", "/contacto", "/modulos"])("%s passes straight through", async (ruta) => {
    const respuesta = await pedir(ruta);

    expect(respuesta.status).toBe(200);
    // Not a single call to Supabase: the public site must not depend on the portal being up.
    expect(getUser).not.toHaveBeenCalled();
  });
});

describe("the login page", () => {
  it("is reachable without a session", async () => {
    const respuesta = await pedir("/portal");

    expect(respuesta.status).toBe(200);
    expect(getUser).not.toHaveBeenCalled();
  });
});

describe("without a session", () => {
  it("sends you to the login page and remembers where you were going", async () => {
    getUser.mockResolvedValue(sinSesion);

    const respuesta = await pedir("/portal/papas-el-labrador/pedidos");
    const destino = new URL(respuesta.headers.get("location") ?? "");

    expect(respuesta.status).toBe(307);
    expect(destino.pathname).toBe("/portal");
    expect(destino.searchParams.get("destino")).toBe("/portal/papas-el-labrador/pedidos");
  });

  it("does not even hand over the application's JavaScript", async () => {
    getUser.mockResolvedValue(sinSesion);

    const respuesta = await pedir("/portal/papas-el-labrador/assets/index-abc123.js");

    expect(respuesta.status).toBe(307);
    expect(new URL(respuesta.headers.get("location") ?? "").pathname).toBe("/portal");
  });
});

describe("when Supabase is not configured", () => {
  it("still serves the login page, so a missing variable does not take down the front door", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;

    const respuesta = await pedir("/portal");

    expect(respuesta.status).toBe(200);
  });

  it("fails closed: nobody reaches a tenant's app", async () => {
    // The alternative — letting requests through when we cannot tell who is asking — would serve
    // a client's application to anyone who typed the address.
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const respuesta = await pedir("/portal/papas-el-labrador/pedidos");

    expect(respuesta.status).toBe(307);
    expect(new URL(respuesta.headers.get("location") ?? "").pathname).toBe("/portal");
  });
});

describe("with a session", () => {
  it("rewrites a page request to the app's index so its own router can take over", async () => {
    // Without this, reloading on a deep link would 404: those routes only exist inside the bundle.
    getUser.mockResolvedValue(sesionDe("papas-el-labrador"));

    const respuesta = await pedir("/portal/papas-el-labrador/pedidos");

    expect(respuesta.headers.get("x-middleware-rewrite")).toContain(
      "/portal/papas-el-labrador/index.html",
    );
  });

  it("serves a real file as it is, without rewriting", async () => {
    getUser.mockResolvedValue(sesionDe("papas-el-labrador"));

    const respuesta = await pedir("/portal/papas-el-labrador/assets/index-abc123.js");

    expect(respuesta.headers.get("x-middleware-rewrite")).toBeNull();
    expect(respuesta.status).toBe(200);
  });

  it("bounces a client that types another company's address", async () => {
    // RLS would stop the data anyway, but a client should never see another company's app at all.
    getUser.mockResolvedValue(sesionDe("papas-el-labrador"));

    const respuesta = await pedir("/portal/otra-empresa/pedidos");

    expect(respuesta.status).toBe(307);
    expect(new URL(respuesta.headers.get("location") ?? "").pathname).toBe(
      "/portal/papas-el-labrador/",
    );
  });

  it("treats a user with no company as not signed in", async () => {
    // A half-provisioned account must not open somebody else's door.
    getUser.mockResolvedValue({ data: { user: { app_metadata: {} } }, error: null });

    const respuesta = await pedir("/portal/papas-el-labrador/");

    expect(new URL(respuesta.headers.get("location") ?? "").pathname).toBe("/portal");
  });
});
