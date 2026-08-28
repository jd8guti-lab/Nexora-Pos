import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { problem } from "@/content/home";
import { modules } from "@/content/modules";
import { pillars } from "@/content/pillars";
import { trustMetrics } from "@/content/site";
import { Modules } from "./modules";
import { Pillars } from "./pillars";
import { Problem } from "./problem";
import { TrustBar } from "./trust-bar";

describe("Pillars", () => {
  it("renders the six pillars from the manual, and only those", () => {
    render(<Pillars />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(6);
    expect(pillars).toHaveLength(6);
    for (const pillar of pillars) {
      expect(
        screen.getByRole("heading", { name: pillar.title, level: 3 }),
      ).toBeInTheDocument();
      expect(screen.getByText(pillar.description)).toBeInTheDocument();
    }
  });
});

describe("Modules", () => {
  it("renders the seven modules from the manual, and only those", () => {
    render(<Modules />);
    const links = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("href")?.startsWith("/modulos#"));
    expect(links).toHaveLength(7);
    expect(modules).toHaveLength(7);
  });

  it("points every module card at its own anchor on /modulos", () => {
    render(<Modules />);
    for (const mod of modules) {
      const link = screen.getByRole("link", { name: mod.name });
      expect(link).toHaveAttribute("href", `/modulos#${mod.id}`);
    }
  });

  it("names each link after its module, not after the whole card", () => {
    // The clickable area covers the card, but the accessible name must stay
    // the module name — otherwise a screen reader reads icon, heading and
    // paragraph as one long link label.
    render(<Modules />);
    const link = screen.getByRole("link", { name: "Inventario" });
    expect(link.textContent?.trim()).toBe("Inventario");
  });
});

describe("TrustBar", () => {
  it("renders every metric from content, with nothing hardcoded in the JSX", () => {
    render(<TrustBar />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(trustMetrics.length);
    for (const metric of trustMetrics) {
      expect(screen.getByText(metric.value)).toBeInTheDocument();
      expect(screen.getByText(metric.label)).toBeInTheDocument();
    }
  });

  it("claims nothing about the company that we cannot back up", () => {
    // CLAUDE.md §7: no client counts, no years in business, no testimonials.
    render(<TrustBar />);
    const text = screen.getByRole("list").textContent ?? "";
    expect(text).not.toMatch(/\d+\s*(clientes|empresas|negocios|años|instalaciones)/i);
  });
});

describe("Problem", () => {
  it("gives both columns the same shape, so the comparison stays fair", () => {
    render(<Problem />);
    const [canned, tailored] = screen.getAllByRole("list");
    expect(within(canned!).getAllByRole("listitem")).toHaveLength(5);
    expect(within(tailored!).getAllByRole("listitem")).toHaveLength(5);
  });

  it("keeps the VS badge out of the accessibility tree", () => {
    const { container } = render(<Problem />);
    // "versus" is what two columns titled this way already mean; announcing
    // "VS" between them adds nothing. The lists carry the comparison.
    const badge = [...container.querySelectorAll("span")].find(
      (el) => el.textContent === "VS",
    );
    expect(badge).toBeDefined();
    expect(badge).toHaveAttribute("aria-hidden");
  });

  it("shows each column's subtitle and the emphasis of every point", () => {
    render(<Problem />);
    for (const column of [problem.canned, problem.tailored]) {
      expect(screen.getByText(column.subtitle)).toBeInTheDocument();
      for (const point of column.points) {
        expect(screen.getByText(point.emphasis)).toBeInTheDocument();
      }
    }
  });

  it("uses h3 for the column titles, under the section's h2", () => {
    render(<Problem />);
    expect(
      screen.getByRole("heading", { name: problem.canned.title, level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: problem.tailored.title, level: 3 }),
    ).toBeInTheDocument();
  });
});
