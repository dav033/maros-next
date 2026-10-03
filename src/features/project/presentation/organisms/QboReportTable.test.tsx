import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import type { QboRawReport } from "@/project/domain";

import { QboReportTable } from "./QboReportTable";

afterEach(cleanup);

/** "Memo/Description" llega vacía en todas las filas, como en un reporte filtrado por job. */
const raw: QboRawReport = {
  Columns: {
    Column: [
      { ColTitle: "Date", ColType: "Date" },
      { ColTitle: "Memo/Description", ColType: "String" },
      { ColTitle: "Amount", ColType: "Money" },
    ],
  },
  Rows: {
    Row: [
      {
        Header: { ColData: [{ value: "Income" }, { value: "" }, { value: "" }] },
        Rows: {
          Row: [
            { ColData: [{ value: "2026-01-10" }, { value: "" }, { value: "12,500.00" }] },
            { ColData: [{ value: "2026-02-04" }, { value: "" }, { value: "3,250.00" }] },
          ],
        },
        Summary: { ColData: [{ value: "Total Income" }, { value: "" }, { value: "15,750.00" }] },
      },
      {
        Header: { ColData: [{ value: "Expenses" }, { value: "" }, { value: "" }] },
        Rows: {
          Row: [{ ColData: [{ value: "2026-01-20" }, { value: "" }, { value: "4,000.00" }] }],
        },
        Summary: { ColData: [{ value: "Total Expenses" }, { value: "" }, { value: "4,000.00" }] },
      },
    ],
  },
};

describe("QboReportTable", () => {
  it("keeps every figure and drops only the columns QuickBooks left empty", () => {
    render(<QboReportTable raw={raw} />);

    for (const figure of ["12,500.00", "3,250.00", "15,750.00", "4,000.00"]) {
      expect(screen.getAllByText(figure).length).toBeGreaterThan(0);
    }
    expect(screen.getByRole("columnheader", { name: "Date" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Amount" })).toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Memo/Description" })).toBeNull();
  });

  it("collapses a section without hiding its total, and expands it again", async () => {
    const user = userEvent.setup();
    render(<QboReportTable raw={raw} />);

    const income = screen.getByRole("button", { name: "Income" });
    expect(income).toHaveAttribute("aria-expanded", "true");

    await user.click(income);

    expect(income).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("2026-01-10")).toBeNull();
    expect(screen.queryByText("12,500.00")).toBeNull();
    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText("15,750.00")).toBeInTheDocument();
    // Plegar una sección no toca a las demás.
    expect(screen.getByText("2026-01-20")).toBeInTheDocument();

    await user.click(income);

    expect(income).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("12,500.00")).toBeInTheDocument();
  });

  it("marks summary rows as totals and indents the detail under its section", () => {
    render(<QboReportTable raw={raw} />);

    const rows = within(screen.getByRole("table")).getAllByRole("row");
    const totalIncome = rows.find((row) => row.textContent?.includes("Total Income"));
    expect(totalIncome?.className).toContain("border-line-strong");

    const detail = rows.find((row) => row.textContent?.includes("2026-01-10"));
    const [label] = within(detail as HTMLElement).getAllByRole("cell");
    expect(label.style.paddingLeft).toBe("20px");
  });
});
