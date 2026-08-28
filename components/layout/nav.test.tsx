import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { navLinks } from "@/content/nav";
import { Nav } from "./nav";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

/**
 * The nav links animate letter by letter, which means the visible text is two
 * copies of every letter split across a span each. Read literally that is
 * "MMóódduullooss". These tests exist because a first pass shipped the links
 * with *no* accessible name at all, and nothing caught it.
 */
describe("Nav", () => {
  it("names every main link, despite the letter-swap markup", () => {
    render(<Nav />);
    for (const link of navLinks) {
      expect(screen.getByRole("link", { name: link.label })).toHaveAttribute(
        "href",
        link.href,
      );
    }
  });

  it("hides the duplicated letters from assistive tech", () => {
    const { container } = render(<Nav />);
    // Read the label from content rather than hard-coding it: these links
    // became in-page anchors and the labels changed with them.
    const [first] = navLinks;
    const link = screen.getByRole("link", { name: first!.label });

    // The doubled letters are present visually...
    expect(link.textContent).toContain(first!.label[0]!.repeat(2));
    // ...but behind aria-hidden, so the name above is the only thing read.
    expect(link.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(container.querySelectorAll(".sr-only")).toHaveLength(0);
  });
});
