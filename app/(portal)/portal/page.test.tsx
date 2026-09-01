import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PortalPage from "./page";

vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  }),
}));

describe("Portal page", () => {
  it("renders the login form for the client portal", async () => {
    render(<PortalPage />);

    expect(await screen.findByRole("heading", { name: "Portal de clientes" })).toBeInTheDocument();
    expect(screen.getByLabelText("Correo")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });
});
