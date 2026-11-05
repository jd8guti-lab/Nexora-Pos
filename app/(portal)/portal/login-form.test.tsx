import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

const push = vi.fn();
const signInWithPassword = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createClient: () => ({ auth: { signInWithPassword, signOut: vi.fn() } }),
}));

vi.mock("@/lib/portal/tenant", () => ({
  rutaDeTenant: (slug: string) => `/portal/${slug}/`,
  tenantDeMetadatos: () => ({ slug: "las-dos-palmas" }),
}));

function llenarYEnviar() {
  fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "dueno@empresa.com" } });
  fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "una-clave" } });
  fireEvent.click(screen.getByRole("button"));
}

const SESION = { data: { user: { app_metadata: {} } }, error: null };

describe("LoginForm while signing in", () => {
  beforeEach(() => {
    push.mockClear();
    signInWithPassword.mockReset();
  });

  it("shows it is working as soon as the credentials go out", async () => {
    signInWithPassword.mockReturnValue(new Promise(() => {}));
    render(<LoginForm />);
    llenarYEnviar();

    const boton = await screen.findByRole("button", { name: /entrando a tu cuenta/i });
    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute("aria-busy", "true");
    expect(boton.querySelector(".spinner")).not.toBeNull();
  });

  it("keeps waiting after signing in: the application still has to open", async () => {
    signInWithPassword.mockResolvedValue(SESION);
    render(<LoginForm />);
    llenarYEnviar();

    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(await screen.findByRole("button", { name: /entrando a tu cuenta/i })).toBeDisabled();
  });

  it("announces it to a screen reader, not only with the animation", async () => {
    signInWithPassword.mockReturnValue(new Promise(() => {}));
    render(<LoginForm />);
    llenarYEnviar();

    await screen.findByRole("button", { name: /entrando a tu cuenta/i });
    expect(screen.getByRole("status")).toHaveTextContent(/entrando a tu cuenta/i);
  });

  it("gives the button back if the password is wrong", async () => {
    signInWithPassword.mockResolvedValue({ data: {}, error: new Error("no") });
    render(<LoginForm />);
    llenarYEnviar();

    expect(await screen.findByRole("alert")).toHaveTextContent(/incorrectos/i);
    const boton = screen.getByRole("button", { name: "Entrar" });
    expect(boton).toBeEnabled();
    expect(boton.querySelector(".spinner")).toBeNull();
  });

  it("gives the button back when the browser's Back returns to this page", async () => {
    signInWithPassword.mockResolvedValue(SESION);
    render(<LoginForm />);
    llenarYEnviar();
    await screen.findByRole("button", { name: /entrando a tu cuenta/i });
    await waitFor(() => expect(push).toHaveBeenCalled());

    act(() => {
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }));
    });

    expect(await screen.findByRole("button", { name: "Entrar" })).toBeEnabled();
  });
});
