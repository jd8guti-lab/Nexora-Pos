import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NavMobile } from "./nav-mobile";

describe("NavMobile", () => {
  it("opens, traps focus and closes with Escape", async () => {
    const user = userEvent.setup();
    render(<NavMobile />);

    const trigger = screen.getByRole("button", { name: "Abrir el menú" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Menú de navegación" });
    expect(dialog).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("is operable from the keyboard alone", async () => {
    const user = userEvent.setup();
    render(<NavMobile />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Abrir el menú" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("exposes every nav destination once the menu is open", async () => {
    const user = userEvent.setup();
    render(<NavMobile />);
    await user.click(screen.getByRole("button", { name: "Abrir el menú" }));

    for (const label of ["Módulos", "Casos", "Precios", "Contacto"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Agendar demo" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ingresar al portal" })).toBeInTheDocument();
  });
});
