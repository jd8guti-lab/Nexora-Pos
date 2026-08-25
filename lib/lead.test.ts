import { describe, expect, it } from "vitest";
import { leadSchema, looksLikeBot } from "./lead";

const valid = {
  name: "Juan Gutiérrez",
  business: "Ferretería El Tornillo",
  email: "juan@ejemplo.co",
  phone: "+57 300 123 4567",
  businessType: "Ferretería",
  message: "Vendo por unidad y por bulto y ningún sistema me cuadra eso.",
  website: "",
};

describe("leadSchema", () => {
  it("accepts a normal Colombian enquiry", () => {
    expect(leadSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a phone written the way people actually type it", () => {
    for (const phone of ["3001234567", "(604) 444 33 22", "+57 300-123-4567"]) {
      expect(leadSchema.safeParse({ ...valid, phone }).success).toBe(true);
    }
  });

  it("rejects a phone with letters", () => {
    const result = leadSchema.safeParse({ ...valid, phone: "llámame" });
    expect(result.success).toBe(false);
  });

  it("requires a real email", () => {
    expect(leadSchema.safeParse({ ...valid, email: "juan@" }).success).toBe(false);
  });

  it("asks for more than a one-word message", () => {
    expect(leadSchema.safeParse({ ...valid, message: "hola" }).success).toBe(false);
  });

  it("treats the business type as optional", () => {
    const { businessType: _omitted, ...rest } = valid;
    expect(leadSchema.safeParse(rest).success).toBe(true);
    expect(leadSchema.safeParse({ ...rest, businessType: "" }).success).toBe(true);
  });

  it("does not reject the honeypot, so the 422 never names the trap", () => {
    // If the schema rejected it, the endpoint would answer 422 with
    // {"website": ["Invalid input"]} — telling the spammer exactly which
    // field to leave alone next time. The route drops these with a 200.
    const filled = leadSchema.safeParse({ ...valid, website: "http://spam.example" });
    expect(filled.success).toBe(true);
  });

  it("trims whitespace so a spaces-only name does not slip through", () => {
    expect(leadSchema.safeParse({ ...valid, name: "   " }).success).toBe(false);
    const parsed = leadSchema.safeParse({ ...valid, name: "  Juan  " });
    expect(parsed.success && parsed.data.name).toBe("Juan");
  });

  it("spots a bot by the honeypot, and only by that", () => {
    expect(looksLikeBot({ ...valid, website: "http://spam.example" })).toBe(true);
    expect(looksLikeBot({ ...valid, website: "   " })).toBe(false);
    expect(looksLikeBot({ ...valid, website: "" })).toBe(false);
    expect(looksLikeBot(valid)).toBe(false);
  });

  it("gives every message in Spanish, since the visitor reads them", () => {
    const result = leadSchema.safeParse({ ...valid, name: "", email: "x", message: "" });
    expect(result.success).toBe(false);
    if (result.success) return;
    for (const issue of result.error.issues) {
      expect(issue.message).not.toMatch(/^(Invalid|Required|String|Expected)/);
    }
  });
});
