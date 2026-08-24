import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps a text colour alongside a named font size", () => {
    // Regression: tailwind-merge read `text-body` as a colour and dropped
    // `text-ink-900`, silently un-styling every sized-and-coloured element.
    expect(cn("text-ink-900", "text-body")).toBe("text-ink-900 text-body");
    expect(cn("text-white", "text-h2")).toBe("text-white text-h2");
    expect(cn("text-brand-700", "text-eyebrow")).toBe("text-brand-700 text-eyebrow");
  });

  it("still lets a later size win over an earlier one", () => {
    expect(cn("text-body", "text-lead")).toBe("text-lead");
    expect(cn("text-h1", "text-h2")).toBe("text-h2");
  });

  it("still lets a later colour win over an earlier one", () => {
    expect(cn("text-ink-500", "text-ink-900")).toBe("text-ink-900");
  });

  it("resolves our custom shadow, tracking and radius groups", () => {
    expect(cn("shadow-card", "shadow-card-hover")).toBe("shadow-card-hover");
    expect(cn("tracking-tight", "tracking-eyebrow")).toBe("tracking-eyebrow");
    expect(cn("rounded-full", "rounded-card")).toBe("rounded-card");
  });
});
