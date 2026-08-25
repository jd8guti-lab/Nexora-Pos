import { NextResponse } from "next/server";
import { leadSchema, looksLikeBot, sendLead } from "@/lib/lead";

/**
 * Contact form endpoint.
 *
 * Revalidates the same schema the browser used. Client-side validation exists
 * to give fast feedback, not to keep anything out — this is the check that
 * counts.
 */
export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "No pudimos leer el formulario." },
      { status: 400 },
    );
  }

  const parsed = leadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Revisa los campos marcados.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  // The honeypot is filled, so this is a bot. Answer 200 and drop it on the
  // floor: telling a spammer it was caught only helps them tune the next
  // attempt. This is why the honeypot is not part of the schema — a 422
  // listing `website` would name the trap.
  if (looksLikeBot(parsed.data)) {
    return NextResponse.json({ ok: true });
  }

  const result = await sendLead(parsed.data);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: "No pudimos enviar tu mensaje. Intenta de nuevo." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
