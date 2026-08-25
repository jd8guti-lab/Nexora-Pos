import { render, screen } from "@testing-library/react";
import type * as FramerMotion from "framer-motion";
import { describe, expect, it, vi } from "vitest";
import { Reveal } from "./reveal";

const mockReducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual<typeof FramerMotion>("framer-motion");
  return { ...actual, useReducedMotion: () => mockReducedMotion.value };
});

describe("Reveal", () => {
  it("tags itself so the noscript fallback can find it", () => {
    // Framer bakes opacity:0 into the SSR markup. Without this hook, a
    // visitor whose JavaScript never runs sees a blank page.
    mockReducedMotion.value = false;
    render(
      <Reveal>
        <p>Conexión</p>
      </Reveal>,
    );
    expect(screen.getByText("Conexión").parentElement).toHaveAttribute("data-reveal");
  });

  it("renders content in place when reduced motion is requested", () => {
    mockReducedMotion.value = true;
    render(
      <Reveal>
        <p>Crecimiento</p>
      </Reveal>,
    );
    const wrapper = screen.getByText("Crecimiento").parentElement!;
    expect(wrapper).not.toHaveAttribute("data-reveal");
    expect(wrapper.style.opacity).toBe("");
  });

  it("keeps the requested tag under reduced motion, so lists stay lists", () => {
    // Swapping an <li> for a <div> would put a stray element inside the <ul>.
    mockReducedMotion.value = true;
    render(
      <ul>
        <Reveal as="li">
          <span>Inventario</span>
        </Reveal>
      </ul>,
    );
    expect(screen.getByRole("listitem")).toBeInTheDocument();
  });
});
