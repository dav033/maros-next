import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { ProjectPaymentSchedule } from "@/project/domain";

import { PaymentScheduleTable } from "./PaymentScheduleTable";

afterEach(cleanup);

describe("PaymentScheduleTable", () => {
  it("shows cumulative percentages for stages based on the remaining balance", () => {
    const schedule: ProjectPaymentSchedule = {
      items: [
        { label: "Contract Signing", percentage: 35, amount: null },
        { label: "Final Delivery", percentage: 60, amount: null },
      ],
      totalPercentage: 95,
      totalAmount: 100_000,
      basis: "remaining-balance",
      source: {
        attachmentId: "attachment-1",
        fileName: "proposal.pdf",
        entityType: "Estimate",
        entityId: "estimate-1",
        matchedBy: "estimate",
      },
    };

    render(<PaymentScheduleTable schedule={schedule} />);

    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(within(rows[1]).getAllByRole("cell")[2]).toHaveTextContent("35%");
    expect(within(rows[2]).getAllByRole("cell")[2]).toHaveTextContent("74%");
    expect(within(rows[3]).getAllByRole("cell")[1]).toHaveTextContent("—");
    expect(within(rows[3]).getAllByRole("cell")[2]).toHaveTextContent("74%");
    expect(
      screen.getByText(
        "Los porcentajes se calculan sobre el saldo restante, no sobre el total del estimate.",
      ),
    ).toBeInTheDocument();

    const mobileStages = screen.getAllByRole("article");
    expect(mobileStages).toHaveLength(2);
    expect(within(mobileStages[0]).getByText("Contract Signing")).toBeInTheDocument();
    expect(within(mobileStages[0]).getAllByText("35%")).toHaveLength(2);
  });
});
