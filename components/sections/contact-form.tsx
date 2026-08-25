"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Heading } from "@/components/ui/heading";
import { useCases } from "@/content/use-cases";
import { leadSchema, type Lead } from "@/lib/lead";

type Status = "idle" | "sending" | "sent" | "error";

/**
 * The contact form.
 *
 * Validated with the same Zod schema the Route Handler uses, so the two can
 * never drift apart. `noValidate` hands validation to us rather than the
 * browser: one set of messages, in our voice, in Spanish.
 *
 * The outcome goes in a live region — a visitor using a screen reader must
 * not have to guess whether the send worked.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Lead>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      business: "",
      email: "",
      phone: "",
      businessType: "",
      message: "",
      website: "",
    },
  });

  async function onSubmit(values: Lead) {
    setStatus("sending");
    setServerError(null);

    try {
      const response = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setServerError(body?.error ?? "No pudimos enviar tu mensaje.");
        setStatus("error");
        return;
      }

      reset();
      setStatus("sent");
    } catch {
      setServerError("No pudimos conectar. Revisa tu internet e intenta de nuevo.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="rounded-card border-brand-500/40 flex flex-col items-start gap-4 border bg-white p-7"
      >
        <CheckCircle2 className="text-brand-700 size-8" aria-hidden />
        <Heading as="h3" size="h3">
          Listo, ya nos llegó
        </Heading>
        <p className="text-body text-ink-500">
          Te respondemos nosotros mismos, no un formulario automático. Si es urgente,
          escríbenos por WhatsApp y vamos más rápido.
        </p>
        <Button variant="secondary" onClick={() => setStatus("idle")}>
          Enviar otro mensaje
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Tu nombre" error={errors.name?.message} required>
          {(props) => <Input autoComplete="name" {...props} {...register("name")} />}
        </Field>

        <Field label="Tu negocio" error={errors.business?.message} required>
          {(props) => (
            <Input autoComplete="organization" {...props} {...register("business")} />
          )}
        </Field>

        <Field label="Correo" error={errors.email?.message} required>
          {(props) => (
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              {...props}
              {...register("email")}
            />
          )}
        </Field>

        <Field label="WhatsApp o teléfono" error={errors.phone?.message} required>
          {(props) => (
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              {...props}
              {...register("phone")}
            />
          )}
        </Field>
      </div>

      <Field label="Tipo de negocio" error={errors.businessType?.message}>
        {(props) => (
          <Select {...props} {...register("businessType")}>
            <option value="">Selecciona uno</option>
            {useCases.map((useCase) => (
              <option key={useCase.id} value={useCase.business}>
                {useCase.business}
              </option>
            ))}
            <option value="Otro">Otro</option>
          </Select>
        )}
      </Field>

      <Field
        label="¿Qué necesitas?"
        hint="Cuéntanos cómo trabajas hoy y qué te está costando trabajo. Entre más concreto, mejor te podemos responder."
        error={errors.message?.message}
        required
      >
        {(props) => <Textarea rows={5} {...props} {...register("message")} />}
      </Field>

      {/*
        Honeypot. Hidden from sight and from the accessibility tree, and out of
        the tab order — a person will never fill it, so anything in it is a
        bot. This is why there is no reCAPTCHA: a puzzle punishes the visitor
        for the spammer's behaviour.
      */}
      <div aria-hidden className="hidden">
        <label htmlFor="website">No llenes este campo</label>
        <input
          id="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={status === "sending"}>
          {status === "sending" ? "Enviando…" : "Enviar mensaje"}
          <Send aria-hidden />
        </Button>
        <p className="text-small text-ink-500">
          Te contactamos por donde prefieras. No compartimos tus datos con nadie.
        </p>
      </div>

      {/* Always in the DOM so the live region exists before it has content. */}
      <p role="alert" className="text-body text-brand-700 font-medium empty:hidden">
        {status === "error" && serverError ? serverError : ""}
      </p>
    </form>
  );
}
