import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ProjectCostBreakdown } from "@/project/domain";

const useProjectCostBreakdown = vi.hoisted(() => vi.fn());
const mutateAsync = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const invalidateQueries = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("../hooks/data/useProjectCostBreakdown", () => ({ useProjectCostBreakdown }));
vi.mock("../hooks/mutations/useProjectsMutations", () => ({
  useProjectsMutations: () => ({ updateMutation: { mutateAsync } }),
}));
// Parcial a propósito: reemplazar el módulo entero rompe a quien importa
// QueryClient desde shared/lib/queryClient.
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => ({ invalidateQueries }),
}));

import { ProjectCostBreakdownCard } from "./ProjectCostBreakdownCard";

afterEach(() => {
  cleanup();
  mutateAsync.mockClear();
  invalidateQueries.mockClear();
});

/** Las cifras reales del 032P-0825, las mismas que su Profit and Loss en caja. */
const breakdown: ProjectCostBreakdown = {
  projectId: 77,
  leadNumber: "032P-0825",
  qboCustomerId: "472",
  found: true,
  totalPaid: 190586.43,
  totalJobCost: 190814.28,
  otherPaid: 6145.57,
  forecastUpdatedAt: null,
  categories: [
    {
      key: "material",
      accountName: "Construction Materials Costs",
      paid: 105600.23,
      openAp: 0,
      committedPo: 0,
      total: 105600.23,
      forecast: 100000,
      overrun: 5600.23,
      vendors: [
        {
          id: "524",
          name: "BOND PLUMBING SUPPLY, INC.",
          paid: 44411.68,
          openAp: 0,
          committedPo: 0,
          total: 44411.68,
          transactionCount: 31,
        },
      ],
    },
    {
      key: "subcontractor",
      accountName: "53600 Subcontractors Expense",
      paid: 78840.63,
      openAp: 0,
      committedPo: 0,
      total: 78840.63,
      forecast: null,
      overrun: null,
      vendors: [
        {
          id: "297",
          name: "MARC ANTHONYS PLUMBING SERVICES LLC",
          paid: 40000,
          openAp: 0,
          committedPo: 0,
          total: 40000,
          transactionCount: 5,
        },
      ],
    },
  ],
};

function arrange(data: ProjectCostBreakdown | null = breakdown, over = {}) {
  useProjectCostBreakdown.mockReturnValue({
    data,
    error: null,
    isPending: false,
    refetch: vi.fn(),
    ...over,
  });
  render(<ProjectCostBreakdownCard projectId={77} />);
}

describe("ProjectCostBreakdownCard", () => {
  it("shows what the project has cost and what each category cost", () => {
    arrange();

    expect(screen.getByText("$190,586.43")).toBeInTheDocument();
    expect(screen.getByText("$105,600.23")).toBeInTheDocument();
    expect(screen.getByText("$78,840.63")).toBeInTheDocument();
  });

  /**
   * Sin esta fila las dos categorías no suman el coste del proyecto —
   * 105.600,23 + 78.840,63 son 184.440,86 de 190.586,43 — y nadie sabría dónde
   * están los 6.145,57 que faltan.
   */
  it("shows the cost that falls outside the two categories", () => {
    arrange();

    expect(screen.getByText("$6,145.57")).toBeInTheDocument();
  });

  it("opens the vendor breakdown of a category", async () => {
    const user = userEvent.setup();
    arrange();

    expect(screen.queryByText("MARC ANTHONYS PLUMBING SERVICES LLC")).toBeNull();

    await user.click(screen.getByRole("button", { name: /Subcontractors/ }));

    expect(screen.getByText("MARC ANTHONYS PLUMBING SERVICES LLC")).toBeInTheDocument();
    expect(screen.getByText("$40,000.00")).toBeInTheDocument();
    expect(screen.getByText("5 movs.")).toBeInTheDocument();
  });

  it("marks going over the forecast and leaves the rest alone", () => {
    arrange();

    // 105.600,23 pagado contra 100.000 de pronóstico.
    const overrun = screen.getByText("+$5,600.23");
    expect(overrun.className).toContain("text-destructive");
    expect(screen.getByText("de más")).toBeInTheDocument();
  });

  /** Sin pronóstico no hay desvío: un 0 diría "va justo", que es otra cosa. */
  it("says nothing about a category with no forecast", () => {
    arrange();

    const field = screen.getByLabelText("Pronóstico de Subcontractors");
    expect(field).toHaveValue(null);
    expect(field).toHaveAttribute("placeholder", "sin pronóstico");
  });

  it("saves a typed forecast", async () => {
    const user = userEvent.setup();
    arrange();

    const field = screen.getByLabelText("Pronóstico de Subcontractors");
    await user.type(field, "85000");
    fireEvent.blur(field);

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        id: 77,
        patch: { forecastSubcontractorCost: 85000 },
      }),
    );
    expect(invalidateQueries).toHaveBeenCalled();
  });

  /** Vaciar el campo borra el pronóstico; mandar 0 diría "no espero gastar nada". */
  it("clears the forecast with null when the field is emptied", async () => {
    const user = userEvent.setup();
    arrange();

    const field = screen.getByLabelText("Pronóstico de Cost of material");
    await user.clear(field);
    fireEvent.blur(field);

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        id: 77,
        patch: { forecastMaterialCost: null },
      }),
    );
  });

  it("does not save when nothing changed", async () => {
    arrange();

    fireEvent.blur(screen.getByLabelText("Pronóstico de Cost of material"));

    await waitFor(() => expect(mutateAsync).not.toHaveBeenCalled());
  });

  it("refuses a negative forecast instead of sending it", async () => {
    const user = userEvent.setup();
    arrange();

    const field = screen.getByLabelText("Pronóstico de Subcontractors");
    await user.type(field, "-5");
    fireEvent.blur(field);

    await waitFor(() => expect(mutateAsync).not.toHaveBeenCalled());
    expect(field).toHaveAttribute("aria-invalid", "true");
  });

  it("says so when the project has no QuickBooks job", () => {
    arrange({ ...breakdown, found: false });

    expect(screen.getByText(/no está enlazado a un job de QuickBooks/)).toBeInTheDocument();
  });

  it("offers a retry when QuickBooks could not be read", () => {
    arrange(null, { error: new Error("timeout"), data: undefined });

    expect(screen.getByText(/No se pudo leer el coste/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reintentar" })).toBeInTheDocument();
  });

  /** Una categoría sin proveedores no se puede desplegar. */
  it("does not offer to open a category with no vendors", () => {
    arrange({
      ...breakdown,
      categories: breakdown.categories.map((category) => ({ ...category, vendors: [] })),
    });

    const row = screen.getByRole("button", { name: /Cost of material/ });
    expect(row).toBeDisabled();
    expect(within(row).queryByText(/proveedor/)).toBeNull();
  });
});
