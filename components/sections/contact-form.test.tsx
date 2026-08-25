import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContactForm } from "./contact-form";

function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  const spy = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({}), ...response });
  vi.stubGlobal("fetch", spy);
  return spy;
}

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Tu nombre/), "Juan Gutiérrez");
  await user.type(screen.getByLabelText(/Tu negocio/), "Ferretería El Tornillo");
  await user.type(screen.getByLabelText(/Correo/), "juan@ejemplo.co");
  await user.type(screen.getByLabelText(/WhatsApp/), "3001234567");
  await user.type(
    screen.getByLabelText(/Qué necesitas/),
    "Vendo por unidad y por bulto y ningún sistema me cuadra eso.",
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("ContactForm", () => {
  it("ties every field to its label", () => {
    render(<ContactForm />);
    for (const label of [
      /Tu nombre/,
      /Tu negocio/,
      /Correo/,
      /WhatsApp/,
      /Qué necesitas/,
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("shows Spanish errors and does not post an invalid form", async () => {
    const user = userEvent.setup();
    const fetchSpy = mockFetch({});
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: /Enviar mensaje/ }));

    expect(await screen.findByText("Escribe tu nombre.")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("links an error to its input with aria-describedby and aria-invalid", async () => {
    const user = userEvent.setup();
    mockFetch({});
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: /Enviar mensaje/ }));

    const input = await screen.findByLabelText(/Tu nombre/);
    await waitFor(() => expect(input).toHaveAttribute("aria-invalid", "true"));
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)).toHaveTextContent("Escribe tu nombre.");
  });

  it("posts to the API and confirms when it succeeds", async () => {
    const user = userEvent.setup();
    const fetchSpy = mockFetch({ ok: true });
    render(<ContactForm />);

    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /Enviar mensaje/ }));

    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith("/api/contacto", expect.anything()),
    );
    expect(await screen.findByText("Listo, ya nos llegó")).toBeInTheDocument();
  });

  it("tells the visitor when the server refuses, instead of failing silently", async () => {
    const user = userEvent.setup();
    mockFetch({
      ok: false,
      json: async () => ({ error: "Revisa los campos marcados." }),
    });
    render(<ContactForm />);

    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /Enviar mensaje/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Revisa los campos marcados.",
    );
  });

  it("survives the network being down", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<ContactForm />);

    await fillValid(user);
    await user.click(screen.getByRole("button", { name: /Enviar mensaje/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/Revisa tu internet/);
  });

  it("keeps the honeypot out of sight and out of the tab order", () => {
    const { container } = render(<ContactForm />);
    const honeypot = container.querySelector<HTMLInputElement>("#website")!;
    expect(honeypot).toBeInTheDocument();
    expect(honeypot.tabIndex).toBe(-1);
    expect(honeypot.closest("[aria-hidden]")).not.toBeNull();

    // Not in the accessibility tree, so a screen reader never offers it.
    // Queried by role rather than by label: role queries honour aria-hidden,
    // getByLabelText does not.
    const announced = screen
      .queryAllByRole("textbox")
      .filter((el) => el.id === honeypot.id);
    expect(announced).toHaveLength(0);
  });
});
