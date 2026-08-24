import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("defaults to type=button so it never submits a form by accident", () => {
    render(<Button>Agendar demo</Button>);
    expect(screen.getByRole("button", { name: "Agendar demo" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("carries ink-900 copy on the orange fill, never white", () => {
    // White on brand-500 measures 2.61:1 and fails AA at every size.
    render(<Button>Agendar demo</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-brand-500");
    expect(button.className).toContain("text-ink-900");
    expect(button.className).not.toContain("text-white");
  });

  it("meets the 44px touch target at every size", () => {
    const heights = { sm: "h-11", md: "h-12", lg: "h-14" } as const;
    for (const [size, expected] of Object.entries(heights)) {
      const { unmount } = render(
        <Button size={size as keyof typeof heights}>Demo</Button>,
      );
      expect(screen.getByRole("button").className).toContain(expected);
      unmount();
    }
  });

  it("renders as its child when asChild is set, without nesting a button", () => {
    render(
      <Button asChild>
        <a href="/contacto">Agendar demo</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Agendar demo" });
    expect(link.tagName).toBe("A");
    expect(link).not.toHaveAttribute("type");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
