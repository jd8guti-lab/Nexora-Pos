import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Field, Input } from "./field";

function campo(props: { inverse?: boolean; error?: string }) {
  render(
    <Field label="Correo" required {...props}>
      {(control) => <Input {...control} />}
    </Field>,
  );
  return screen.getByLabelText(/correo/i);
}

describe("Field", () => {
  it("on a light surface, the control stays white with dark text", () => {
    const control = campo({});
    expect(control).toHaveClass("bg-white", "text-ink-900");
  });

  it("on a dark surface, the control is dark too: a white box would glare on ink-900", () => {
    const control = campo({ inverse: true });
    expect(control).not.toHaveClass("bg-white");
    expect(control).toHaveClass("bg-white/5", "text-white", "placeholder:text-paper-50/70");
  });

  it("on a dark surface, the error border uses the orange that can be seen there", () => {
    const control = campo({ inverse: true, error: "Escribe tu correo." });
    expect(control).toHaveClass("border-brand-300");
    expect(control).not.toHaveClass("border-brand-700");
  });
});
