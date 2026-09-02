import { describe, expect, it } from "vitest";
import { rutaDeTenant, slugDeRuta, tenantDeMetadatos } from "./tenant";

describe("tenantDeMetadatos", () => {
  it("reads the company out of app_metadata", () => {
    expect(tenantDeMetadatos({ tenant_id: "abc", tenant_slug: "papas-el-labrador" })).toEqual({
      id: "abc",
      slug: "papas-el-labrador",
    });
  });

  it.each([
    ["nothing at all", undefined],
    ["null", null],
    ["a string", "papas-el-labrador"],
    ["an empty object", {}],
    ["only the id", { tenant_id: "abc" }],
    ["only the slug", { tenant_slug: "papas-el-labrador" }],
    ["an empty id", { tenant_id: "", tenant_slug: "papas-el-labrador" }],
    ["an empty slug", { tenant_id: "abc", tenant_slug: "" }],
    ["a numeric id", { tenant_id: 7, tenant_slug: "papas-el-labrador" }],
  ])("refuses %s", (_caso, metadatos) => {
    expect(tenantDeMetadatos(metadatos)).toBeNull();
  });

  it("does not accept a tenant nested under another key", () => {
    // The whole point is that this comes from `app_metadata`, which the user cannot write. Reading
    // it from anywhere else would let a client reassign itself to another company.
    expect(tenantDeMetadatos({ user_metadata: { tenant_id: "x", tenant_slug: "y" } })).toBeNull();
  });
});

describe("slugDeRuta", () => {
  it.each([
    ["/portal/papas-el-labrador", "papas-el-labrador"],
    ["/portal/papas-el-labrador/", "papas-el-labrador"],
    ["/portal/papas-el-labrador/pedidos", "papas-el-labrador"],
    ["/portal/papas-el-labrador/assets/index-abc.js", "papas-el-labrador"],
  ])("%s → %s", (ruta, esperado) => {
    expect(slugDeRuta(ruta)).toBe(esperado);
  });

  it.each(["/portal", "/portal/"])("%s is the login page, not a tenant", (ruta) => {
    expect(slugDeRuta(ruta)).toBeNull();
  });
});

describe("rutaDeTenant", () => {
  it("ends with a slash so the app's own router takes over cleanly", () => {
    expect(rutaDeTenant("papas-el-labrador")).toBe("/portal/papas-el-labrador/");
  });
});
