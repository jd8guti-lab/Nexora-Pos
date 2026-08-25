import type * as LeadModule from "@/lib/lead";
import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/lead", async () => {
  const actual = await vi.importActual<typeof LeadModule>("@/lib/lead");
  return { ...actual, sendLead: vi.fn(async () => ({ ok: true as const })) };
});

const { sendLead } = await import("@/lib/lead");

const valid = {
  name: "Juan Gutiérrez",
  business: "Ferretería El Tornillo",
  email: "juan@ejemplo.co",
  phone: "+57 300 123 4567",
  message: "Vendo por unidad y por bulto y ningún sistema me cuadra eso.",
  website: "",
};

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

describe("POST /api/contacto", () => {
  it("accepts a valid lead and hands it to sendLead", async () => {
    vi.mocked(sendLead).mockClear();
    const response = await post(valid);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(sendLead).toHaveBeenCalledOnce();
  });

  it("revalidates on the server, whatever the browser allowed through", async () => {
    const response = await post({ ...valid, email: "no-es-un-correo" });
    expect(response.status).toBe(422);
    const body = (await response.json()) as { fields: Record<string, string[]> };
    expect(body.fields.email?.[0]).toBe("Ese correo no parece válido.");
  });

  it("drops a bot silently, without naming the honeypot", async () => {
    // A 422 listing `website` would tell the spammer which field is the trap
    // and exactly how to get past it next time.
    vi.mocked(sendLead).mockClear();
    const response = await post({ ...valid, website: "http://spam.example" });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true });
    expect(JSON.stringify(body)).not.toContain("website");
    // And it never reaches the inbox.
    expect(sendLead).not.toHaveBeenCalled();
  });

  it("handles a body that is not JSON", async () => {
    const response = await post("esto no es json");
    expect(response.status).toBe(400);
  });

  it("reports a delivery failure instead of pretending it worked", async () => {
    vi.mocked(sendLead).mockResolvedValueOnce({ ok: false, error: "smtp caído" });
    const response = await post(valid);
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({ ok: false });
  });
});
