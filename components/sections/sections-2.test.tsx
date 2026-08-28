import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { faq } from "@/content/faq";
import { pricingComparison, pricingPlans } from "@/content/pricing";
import { processSteps } from "@/content/process";
import { useCasesEmpty, useCasesIntro } from "@/content/use-cases";
import { About } from "./about";
import { CtaBand } from "./cta";
import { Faq } from "./faq";
import { Pricing } from "./pricing";
import { Process } from "./process";
import { UseCases } from "./use-cases";

describe("Process", () => {
  it("is an ordered list, because the order is the content", () => {
    render(<Process />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(processSteps.length);
  });

  it("keeps the decorative rail out of the list", () => {
    // An <ol> may only contain <li>. The timeline rule lives outside it.
    render(<Process />);
    const list = screen.getByRole("list");
    for (const child of Array.from(list.children)) {
      expect(child.tagName).toBe("LI");
    }
  });
});

describe("About", () => {
  it("tells the story of the isotype: conexión, flujo, crecimiento", () => {
    render(<About />);
    for (const title of ["Conexión", "Flujo", "Crecimiento"]) {
      expect(screen.getByRole("heading", { name: title, level: 3 })).toBeInTheDocument();
    }
  });

  it("puts only dt, dd or div directly inside the dl", () => {
    const { container } = render(<About />);
    const dl = container.querySelector("dl")!;
    for (const child of Array.from(dl.children)) {
      expect(["DT", "DD", "DIV"]).toContain(child.tagName);
    }
  });
});

describe("UseCases", () => {
  // The grid is empty on purpose while the content is decided, so what is
  // fixed here is the section's contract with the nav: it renders, it keeps
  // its id, and it still offers the appointment. The six cases stay written in
  // content/use-cases.ts and are not asserted while nothing renders them.
  it("keeps its heading and its #casos anchor, which the nav links to", () => {
    const { container } = render(<UseCases />);
    // The accessible name is title + accent: the heading is split in two
    // spans so the tail can be underlined in brand orange.
    expect(
      screen.getByRole("heading", {
        name: `${useCasesIntro.title} ${useCasesIntro.titleAccent}`,
        level: 2,
      }),
    ).toBeInTheDocument();
    expect(container.querySelector("#casos")).not.toBeNull();
  });

  it("still offers the appointment", () => {
    render(<UseCases />);
    expect(screen.getByRole("link", { name: /agendar una cita/i })).toBeInTheDocument();
  });

  it("says why it is empty instead of inventing a case", () => {
    // The section now promises real implementations, and there are none. §7
    // forbids implying customers we do not have, so the empty state has to
    // stay on the page until a real one replaces it.
    render(<UseCases />);
    expect(
      screen.getByRole("heading", { name: useCasesEmpty.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(useCasesEmpty.body)).toBeInTheDocument();
  });
});

describe("Pricing", () => {
  it("renders the three plans", () => {
    render(<Pricing />);
    for (const plan of pricingPlans) {
      expect(screen.getByRole("heading", { name: plan.name })).toBeInTheDocument();
    }
  });

  it("shows the price placeholders instead of inventing a number", () => {
    // An invented price on a public page is a promise somebody has to honour.
    render(<Pricing />);
    expect(screen.getAllByText(/TODO\(guti\)/).length).toBeGreaterThan(0);
  });

  it("keeps the comparison table collapsed, and reachable without scripting", () => {
    const { container } = render(<Pricing />);
    const details = container.querySelector("details")!;
    expect(details.open).toBe(false);
    // The rows exist in the markup whether or not it is open.
    expect(within(details).getAllByRole("row")).toHaveLength(
      pricingComparison.length + 1,
    );
  });

  it("labels every comparison cell for a screen reader", () => {
    const { container } = render(<Pricing />);
    const details = container.querySelector("details")!;
    expect(within(details).getAllByText("Incluido").length).toBeGreaterThan(0);
    expect(within(details).getAllByText("No incluido").length).toBeGreaterThan(0);
  });
});

describe("Faq", () => {
  it("renders every question as a native disclosure", () => {
    const { container } = render(<Faq />);
    const items = container.querySelectorAll("details");
    expect(items).toHaveLength(faq.length);
    for (const item of faq) {
      expect(screen.getByText(item.question)).toBeInTheDocument();
    }
  });

  it("ships every answer in the markup, readable without scripting", () => {
    // <details> keeps the panel in the DOM whether open or closed, so the
    // answers are there for a reader, a crawler and find-in-page alike.
    render(<Faq />);
    for (const item of faq) {
      expect(screen.getByText(item.answer)).toBeInTheDocument();
    }
  });

  it("starts closed and shares one name, so opening one closes the rest", () => {
    const { container } = render(<Faq />);
    const items = Array.from(container.querySelectorAll("details"));
    expect(items.every((d) => !d.open)).toBe(true);
    expect(new Set(items.map((d) => d.getAttribute("name")))).toEqual(new Set(["faq"]));
  });

  it("keeps the questions that nobody likes answering", () => {
    // Data ownership and leaving are the two that decide a POS sale.
    render(<Faq />);
    expect(screen.getByText(/¿Mis datos son míos\?/)).toBeInTheDocument();
    expect(screen.getByText(/me quiero ir\?/)).toBeInTheDocument();
  });
});

describe("CtaBand", () => {
  it("carries ink-900 copy on the orange, never white", () => {
    // Measured: white drops to 2.61:1 on brand-500 and 1.78:1 at the light
    // end of the gradient. ink-900 holds 6.46:1 across the ramp.
    const { container } = render(<CtaBand />);
    const section = container.querySelector("section")!;
    expect(section.className).toContain("text-ink-900");
    expect(section.className).not.toContain("text-white");
  });

  it("uses the onBrand lockup, which drops the orange isotype", () => {
    render(<CtaBand />);
    // No <img>: the isotype would vanish on orange and may not be recoloured.
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText(/nexora/)).toBeInTheDocument();
  });
});
