import { z } from "zod";

/**
 * The contact form's contract.
 *
 * One schema, validated twice: in the browser for fast feedback, and again in
 * the Route Handler, because client-side validation is a convenience and
 * never a control.
 */
export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre.")
    .max(80, "Ese nombre es demasiado largo."),
  business: z
    .string()
    .trim()
    .min(2, "Cuéntanos cómo se llama tu negocio.")
    .max(120, "Ese nombre es demasiado largo."),
  email: z
    .string()
    .trim()
    .min(1, "Necesitamos un correo para responderte.")
    .email("Ese correo no parece válido."),
  // Colombian numbers, typed however people actually type them.
  phone: z
    .string()
    .trim()
    .min(7, "Escribe un número de contacto.")
    .max(25, "Ese número es demasiado largo.")
    .regex(/^[\d\s()+-]+$/, "Usa solo números, espacios y los signos + - ( )."),
  businessType: z.string().trim().max(60).optional().or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Cuéntanos un poco más, aunque sean dos frases.")
    .max(2000, "Ese mensaje es demasiado largo."),
  /**
   * Honeypot. Real people never see this field, so anything in it is a bot.
   *
   * Deliberately NOT validated here. If the schema rejected it, the endpoint
   * would answer 422 with `{"website": ["Invalid input"]}` — handing the
   * spammer the name of the trap and exactly how to avoid it. It is checked
   * separately by `looksLikeBot`, and the route drops those requests with a
   * cheerful 200.
   *
   * No reCAPTCHA either: a puzzle punishes the visitor for the spammer's
   * behaviour.
   */
  website: z.string().optional(),
});

export type Lead = z.infer<typeof leadSchema>;

/** True when the honeypot was filled, which only a bot does. */
export function looksLikeBot(lead: Lead): boolean {
  return Boolean(lead.website && lead.website.trim().length > 0);
}

export type SendLeadResult = { ok: true } | { ok: false; error: string };

/**
 * Where a lead goes.
 *
 * TODO(guti): enchufa aquí el servicio de correo (Resend, Postmark, un SMTP
 * propio — lo que uses). Todo lo demás ya está: validación, honeypot y el
 * manejo de errores del formulario. Solo hay que reemplazar el cuerpo de esta
 * función, sin tocar nada más.
 *
 * Until then it writes to the server log, so the flow is testable end to end
 * and nothing is silently dropped.
 */
export async function sendLead(lead: Lead): Promise<SendLeadResult> {
  console.warn(
    "[nexora-pos] Lead recibido (sin servicio de correo configurado):",
    JSON.stringify(
      {
        name: lead.name,
        business: lead.business,
        email: lead.email,
        phone: lead.phone,
        businessType: lead.businessType || null,
        message: lead.message,
        at: new Date().toISOString(),
      },
      null,
      2,
    ),
  );

  return { ok: true };
}
