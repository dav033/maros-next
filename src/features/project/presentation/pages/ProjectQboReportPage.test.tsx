import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { ProjectQboReport } from "@/project/domain";

const useProjectQboReport = vi.hoisted(() => vi.fn());
vi.mock("../hooks/data/useProjectQboReport", () => ({ useProjectQboReport }));
// La tarjeta de coste tiene su propia suite y sus propias llamadas; aquí sólo
// estorbaría al asunto de estas pruebas, que es el reporte.
vi.mock("../organisms/ProjectCostBreakdownCard", () => ({
  ProjectCostBreakdownCard: () => null,
}));

import { ProjectQboReportPage } from "./ProjectQboReportPage";

afterEach(cleanup);

const report: ProjectQboReport = {
  projectId: 12,
  leadNumber: "2026-012",
  qboCustomerId: "88",
  linkSource: "stored",
  report: "ProfitAndLossDetail",
  accountingMethod: "Accrual",
  scope: "project",
  startDate: "2026-01-01",
  endDate: "2026-03-31",
  raw: {
    Columns: {
      Column: [
        { ColTitle: "Date", ColType: "Date" },
        { ColTitle: "Amount", ColType: "Money" },
      ],
    },
    Rows: {
      Row: [
        {
          Header: { ColData: [{ value: "Income" }, { value: "" }] },
          Rows: { Row: [{ ColData: [{ value: "2026-01-10" }, { value: "12,500.00" }] }] },
          Summary: { ColData: [{ value: "Total Income" }, { value: "15,750.00" }] },
        },
      ],
    },
  },
};

describe("ProjectQboReportPage", () => {
  /** El select arranca en el P&L de resumen, no en el detalle de 165 filas. */
  it("opens on the Profit and Loss summary, not the detail", () => {
    useProjectQboReport.mockReturnValue({
      data: report,
      error: null,
      isPending: false,
      refetch: vi.fn(),
    });
    render(<ProjectQboReportPage projectId={12} />);

    const trigger = screen.getByRole("combobox", { name: "Report" });
    expect(trigger).toHaveTextContent("Profit and Loss");
    expect(trigger).not.toHaveTextContent("Detail");
  });

  it("renders the figures and the report provenance once the data arrives", () => {
    useProjectQboReport.mockReturnValue({ data: report, error: null, isPending: false, refetch: vi.fn() });

    render(<ProjectQboReportPage projectId={12} />);

    expect(screen.getByText("12,500.00")).toBeInTheDocument();
    expect(screen.getByText("15,750.00")).toBeInTheDocument();
    // La procedencia ya no es un párrafo suelto, pero sigue completa sobre la tabla.
    expect(
      screen.getByText(/Profit and Loss Detail · Accrual · 2026-01-01 → 2026-03-31 · QuickBooks customer 88/),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Report" })).toBeInTheDocument();
    expect(screen.getByLabelText("From")).toBeInTheDocument();
    expect(screen.getByLabelText("To")).toBeInTheDocument();
  });
});
