import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { LogoLockup } from "@/components/brand/logo-lockup";
import { Container } from "@/components/layout/container";
import { site } from "@/content/site";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Portal de clientes",
  description: "Entra a tu sistema de nexora-pos.",
  robots: { index: false, follow: false },
};

/**
 * The portal's front door.
 *
 * It lives in its own route group so it never inherits the marketing nav or footer — a client
 * signing in to run their business does not need a "Precios" link.
 *
 * The form is a client component because signing in has to happen in the browser: that is where
 * the session cookie gets written, and `middleware.ts` reads that same cookie to decide whether to
 * serve the client's app.
 */
export default function PortalPage() {
  return (
    <main className="surface-dark bg-ink-900 flex min-h-dvh flex-col items-center justify-center py-16 text-white">
      <Container className="flex max-w-md flex-col items-center text-center">
        <LogoLockup variant="dark" height={40} withDescriptor priority />

        <h1 className="text-h2 mt-12">Entra a tu sistema</h1>
        <p className="text-body text-paper-50/75 mt-4">
          Con el usuario que te entregamos. Si no lo tienes a mano, escríbenos.
        </p>

        {/*
          `useSearchParams` needs a Suspense boundary, or the whole route opts out of static
          rendering at build time.
        */}
        <Suspense fallback={<div className="mt-10 h-64" aria-hidden />}>
          <LoginForm />
        </Suspense>

        <div className="border-paper-50/15 mt-10 flex w-full flex-col items-center gap-4 border-t pt-8">
          <p className="text-small text-paper-50/65">
            ¿Problemas para entrar? Escríbenos y te respondemos nosotros mismos.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacto"
              className="text-small hover:text-brand-300 font-semibold text-white underline underline-offset-4 transition-colors"
            >
              Escríbenos
            </Link>
            <Link
              href="/"
              className="text-small text-paper-50/75 inline-flex items-center gap-1.5 hover:text-white"
            >
              <ArrowLeft aria-hidden className="size-4" />
              Volver a {site.name}
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
