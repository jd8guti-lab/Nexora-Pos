import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PortalPage from "./page";

const mockGetUser = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();

const mockProfileQuery = {
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: { rol: "admin" }, error: null }),
};

vi.mock("@/utils/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signOut: mockSignOut,
    },
    from: vi.fn(() => mockProfileQuery),
  }),
}));

describe("Portal page", () => {
  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    mockSignInWithPassword.mockResolvedValue({ data: { user: null }, error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockProfileQuery.maybeSingle.mockResolvedValue({ data: { rol: "admin" }, error: null });
  });

  it("renders the login form for the client portal", async () => {
    render(<PortalPage />);

    expect(await screen.findByRole("heading", { name: "Portal de clientes" })).toBeInTheDocument();
    expect(screen.getByLabelText("Correo")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });

  it("renders a role-specific dashboard for an authenticated administrator", async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          email: "admin@demo.com",
          user_metadata: { role: "admin" },
          app_metadata: { role: "admin" },
        },
      },
      error: null,
    });
    mockOnAuthStateChange.mockImplementation(() => ({
      data: {
        subscription: { unsubscribe: vi.fn() },
      },
    }));

    render(<PortalPage />);

    expect(await screen.findByRole("heading", { name: /Panel de administrador/i })).toBeInTheDocument();
    expect(screen.getByText(/Controla negocio, usuarios y configuración/i)).toBeInTheDocument();
    expect(screen.getByText(/Vista administrativa/i)).toBeInTheDocument();
  });
});
