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
import { createClient } from "@/utils/supabase/client";

export default function PortalPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [configError, setConfigError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setUser(nextUser);
      setIsLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setIsLoading(false);
    });

    void loadSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

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

    setUser(data.user);
    setIsSubmitting(false);
  };

  const handleSignOut = async () => {
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setPassword("");
  };

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
              <p className="text-lg font-bold text-[#1a1d23]">Las dos palmas</p>
              <p className="text-xs text-[#626976]">Configura los datos en Ajustes...</p>
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
              <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1a1d23]">Las dos palmas</h1>
              <p className="mt-1 text-sm text-[#626976]">1 sep 2026</p>
            </div>

            <Button type="button" variant="primary" size="md" onClick={() => {}}>
              <span aria-hidden>＋</span>
              Nuevo pedido
            </Button>
          </header>

          <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-[#d9dfe5] bg-[#f5f5f5] p-4">
              <div className="flex items-center justify-between text-[#626976]">
                <span className="text-sm">Pedidos de hoy</span>
                <span aria-hidden>📝</span>
              </div>
              <div className="mt-5 text-5xl font-black text-[#1a1d23]">0</div>
              <div className="mt-2 text-sm text-[#626976]">0 por entregar · 0,00 kg</div>
            </div>

            <div className="rounded-2xl border border-[#d9dfe5] bg-[#f5f5f5] p-4">
              <div className="flex items-center justify-between text-[#626976]">
                <span className="text-sm">Vendido hoy</span>
                <span aria-hidden>💵</span>
              </div>
              <div className="mt-5 text-5xl font-black text-[#1a1d23]">$0</div>
              <div className="mt-2 text-sm text-[#626976]">$0 cobrado hoy</div>
            </div>

            <div className="rounded-2xl border border-[#d9dfe5] bg-[#f5f5f5] p-4">
              <div className="flex items-center justify-between text-[#626976]">
                <span className="text-sm">Queso disponible</span>
                <span aria-hidden>⚖️</span>
              </div>
              <div className="mt-5 text-5xl font-black text-[#1a1d23]">0,00 kg</div>
              <div className="mt-2 text-sm text-[#626976]">6 producto(s) en el catálogo</div>
            </div>

            <div className="rounded-2xl border border-[#d9dfe5] bg-[#f5f5f5] p-4">
              <div className="flex items-center justify-between text-[#626976]">
                <span className="text-sm">Por acabarse</span>
                <span aria-hidden>⚠️</span>
              </div>
              <div className="mt-5 text-5xl font-black text-[#1a1d23]">0</div>
              <div className="mt-2 text-sm text-[#626976]">Productos por debajo del mínimo</div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl border border-[#d9dfe5] bg-[#f5f5f5] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-black text-[#1a1d23]">Todo lo de hoy</h2>
                <button className="text-sm font-medium text-[#1a1d23]">Ver todos →</button>
              </div>
              <p className="text-base text-[#626976]">Todavía no hay pedidos hoy. ¡Tomar el primero.</p>
            </div>

            <div className="rounded-2xl border border-[#d9dfe5] bg-[#f5f5f5] p-5">
              <h2 className="text-2xl font-black text-[#1a1d23]">Cartera vencida</h2>
              <p className="mt-4 text-base text-[#626976]">Nada vencido. Todo lo que se debe está dentro del plazo.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
