"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { LogoLockup } from "@/components/brand/logo-lockup";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import type { DashboardData, TenantContext } from "@/lib/dashboard";
import {
  fetchDashboard,
  fetchTenantContext,
  formatearFecha,
  formatearKilos,
  formatearPesos,
} from "@/lib/dashboard";
import { createClient } from "@/utils/supabase/client";

const tenantBranding = {
  "papas-el-labrador": {
    name: "Papas el Labrador",
    shortName: "Papas el Labrador",
  },
  default: {
    name: "Las dos palmas",
    shortName: "Las dos palmas",
  },
} as const;

const tenantPortalUrls = {
  "papas-el-labrador": "/portal/papas-el-labrador/",
} as const;

function resolveTenantSlug(user: User | null) {
  return (
    (user?.app_metadata as { tenant_slug?: string } | undefined)?.tenant_slug ??
    (user?.user_metadata as { tenant_slug?: string } | undefined)?.tenant_slug ??
    (user?.email ?? "").toLowerCase()
  );
}

function resolveTenantBrand(user: User | null) {
  const tenantSlug = resolveTenantSlug(user);

  if (tenantSlug.includes("papas") || tenantSlug.includes("labrador")) {
    return tenantBranding["papas-el-labrador"];
  }

  return tenantBranding.default;
}

function TarjetaResumen({
  titulo,
  icono,
  valor,
  detalle,
}: {
  titulo: string;
  icono: string;
  valor: string;
  detalle: string;
}) {
  return (
    <div className="rounded-2xl border border-[#d9dfe5] bg-[#f5f5f5] p-4">
      <div className="flex items-center justify-between text-[#626976]">
        <span className="text-sm">{titulo}</span>
        <span aria-hidden>{icono}</span>
      </div>
      <div className="mt-5 text-5xl font-black text-[#1a1d23]">{valor}</div>
      <div className="mt-2 text-sm text-[#626976]">{detalle}</div>
    </div>
  );
}

function resolveTenantPortalUrl(user: User | null) {
  const tenantSlug = resolveTenantSlug(user);

  if (tenantSlug.includes("papas") || tenantSlug.includes("labrador")) {
    return tenantPortalUrls["papas-el-labrador"];
  }

  return null;
}

export default function PortalPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [configError, setConfigError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectTarget, setRedirectTarget] = useState<string | null>(null);
  const [tenant, setTenant] = useState<TenantContext | null>(null);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState("");
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  // La fecha se calcula en el cliente para no desalinear el HTML del servidor con el
  // del navegador cuando cruzan la medianoche entre uno y otro.
  const [hoy, setHoy] = useState<Date | null>(null);

  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch (err) {
      setConfigError(
        err instanceof Error
          ? err.message
          : "Falta la configuración de Supabase para el portal."
      );
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const loadSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getUser();
      if (sessionError) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const nextUser = data.user;
      const targetPortal = resolveTenantPortalUrl(nextUser);
      setUser(nextUser);
      setRedirectTarget(targetPortal ?? null);
      setIsLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      const targetPortal = resolveTenantPortalUrl(nextUser);
      setUser(nextUser);
      setRedirectTarget(targetPortal ?? null);
      setIsLoading(false);
    });

    void loadSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Los datos del negocio solo se piden cuando hay sesión y el tenant se queda en este
  // portal. Si va a salir a su propia app sincronizada, la consulta sería trabajo tirado.
  useEffect(() => {
    if (!supabase || !user || redirectTarget) {
      return;
    }

    let cancelado = false;

    const cargarDashboard = async () => {
      setIsDashboardLoading(true);
      setDashboardError("");

      const ahora = new Date();
      setHoy(ahora);

      try {
        const contexto = await fetchTenantContext(supabase, user);
        if (cancelado) return;

        setTenant(contexto);

        if (!contexto) {
          setDashboard(null);
          setDashboardError(
            "Tu usuario no está asociado a ningún negocio. Pide que lo vinculen a un tenant para ver tus datos."
          );
          return;
        }

        const datos = await fetchDashboard(supabase, contexto.id, ahora);
        if (cancelado) return;

        setDashboard(datos);
      } catch (err) {
        if (cancelado) return;

        setDashboard(null);
        setDashboardError(
          err instanceof Error ? err.message : "No se pudieron cargar los datos del negocio."
        );
      } finally {
        if (!cancelado) {
          setIsDashboardLoading(false);
        }
      }
    };

    void cargarDashboard();

    return () => {
      cancelado = true;
    };
  }, [supabase, user, redirectTarget]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      setConfigError(
        "La conexión con Supabase no está configurada. Copia la anon key real del proyecto en .env.local."
      );
      return;
    }

    setError("");
    setConfigError("");
    setIsSubmitting(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    const nextUser = data.user ?? user;
    const targetPortal = resolveTenantPortalUrl(nextUser);
    setUser(nextUser);
    setRedirectTarget(targetPortal ?? null);
    setIsSubmitting(false);
  };

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setPassword("");
    setRedirectTarget(null);
    setTenant(null);
    setDashboard(null);
    setDashboardError("");
  };

  const continueToPortal = () => {
    if (redirectTarget) {
      window.location.assign(redirectTarget);
      return;
    }

    const targetPortal = resolveTenantPortalUrl(user);
    if (targetPortal) {
      window.location.assign(targetPortal);
    }
  };

  const tenantBrand = resolveTenantBrand(user);
  const nombreNegocio = tenant?.nombre ?? tenantBrand.name;
  const cargandoDashboard = isDashboardLoading && !dashboard;
  const marcador = cargandoDashboard ? "…" : "—";
  const sinDatos = cargandoDashboard ? "Cargando…" : "Sin datos todavía";

  if (isLoading) {
    return (
      <main className="surface-dark bg-ink-900 flex min-h-dvh flex-col items-center justify-center py-16 text-white">
        <Container className="flex max-w-lg flex-col items-center text-center">
          <LogoLockup variant="dark" height={40} withDescriptor priority />
          <p className="text-body text-paper-50/80 mt-8">Cargando portal…</p>
        </Container>
      </main>
    );
  }

  if (redirectTarget && user) {
    return (
      <main className="surface-dark bg-ink-900 flex min-h-dvh flex-col items-center justify-center py-16 text-white">
        <Container className="flex max-w-xl flex-col items-center text-center">
          <LogoLockup variant="dark" height={40} withDescriptor priority />

          <div className="mt-12 w-full max-w-lg rounded-2xl border border-paper-50/20 bg-paper-50/5 p-6 text-left shadow-lg shadow-black/20">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
              Sesión activa
            </p>
            <h1 className="mt-3 text-3xl font-bold text-white">Ya iniciaste sesión</h1>
            <p className="mt-3 text-base text-paper-50/80">
              Estás autenticado como <span className="font-semibold text-white">{user.email}</span> y
              puedes continuar en tu portal de {tenantBrand.name}.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="inverse" size="md" className="flex-1" onClick={continueToPortal}>
                Continuar al portal
              </Button>
              <Button type="button" variant="inverseOutline" size="md" className="flex-1" onClick={handleSignOut}>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </Container>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="surface-dark bg-ink-900 flex min-h-dvh flex-col items-center justify-center py-16 text-white">
        <Container className="flex max-w-xl flex-col items-center text-center">
          <LogoLockup variant="dark" height={40} withDescriptor priority />

          <h1 className="text-h1 mt-12">Portal de clientes</h1>
          <p className="text-lead text-paper-50/80 mt-5">
            Ingresa con tu cuenta de {site.name} para acceder a tu negocio.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 w-full max-w-md space-y-4 text-left">
            <label className="block text-sm font-medium text-paper-50/80">
              Correo
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-paper-50/20 bg-paper-50/5 px-4 py-3 text-base text-white outline-none ring-0 transition focus:border-brand-500"
                placeholder="correo@empresa.com"
                required
              />
            </label>

            <label className="block text-sm font-medium text-paper-50/80">
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-paper-50/20 bg-paper-50/5 px-4 py-3 text-base text-white outline-none ring-0 transition focus:border-brand-500"
                placeholder="••••••••"
                required
              />
            </label>

            {configError ? (
              <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {configError}
              </p>
            ) : error ? (
              <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="inverse" size="md" disabled={isSubmitting || !supabase} className="flex-1">
                {isSubmitting ? "Ingresando…" : "Ingresar"}
              </Button>
              <Button asChild variant="inverseOutline" size="md" className="flex-1">
                <Link href="/">
                  <ArrowLeft aria-hidden />
                  Volver al sitio
                </Link>
              </Button>
            </div>
          </form>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[#edf0f2] text-[#1a1d23]">
      <div className="flex min-h-dvh">
        <aside className="flex w-[260px] flex-col border-r border-[#d9dfe5] bg-[#f2f3f4] px-4 py-6">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-xl font-black text-white">
              N
            </div>
            <div className="text-left">
              <p className="text-lg font-bold text-[#1a1d23]">{nombreNegocio}</p>
              <p className="text-xs text-[#626976]">
                {tenant ? `Negocio ${tenant.slug}` : "Configura los datos en Ajustes..."}
              </p>
            </div>
          </div>

          <nav className="space-y-2 text-sm font-medium">
            <button className="flex w-full items-center gap-3 rounded-xl bg-brand-500 px-3 py-3 text-left font-semibold text-[#1a1d23] shadow-sm">
              <span aria-hidden>⌂</span>
              Inicio
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[#1a1d23] hover:bg-white/80">
              <span aria-hidden>◫</span>
              Pedidos
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[#1a1d23] hover:bg-white/80">
              <span aria-hidden>◌</span>
              Clientes y proveedores
            </button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-[#1a1d23] hover:bg-white/80">
              <span aria-hidden>▣</span>
              Existencias
            </button>
          </nav>

          <div className="mt-auto space-y-3 border-t border-[#d9dfe5] pt-4">
            <button className="w-full rounded-xl border border-[#d9dfe5] bg-white px-3 py-2 text-left text-[#1a1d23]">
              Facturación
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full rounded-xl border border-[#d9dfe5] bg-white px-3 py-2 text-left text-[#1a1d23]"
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        <div className="flex-1 p-6">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1a1d23]">{nombreNegocio}</h1>
              <p className="mt-1 text-sm text-[#626976]">{hoy ? formatearFecha(hoy) : " "}</p>
            </div>

            <Button type="button" variant="primary" size="md" onClick={() => {}}>
              <span aria-hidden>＋</span>
              Nuevo pedido
            </Button>
          </header>

          {dashboardError ? (
            <p
              role="alert"
              className="mb-6 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {dashboardError}
            </p>
          ) : null}

          <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TarjetaResumen
              titulo="Pedidos de hoy"
              icono="📝"
              valor={dashboard ? String(dashboard.pedidosHoy.total) : marcador}
              detalle={
                dashboard
                  ? `${dashboard.pedidosHoy.porEntregar} por entregar · ${formatearKilos(dashboard.pedidosHoy.kg)}`
                  : sinDatos
              }
            />

            <TarjetaResumen
              titulo="Vendido hoy"
              icono="💵"
              valor={dashboard ? formatearPesos(dashboard.vendidoHoy.facturado) : marcador}
              detalle={
                dashboard
                  ? `${formatearPesos(dashboard.vendidoHoy.cobrado)} cobrado hoy`
                  : sinDatos
              }
            />

            {/* El inventario salió del esquema del negocio: no hay saldos de producto ni
                mínimos, así que estas dos tarjetas cuentan lo que sí existe. */}
            <TarjetaResumen
              titulo="Catálogo activo"
              icono="📦"
              valor={dashboard ? String(dashboard.catalogo.productosActivos) : marcador}
              detalle={dashboard ? "producto(s) activos en el catálogo" : sinDatos}
            />

            <TarjetaResumen
              titulo="Cartera pendiente"
              icono="⚠️"
              valor={dashboard ? formatearPesos(dashboard.cartera.pendiente) : marcador}
              detalle={
                dashboard ? `${dashboard.cartera.documentos} pedido(s) con saldo` : sinDatos
              }
            />
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-[#d9dfe5] bg-[#f5f5f5] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#1a1d23]">Todo lo de hoy</h2>
                <button className="text-sm font-medium text-[#1a1d23]">Ver todos →</button>
              </div>

              {cargandoDashboard ? (
                <p className="text-base text-[#626976]">Cargando los pedidos de hoy…</p>
              ) : dashboard && dashboard.pedidosDelDia.length > 0 ? (
                <ul className="divide-y divide-[#d9dfe5]">
                  {dashboard.pedidosDelDia.map((pedido) => (
                    <li key={pedido.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#1a1d23]">{pedido.cliente}</p>
                        <p className="text-sm text-[#626976]">
                          {pedido.ticket} · {formatearKilos(pedido.kg)} ·{" "}
                          {pedido.estado === "ENTREGADO" ? "Entregado" : "Por entregar"}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-semibold text-[#1a1d23]">
                          {formatearPesos(pedido.total)}
                        </p>
                        {pedido.saldoPendiente > 0 ? (
                          <p className="text-sm text-[#626976]">
                            debe {formatearPesos(pedido.saldoPendiente)}
                          </p>
                        ) : (
                          <p className="text-sm text-[#626976]">pagado</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-base text-[#626976]">
                  Todavía no hay pedidos hoy. Toma el primero.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-[#d9dfe5] bg-[#f5f5f5] p-5">
              <h2 className="text-2xl font-black text-[#1a1d23]">Cartera vencida</h2>

              {cargandoDashboard ? (
                <p className="mt-4 text-base text-[#626976]">Cargando la cartera…</p>
              ) : dashboard && dashboard.carteraVencida.length > 0 ? (
                <ul className="mt-4 divide-y divide-[#d9dfe5]">
                  {dashboard.carteraVencida.map((cuenta) => (
                    <li key={cuenta.id} className="flex items-center justify-between gap-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#1a1d23]">{cuenta.cliente}</p>
                        <p className="text-sm text-[#626976]">
                          {cuenta.ticket} · {cuenta.diasVencido} día(s)
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold text-[#1a1d23]">
                        {formatearPesos(cuenta.saldoPendiente)}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-base text-[#626976]">
                  Nada vencido. Todo lo que se debe está dentro del plazo.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
