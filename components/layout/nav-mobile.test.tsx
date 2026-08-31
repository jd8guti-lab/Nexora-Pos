import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it } from "vitest";
import { navLinks } from "@/content/nav";
import { NavMobile } from "./nav-mobile";

/**
 * The panel is loaded on first tap, which is the point. Warming the module
 * here makes that resolution instant so the tests measure the component's
 * behaviour and not how fast the module registry happens to be under a
 * parallel run.
 */
beforeAll(async () => {
  await import("./nav-mobile-panel");
});

describe("NavMobile", () => {
  it("opens, traps focus and closes with Escape", async () => {
    const user = userEvent.setup();
    render(<NavMobile />);

    const trigger = screen.getByRole("button", { name: "Abrir el menú" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    // findBy, not getBy: the panel is loaded on demand, so it arrives a tick
    // after the tap.
    const dialog = await screen.findByRole("dialog", { name: "Menú de navegación" });
    expect(dialog).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.keyboard("{Escape}");

    // Both of these are asynchronous by design: the panel unmounts, and only
    // then does focus go back to the trigger. Asserting them synchronously
    // passes alone and flakes under a loaded parallel run.
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("is operable from the keyboard alone", async () => {
    const user = userEvent.setup();
    render(<NavMobile />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Abrir el menú" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("exposes every nav destination once the menu is open", async () => {
    const user = userEvent.setup();
    render(<NavMobile />);
    await user.click(screen.getByRole("button", { name: "Abrir el menú" }));
    await screen.findByRole("dialog");

    for (const label of navLinks.map((l) => l.label)) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: "Agendar una cita" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Acceso clientes" })).toBeInTheDocument();
  });
});
