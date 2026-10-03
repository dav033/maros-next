import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Project } from "@/project/domain";

const routerPush = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPush, replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
}));

import { useProjectsTableLogic } from "./useProjectsTableLogic";

const project = { id: 77, lead: { id: 11, leadNumber: "032P-0825" } } as Project;

function build() {
  return renderHook(() =>
    useProjectsTableLogic({
      projects: [project],
      onEdit: vi.fn(),
      onDelete: vi.fn(),
    }),
  );
}

describe("useProjectsTableLogic, el menú del clic derecho", () => {
  /**
   * Lo que se pidió: desde la lista de proyectos, clic derecho y al Profit and
   * Loss sin pasar por ninguna pantalla intermedia.
   */
  it("offers going straight to the Profit and Loss", () => {
    const { result } = build();

    const item = result.current
      .getContextMenuItems(project)
      .find((entry) => entry.label === "Ir al Profit and Loss");

    expect(item).toBeDefined();
  });

  /**
   * El reporte va en la URL a propósito. Si la opción navegara al reporte "a
   * secas" llevaría al P&L sólo mientras ese fuese el valor por defecto de la
   * pantalla, y cambiaría de destino en silencio el día que alguien lo cambie.
   */
  it("pins the report in the URL instead of trusting the screen's default", () => {
    const { result } = build();
    routerPush.mockClear();

    result.current
      .getContextMenuItems(project)
      .find((entry) => entry.label === "Ir al Profit and Loss")
      ?.onClick?.();

    expect(routerPush).toHaveBeenCalledWith("/project/77/report?report=ProfitAndLoss");
  });
});
