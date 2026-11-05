import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/sections/hero";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "./reveal";
import { ScrollProgress } from "./scroll-progress";

const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
const reducedMotion = css.slice(css.indexOf("@media (prefers-reduced-motion: reduce)"));

describe("Reveal directions", () => {
  it("rises by default", () => {
    render(<Reveal>Texto</Reveal>);
    expect(screen.getByText("Texto")).toHaveAttribute("data-reveal", "");
  });

  it("can enter from a side, and says so in the attribute the CSS reads", () => {
    render(<Reveal from="left">Texto</Reveal>);
    expect(screen.getByText("Texto")).toHaveAttribute("data-reveal", "left");
  });

  it("every direction has its starting position in the CSS", () => {
    for (const from of ["left", "right", "zoom"]) {
      expect(css).toContain(`[data-reveal="${from}"][data-reveal-armed]:not([data-revealed])`);
    }
  });
});

describe("hover", () => {
  it("a button lifts, and gives way when pressed", () => {
    render(<Button>Entrar</Button>);
    expect(screen.getByRole("button")).toHaveClass("hover:-translate-y-0.5", "active:scale-[0.98]");
  });

  it("the arrow inside a button moves with it", () => {
    render(<Button>Entrar</Button>);
    expect(screen.getByRole("button")).toHaveClass("hover:[&_svg]:translate-x-1");
  });

  it("a text link does not lift: it sits inside a sentence", () => {
    render(<Button variant="link">Ver más</Button>);
    expect(screen.getByRole("button")).not.toHaveClass("hover:-translate-y-0.5");
  });

  it("an interactive card lets what is inside it react", () => {
    render(<Card interactive>Módulo</Card>);
    expect(screen.getByText("Módulo")).toHaveClass("group");
  });
});

describe("the hero's entrance", () => {
  it("runs on CSS alone: every line of copy is staged, with its own delay", () => {
    const { container } = render(<Hero />);
    const lines = Array.from(container.querySelectorAll<HTMLElement>(".motion-enter"));
    expect(lines.length).toBeGreaterThanOrEqual(6);
    const delays = lines.map((line) => line.style.getPropertyValue("--enter-delay"));
    expect(new Set(delays).size).toBe(lines.length);
  });
});

describe("scroll progress", () => {
  it("is decoration, so assistive technology does not hear it", () => {
    const { container } = render(<ScrollProgress />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("only exists where the browser can drive it from the scroll", () => {
    expect(css).toContain("@supports (animation-timeline: scroll())");
  });
});

describe("without having to switch anything on", () => {
  /*
    The user's decision, 5 November 2026: the animations have to show on a machine with Windows'
    animation effects off. That setting is what `prefers-reduced-motion` reports.
  */
  it.each([".motion-enter", ".hero-settle", ".scroll-progress", ".spinner", "[data-reveal]", "animation-duration"])(
    "does not turn off %s",
    (selector) => {
      expect(reducedMotion).not.toContain(selector);
    },
  );

  it("keeps parallax as the one exception: it is the motion that can make someone dizzy", () => {
    expect(reducedMotion).toContain(".hero-parallax");
  });

  it("no component opts out on its own", () => {
    for (const ruta of ["components/ui/button.tsx", "components/ui/card.tsx", "components/ui/icon-tile.tsx"]) {
      expect(readFileSync(join(process.cwd(), ruta), "utf8")).not.toContain("motion-reduce");
    }
  });
});
