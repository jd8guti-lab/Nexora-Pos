"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { LogoLockup } from "@/components/brand/logo-lockup";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";
import { createClient } from "@/utils/supabase/client";

export default function PortalPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("papasellabrador@user.com");
  const [password, setPassword] = useState("Papaslabrador5173");
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

      setUser(data.user);
      setIsLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
    <main className="surface-dark bg-ink-900 flex min-h-dvh flex-col items-center justify-center py-16 text-white">
      <Container className="flex max-w-3xl flex-col items-center text-center">
        <LogoLockup variant="dark" height={40} withDescriptor priority />

        <div className="mt-12 w-full rounded-2xl border border-paper-50/15 bg-paper-50/5 p-8 text-left shadow-xl shadow-black/10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-brand-500">Portal activo</p>
              <h1 className="text-h2 mt-2">Bienvenido</h1>
            </div>
            <Button type="button" variant="inverseOutline" size="md" onClick={handleSignOut}>
              <LogOut aria-hidden />
              Cerrar sesión
            </Button>
          </div>

          <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-5">
            <div className="flex items-center gap-3 text-brand-300">
              <ShieldCheck aria-hidden />
              <span className="text-sm font-medium uppercase tracking-[0.2em]">Acceso autorizado</span>
            </div>
            <p className="mt-4 text-xl font-semibold text-white">
              {user.email ?? "Usuario autenticado"}
            </p>
            <p className="mt-2 text-paper-50/80">
              El portal del negocio ya quedó conectado a tu sesión de Supabase.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-paper-50/15 bg-paper-50/5 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-paper-50/60">Tenant</p>
              <p className="mt-3 text-lg font-semibold text-white">Papas el Labrador</p>
            </div>
            <div className="rounded-xl border border-paper-50/15 bg-paper-50/5 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-paper-50/60">Estado</p>
              <p className="mt-3 text-lg font-semibold text-white">Portal operativo</p>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <Button asChild variant="inverse" size="md">
              <Link href="/">Volver al sitio</Link>
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
