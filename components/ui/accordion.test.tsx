import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

function Faq() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="a">
        <AccordionTrigger>¿Mis datos son míos?</AccordionTrigger>
        <AccordionContent>Sí, y te los puedes llevar.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>¿Funciona sin internet?</AccordionTrigger>
        <AccordionContent>Respuesta de ejemplo.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="c">
        <AccordionTrigger>¿Sirve para varias sedes?</AccordionTrigger>
        <AccordionContent>Otra respuesta.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("points aria-controls at its panel even while collapsed", () => {
    // Radix drops aria-controls when the panel's children are unmounted, but
    // the panel element is still in the DOM and the WAI-ARIA accordion
    // pattern wants the reference either way. AccordionItem supplies the id.
    render(<Faq />);

    const trigger = screen.getByRole("button", { name: "¿Mis datos son míos?" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    const panelId = trigger.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();

    const panel = document.getElementById(panelId!);
    expect(panel).not.toBeNull();
    expect(panel).toHaveAttribute("role", "region");
    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
  });

  it("keeps the reference intact once opened, and reveals the answer", async () => {
    const user = userEvent.setup();
    render(<Faq />);

    const trigger = screen.getByRole("button", { name: "¿Mis datos son míos?" });
    const panelId = trigger.getAttribute("aria-controls");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger.getAttribute("aria-controls")).toBe(panelId);
    expect(document.getElementById(panelId!)).toHaveTextContent(
      "Sí, y te los puedes llevar.",
    );
  });

  it("gives every item its own panel id", () => {
    render(<Faq />);
    const ids = screen.getAllByRole("button").map((b) => b.getAttribute("aria-controls"));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("moves between questions with the arrow keys", async () => {
    const user = userEvent.setup();
    render(<Faq />);

    const [first, second] = screen.getAllByRole("button");
    first!.focus();
    expect(first).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    expect(second).toHaveFocus();

    await user.keyboard("{ArrowUp}");
    expect(first).toHaveFocus();
  });

  it("jumps to the ends with Home and End", async () => {
    const user = userEvent.setup();
    render(<Faq />);

    const triggers = screen.getAllByRole("button");
    triggers[1]!.focus();

    await user.keyboard("{End}");
    expect(triggers.at(-1)).toHaveFocus();

    await user.keyboard("{Home}");
    expect(triggers[0]).toHaveFocus();
  });

  it("opens with Enter and with Space, toggling exactly once per press", async () => {
    // A <button> turns Enter into a native click. If anything also handled
    // the keydown, each press would toggle twice and the panel would never
    // open. This pins that down.
    const user = userEvent.setup();
    render(<Faq />);
    const trigger = screen.getByRole("button", { name: "¿Mis datos son míos?" });

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.keyboard(" ");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("collapses an open item when it is clicked again", async () => {
    const user = userEvent.setup();
    render(<Faq />);
    const trigger = screen.getByRole("button", { name: "¿Mis datos son míos?" });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
