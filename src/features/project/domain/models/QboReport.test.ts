import { describe, expect, it } from "vitest";

import {
  DEFAULT_PROJECT_REPORT,
  parseProjectReport,
  PROJECT_REPORT_NAMES,
  QBO_REPORT_NAMES,
} from "./QboReport";

describe("PROJECT_REPORT_NAMES", () => {
  it("offers the four reports QuickBooks really scopes to the project", () => {
    expect(PROJECT_REPORT_NAMES).toEqual([
      "ProfitAndLoss",
      "ProfitAndLossDetail",
      "GeneralLedgerDetail",
      "VendorExpenses",
    ]);
  });

  /**
   * AgedPayables y VendorBalanceDetail devuelven las cifras de toda la empresa
   * —QuickBooks ignora el filtro de cliente: el mismo TOTAL de 231.520,10 y los
   * mismos 15 proveedores para dos proyectos con jobs distintos—, BalanceSheet
   * sale descuadrado (145.143,00 de activo contra -45.443,43 de pasivo más
   * patrimonio) y CashFlow repite el Net Income. Ofrecerlos en la ficha de un
   * proyecto es presentar cifras que no son de ese proyecto.
   */
  it.each(["AgedPayables", "VendorBalanceDetail", "BalanceSheet", "CashFlow"] as const)(
    "leaves %s out of the project screen",
    (dropped) => {
      expect(PROJECT_REPORT_NAMES).not.toContain(dropped);
    },
  );

  /** Siguen siendo nombres del contrato HTTP: la API los acepta los ocho. */
  it("stays a subset of the HTTP contract", () => {
    for (const name of PROJECT_REPORT_NAMES) {
      expect(QBO_REPORT_NAMES).toContain(name);
    }
    expect(QBO_REPORT_NAMES).toHaveLength(8);
  });
});

describe("parseProjectReport", () => {
  it("honours a report the project screen offers", () => {
    expect(parseProjectReport("ProfitAndLoss")).toBe("ProfitAndLoss");
    expect(parseProjectReport("GeneralLedgerDetail")).toBe("GeneralLedgerDetail");
  });

  /**
   * Un enlace a mano o guardado hace tiempo no debe dejar la pantalla en blanco
   * ni, peor, colar uno de los reportes que se quitaron por ensenar cifras que
   * no son del proyecto.
   */
  it.each([
    ["un reporte retirado", "AgedPayables"],
    ["un reporte inexistente", "NoExiste"],
    ["vacio", ""],
    ["ausente", undefined],
    ["nulo", null],
    ["un numero", 7],
  ])("cae al P&L con %s", (_label, value) => {
    expect(parseProjectReport(value)).toBe(DEFAULT_PROJECT_REPORT);
  });

  /** Next entrega `?report=a&report=b` como array. */
  it("takes the first value when the query string repeats it", () => {
    expect(parseProjectReport(["VendorExpenses", "ProfitAndLossDetail"])).toBe(
      "VendorExpenses",
    );
  });

  it("defaults to the Profit and Loss summary", () => {
    expect(DEFAULT_PROJECT_REPORT).toBe("ProfitAndLoss");
    expect(PROJECT_REPORT_NAMES).toContain(DEFAULT_PROJECT_REPORT);
  });
});
