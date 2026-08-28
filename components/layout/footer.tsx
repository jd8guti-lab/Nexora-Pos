import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { LogoLockup } from "@/components/brand/logo-lockup";
import { footerColumns } from "@/content/nav";
import { contact, site } from "@/content/site";
import { Container } from "./container";

const channelIcon = {
  whatsapp: MessageCircle,
  email: Mail,
  city: MapPin,
} as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="surface-dark bg-ink-900 text-white">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-[1.2fr_2fr] md:py-20">
          <div>
            <LogoLockup variant="dark" height={34} withDescriptor />
            <p className="text-body text-paper-50/75 mt-5 max-w-xs">{site.tagline}</p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="text-eyebrow tracking-eyebrow text-paper-50/60">
                  {column.title}
                </h2>
                <ul className="mt-4 flex flex-col gap-1">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="ease-brand text-body text-paper-50/85 inline-flex min-h-11 items-center transition-colors duration-200 hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 py-8">
          <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-8">
            {contact.map((channel) => {
              const Icon = channelIcon[channel.kind];
              const body = (
                <>
                  <Icon className="text-brand-500 size-4 shrink-0" aria-hidden />
                  <span className="sr-only">{channel.label}: </span>
                  <span>{channel.value}</span>
                </>
              );
              return (
                <li key={channel.kind}>
                  {channel.href ? (
                    <a
                      href={channel.href}
                      // WhatsApp opens in another app; mail and tel do not.
                      {...(channel.href.startsWith("http")
                        ? { target: "_blank", rel: "noreferrer" }
                        : {})}
                      className="text-body text-paper-50/85 inline-flex min-h-11 items-center gap-2 hover:text-white"
                    >
                      {body}
                    </a>
                  ) : (
                    <span className="text-body text-paper-50/85 inline-flex min-h-11 items-center gap-2">
                      {body}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="text-small text-paper-50/60 flex flex-col gap-2 border-t border-white/10 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {site.name}. Todos los derechos reservados.
          </p>
          <p className="tracking-eyebrow uppercase">{site.descriptor}</p>
        </div>
      </Container>
    </footer>
  );
}
