import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import type { QboRawReport } from "@/project/domain";

import { formatQboMoney, QboReportTable } from "./QboReportTable";

afterEach(cleanup);

/**
 * Reporte de resumen, con los `ColType` que QuickBooks manda de verdad en
 * ProfitAndLoss (comprobado contra el job 472): la columna de cuentas es
 * `Account` y la del total es `Money`. Los importes llegan sin separar los
 * miles, que es como los manda Intuit.
 *
 * "Memo/Description" llega vacía en todas las filas, como en un reporte
 * filtrado por job.
 */
const raw: QboRawReport = {
  Columns: {
    Column: [
      { ColTitle: "Date", ColType: "Account" },
      { ColTitle: "Memo/Description", ColType: "memo" },
      { ColTitle: "Amount", ColType: "Money" },
    ],
  },
  Rows: {
    Row: [
      {
        Header: { ColData: [{ value: "Income" }, { value: "" }, { value: "" }] },
        Rows: {
          Row: [
            { ColData: [{ value: "2026-01-10" }, { value: "" }, { value: "12500.00" }] },
            { ColData: [{ value: "2026-02-04" }, { value: "" }, { value: "3250.00" }] },
          ],
        },
        Summary: { ColData: [{ value: "Total Income" }, { value: "" }, { value: "15750.00" }] },
      },
      {
        Header: { ColData: [{ value: "Expenses" }, { value: "" }, { value: "" }] },
        Rows: {
          Row: [{ ColData: [{ value: "2026-01-20" }, { value: "" }, { value: "4000.00" }] }],
        },
        Summary: { ColData: [{ value: "Total Expenses" }, { value: "" }, { value: "4000.00" }] },
      },
    ],
  },
};

/**
 * Reporte de detalle, con las columnas reales de ProfitAndLossDetail — las que
 * trajeron la queja de "muy extendido": ningún `ColType` es `Money`, el importe
 * es `subt_nat_amount` y el saldo `rbal_nat_amount`, y `Name` repite el nombre
 * completo del cliente en cada fila.
 */
const LONG_NAME =
  "JFB Construction and Development, Inc:032P-0825, ITB Divine Savior Worship WPB 5133 Tylerlakes Blvd";

const detail: QboRawReport = {
  Columns: {
    Column: [
      { ColTitle: "Date", ColType: "tx_date" },
      { ColTitle: "Name", ColType: "name" },
      { ColTitle: "Memo/Description", ColType: "memo" },
      { ColTitle: "Amount", ColType: "subt_nat_amount" },
      { ColTitle: "Balance", ColType: "rbal_nat_amount" },
    ],
  },
  Rows: {
    Row: [
      {
        Header: { ColData: [{ value: "Services" }, { value: "" }, { value: "" }, { value: "" }, { value: "" }] },
        Rows: {
          Row: [
            {
              ColData: [
                { value: "2026-05-18" },
                { value: LONG_NAME },
                { value: "10% Retention" },
                { value: "-4000.00" },
                { value: "-4000.00" },
              ],
            },
            {
              ColData: [
                { value: "2026-06-02" },
                { value: LONG_NAME },
                { value: "Materials delivered to site" },
                { value: "2644.41" },
                { value: "-1355.59" },
              ],
            },
          ],
        },
        Summary: {
          ColData: [
            { value: "Total Services" },
            { value: "" },
            { value: "" },
            { value: "-1355.59" },
            { value: "" },
          ],
        },
      },
    ],
  },
};

describe("formatQboMoney", () => {
  it("separates the thousands QuickBooks sends unformatted", () => {
    expect(formatQboMoney("2644.41")).toBe("2,644.41");
    expect(formatQboMoney("145143.00")).toBe("145,143.00");
    expect(formatQboMoney("-45443.43")).toBe("-45,443.43");
  });

  it("pads a figure QuickBooks sent with fewer decimals", () => {
    expect(formatQboMoney("80")).toBe("80.00");
    expect(formatQboMoney("64.75")).toBe("64.75");
  });

  /** Una celda de importe puede llegar vacía o con texto: inventar "0.00" sería peor. */
  it("leaves anything that is not a number alone", () => {
    expect(formatQboMoney("")).toBe("");
    expect(formatQboMoney("   ")).toBe("   ");
    expect(formatQboMoney("n/a")).toBe("n/a");
  });

  it("accepts a figure that already carries separators", () => {
    expect(formatQboMoney("12,500.00")).toBe("12,500.00");
  });
});

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

  /** Una descripción vacía de punta a punta ya no está: ofrecer mostrarla no diría nada. */
  it("offers no description switch when the report carries none", () => {
    render(<QboReportTable raw={raw} />);

    expect(screen.queryByRole("button", { name: /descripción/i })).toBeNull();
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

    const detailRow = rows.find((row) => row.textContent?.includes("2026-01-10"));
    const [label] = within(detailRow as HTMLElement).getAllByRole("cell");
    expect(label.style.paddingLeft).toBe("20px");
  });
});

describe("QboReportTable, detail report", () => {
  it("hides the description until it is asked for, and keeps every figure visible", async () => {
    const user = userEvent.setup();
    render(<QboReportTable raw={detail} />);

    expect(screen.queryByRole("columnheader", { name: "Memo/Description" })).toBeNull();
    expect(screen.queryByText("10% Retention")).toBeNull();
    // Esconder la descripción no esconde ninguna cifra.
    expect(screen.getByText("2,644.41")).toBeInTheDocument();
    // El importe y el saldo de esa fila coinciden, así que la cifra sale dos veces.
    expect(screen.getAllByText("-4,000.00")).toHaveLength(2);

    const toggle = screen.getByRole("button", { name: "Mostrar descripción" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);

    expect(screen.getByRole("columnheader", { name: "Memo/Description" })).toBeInTheDocument();
    expect(screen.getByText("10% Retention")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ocultar descripción" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  /**
   * El bug que este fichero no veía: ningún `ColType` de un reporte de detalle
   * es `Money`, así que la comprobación anterior no se disparaba nunca ahí y las
   * columnas de importe salían alineadas a la izquierda y sin separar los miles.
   */
  it("reads the detail report's own money column types", () => {
    render(<QboReportTable raw={detail} />);

    for (const title of ["Amount", "Balance"]) {
      expect(screen.getByRole("columnheader", { name: title }).className).toContain("text-right");
    }
    expect(screen.getByRole("columnheader", { name: "Date" }).className).not.toContain(
      "text-right",
    );
    expect(screen.getAllByText("-1,355.59").length).toBeGreaterThan(0);
  });

  /** El nombre completo del cliente, repetido en cada fila, es lo que estiraba la tabla. */
  it("clamps the long name but keeps it readable in full", () => {
    render(<QboReportTable raw={detail} />);

    const [name] = screen.getAllByTitle(LONG_NAME);
    expect(name.className).toContain("truncate");
    expect(name).toHaveTextContent(LONG_NAME);
  });
});
