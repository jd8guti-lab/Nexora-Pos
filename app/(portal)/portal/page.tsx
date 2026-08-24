import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoLockup } from "@/components/brand/logo-lockup";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Portal de clientes",
  description: "El portal de clientes de nexora-pos. Muy pronto.",
  robots: { index: false, follow: false },
};

/**
 * Placeholder for the customer portal.
 *
 * It lives in its own route group so the real portal — auth, tenants,
 * dashboards — can grow here later without touching the marketing site.
 * It deliberately does not use the marketing nav or footer.
 */
export default function PortalPage() {
  return (
    <main className="surface-dark bg-ink-900 flex min-h-dvh flex-col items-center justify-center py-16 text-white">
      <Container className="flex max-w-lg flex-col items-center text-center">
        <LogoLockup variant="dark" height={40} withDescriptor priority />

        <h1 className="text-h1 mt-12">Portal de clientes</h1>
        <p className="text-lead text-paper-50/80 mt-5">
          Aquí vas a entrar a tu sistema. Todavía no está listo: estamos construyéndolo.
        </p>
        <p className="text-body text-paper-50/65 mt-3">
          Si ya eres cliente de {site.name} y necesitas algo, escríbenos y te respondemos
          nosotros mismos.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild variant="inverse" size="md">
            <Link href="/contacto">Escríbenos</Link>
          </Button>
          <Button asChild variant="inverseOutline" size="md">
            <Link href="/">
              <ArrowLeft aria-hidden />
              Volver al sitio
            </Link>
          </Button>
        </div>
      </Container>
    </main>
  );
}
