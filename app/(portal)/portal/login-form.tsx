"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createClient } from "@/lib/supabase/browser";
import { rutaDeTenant, tenantDeMetadatos } from "@/lib/portal/tenant";

const esquema = z.object({
  email: z.string().min(1, "Escribe tu correo.").email("Ese correo no parece válido."),
  password: z.string().min(1, "Escribe tu contraseña."),
});

type Credenciales = z.infer<typeof esquema>;

export function LoginForm() {
  const router = useRouter();
  const parametros = useSearchParams();
  const [errorGeneral, setErrorGeneral] = useState<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Credenciales>({ resolver: zodResolver(esquema) });

  async function entrar({ email, password }: Credenciales) {
    setErrorGeneral(undefined);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Deliberately the same message for a wrong password and an unknown account: telling them
      // apart is how you find out which addresses are customers of ours.
      setErrorGeneral("Correo o contraseña incorrectos.");
      return;
    }

    const tenant = tenantDeMetadatos(data.user.app_metadata);
    if (tenant === null) {
      setErrorGeneral(
        "Tu usuario existe pero todavía no está asociado a una empresa. Escríbenos y lo arreglamos.",
      );
      await supabase.auth.signOut();
      return;
    }

    // Back to where they were headed, but only if it is inside their own company's app: a
    // `?destino=` from a crafted link must not become an open redirect.
    const destino = parametros.get("destino");
    const suyo = rutaDeTenant(tenant.slug);
    router.push(destino?.startsWith(suyo) ? destino : suyo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(entrar)} noValidate className="mt-10 flex w-full flex-col gap-6">
      <Field label="Correo" error={errors.email?.message} required inverse>
        {(props) => (
          <Input
            {...props}
            {...register("email")}
            type="email"
            autoComplete="username"
            autoFocus
            placeholder="tucorreo@empresa.com"
          />
        )}
      </Field>

      <Field label="Contraseña" error={errors.password?.message} required inverse>
        {(props) => (
          <Input {...props} {...register("password")} type="password" autoComplete="current-password" />
        )}
      </Field>

      {errorGeneral ? (
        // `role="alert"` so a screen reader announces it: the message appears without the focus
        // moving, and otherwise it would go by unnoticed.
        <p role="alert" className="text-small text-brand-300 font-medium">
          {errorGeneral}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
