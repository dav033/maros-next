import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LeadType } from "@/leads/domain";

import { LeadTypeScopeControl } from "./LeadTypeScopeControl";

afterEach(cleanup);

function arrange(value: LeadType[] | null) {
  const onChange = vi.fn();
  render(<LeadTypeScopeControl value={value} onChange={onChange} />);
  return { onChange };
}

/** El menú de Radix no se abre bajo jsdom, así que el desplegable se prueba por el trigger. */
describe("LeadTypeScopeControl", () => {
  it("says the user sees everything when there is no restriction", () => {
    arrange(null);

    expect(
      screen.getByRole("button", { name: "Tipos de lead que puede ver" }),
    ).toHaveTextContent("Todos los tipos");
  });

  it("lists the types the user is restricted to", () => {
    arrange([LeadType.PLUMBING, LeadType.ROOFING]);

    expect(
      screen.getByRole("button", { name: "Tipos de lead que puede ver" }),
    ).toHaveTextContent("Plumbing, Roofing");
  });

  /**
   * Una lista vacía se lee igual que "todos", no como "ninguno". Guardar un
   * array vacío dejaría una pantalla sin leads indistinguible de un fallo — y
   * el backend lo rechaza, en el DTO y con un CHECK.
   */
  it("reads an empty list as no restriction", () => {
    arrange([]);

    expect(
      screen.getByRole("button", { name: "Tipos de lead que puede ver" }),
    ).toHaveTextContent("Todos los tipos");
  });

  it("can be disabled", () => {
    const onChange = vi.fn();
    render(<LeadTypeScopeControl value={null} disabled onChange={onChange} />);

    const trigger = screen.getByRole("button", { name: "Tipos de lead que puede ver" });
    expect(trigger).toBeDisabled();
    fireEvent.click(trigger);
    expect(onChange).not.toHaveBeenCalled();
  });
});
