export type PortalRole = "admin" | "manager" | "staff";

export type PortalRolePanel = {
  label: string;
  title: string;
  description: string;
  accent: string;
  summary: string;
  actions: string[];
  quickStats: Array<{ label: string; value: string }>;
};

export function resolvePortalRole(role?: string | null): PortalRole {
  const normalized = role?.toLowerCase?.() ?? "staff";

  if (normalized === "admin") return "admin";
  if (normalized === "manager") return "manager";
  return "staff";
}

export const portalRolePanels: Record<PortalRole, PortalRolePanel> = {
  admin: {
    label: "Vista administrativa",
    title: "Panel de administrador",
    description: "Controla negocio, usuarios y configuración.",
    accent: "Administración",
    summary: "Revisa el estado general del negocio y mantiene la configuración del sistema.",
    actions: ["Usuarios", "Configuración", "Rendimiento"],
    quickStats: [
      { label: "Usuarios", value: "12" },
      { label: "Tiendas", value: "3" },
      { label: "Riesgo", value: "Bajo" },
    ],
  },
  manager: {
    label: "Vista gerencial",
    title: "Panel de gestión",
    description: "Supervisa ventas, operaciones y decisiones del día.",
    accent: "Gestión",
    summary: "Monitorea operación, cartera y resultados sin perder detalle del negocio.",
    actions: ["Reportes", "Caja", "Proveedores"],
    quickStats: [
      { label: "Ventas", value: "$24.8K" },
      { label: "Cobranza", value: "96%" },
      { label: "Pedidos", value: "48" },
    ],
  },
  staff: {
    label: "Vista operativa",
    title: "Panel operativo",
    description: "Tus tareas del día, pedidos y atención al cliente.",
    accent: "Operación",
    summary: "Enfócate en lo que debes atender hoy y en el flujo del negocio en tiempo real.",
    actions: ["Ventas", "Clientes", "Inventario"],
    quickStats: [
      { label: "Turno", value: "Hoy" },
      { label: "Atenciones", value: "17" },
      { label: "Stock", value: "Normal" },
    ],
  },
};
