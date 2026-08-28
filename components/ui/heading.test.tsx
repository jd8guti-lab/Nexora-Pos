import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Eyebrow } from "./eyebrow";
import { Heading } from "./heading";

describe("Heading", () => {
  it("keeps the semantic level independent of the visual size", () => {
    // This is the whole point: a section can look small without demoting its
    // place in the document outline, so headings never skip a level.
    render(
      <Heading as="h2" size="h3">
        Punto de venta
      </Heading>,
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.tagName).toBe("H2");
    expect(heading.className).toContain("text-h3");
  });

  it("defaults to h2, the level a section title needs", () => {
    render(<Heading>Módulos</Heading>);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("uses brand-500 for the accent tone — an authorised exception, not a slip", () => {
    // This one FAILS AA: 2.61:1 on white where 13px text needs 4.5:1. The user
    // asked for the bright orange with that number in front of him, and it is
    // listed in scripts/contrast.mjs under authorised exceptions. The test
    // exists so that changing it back is a deliberate act, not a drive-by.
    render(<Eyebrow tone="accent">Sistema de diseño</Eyebrow>);
    const el = screen.getByText("Sistema de diseño");
    expect(el.className).toContain("text-brand-500");
  });

  it("renders an eyebrow as a paragraph, not a heading", () => {
    // An eyebrow is a label. Marking it up as a heading would put a phantom
    // level in the outline.
    render(<Eyebrow>Lo que nos define</Eyebrow>);
    expect(screen.getByText("Lo que nos define").tagName).toBe("P");
    expect(screen.queryByRole("heading")).toBeNull();
  });
});
