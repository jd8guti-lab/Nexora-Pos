import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
  const originalLocation = window.location;

  beforeEach(() => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
    mockSignInWithPassword.mockResolvedValue({ data: { user: null }, error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockProfileQuery.maybeSingle.mockResolvedValue({ data: { rol: "admin" }, error: null });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("renders the login form for the client portal", async () => {
    render(<PortalPage />);

    expect(await screen.findByRole("heading", { name: "Portal de clientes" })).toBeInTheDocument();
    expect(screen.getByLabelText("Correo")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });

  it("renders the business dashboard after an authenticated user signs in", async () => {
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
    mockProfileQuery.maybeSingle.mockResolvedValue({ data: { rol: "admin" }, error: null });

    render(<PortalPage />);

    expect(await screen.findByRole("heading", { name: /Las dos palmas/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nuevo pedido/i })).toBeInTheDocument();
    expect(screen.getByText(/Pedidos de hoy/i)).toBeInTheDocument();
    expect(screen.getByText(/Todo lo de hoy/i)).toBeInTheDocument();
  });

  it("redirects papas el labrador users to the tenant portal when the session loads", async () => {
    const assignSpy = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, assign: assignSpy },
    });

    mockGetUser.mockResolvedValue({
      data: {
        user: {
          email: "papasellabrador@user.com",
          user_metadata: { tenant_slug: "papas-el-labrador" },
          app_metadata: { tenant_slug: "papas-el-labrador" },
        },
      },
      error: null,
    });

    render(<PortalPage />);

    await waitFor(() =>
      expect(assignSpy).toHaveBeenCalledWith("https://papas-el-labrador.vercel.app")
    );
  });

  it("redirects papas el labrador users to their portal after sign in", async () => {
    const assignSpy = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, assign: assignSpy },
    });

    mockSignInWithPassword.mockResolvedValue({
      data: {
        user: {
          email: "papasellabrador@user.com",
          app_metadata: { tenant_slug: "papas-el-labrador" },
          user_metadata: { tenant_slug: "papas-el-labrador" },
        },
      },
      error: null,
    });

    render(<PortalPage />);

    await screen.findByRole("heading", { name: "Portal de clientes" });

    fireEvent.change(screen.getByLabelText("Correo"), {
      target: { value: "papasellabrador@user.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "12345678" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));

    await waitFor(() =>
      expect(assignSpy).toHaveBeenCalledWith("https://papas-el-labrador.vercel.app")
    );
  });
});
