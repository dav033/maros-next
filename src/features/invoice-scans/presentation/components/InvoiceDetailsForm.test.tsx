import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { InvoiceDetailsForm } from "./InvoiceDetailsForm";

afterEach(cleanup);

describe("InvoiceDetailsForm", () => {
  it("shows the save bar only after an edit and sends the whole patch", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <InvoiceDetailsForm
        data={{
          direction: "incoming",
          classification: "materials_expense",
          counterpartyName: "Lion Plumbing",
          invoiceNumber: "4022039",
          issueDate: "2026-09-01",
          dueDate: null,
          currency: "USD",
          subtotal: 80,
          taxTotal: 7.73,
          total: 87.73,
          paymentStatus: "unpaid",
          confidence: 0.9,
          lineItems: [{ description: "Pipe", quantity: 1, unitPrice: 80, amount: 80 }],
        }}
        onSave={onSave}
        saving={false}
      />,
    );

    expect(screen.queryByRole("button", { name: "Save changes" })).not.toBeInTheDocument();

    const user = userEvent.setup();
    const total = screen.getByLabelText("Total");
    await user.clear(total);
    await user.type(total, "90");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        counterpartyName: "Lion Plumbing",
        total: 90,
        lineItems: [{ description: "Pipe", quantity: 1, unitPrice: 80, amount: 80 }],
      }),
    );
  });

  it("blocks a malformed amount with an inline message", async () => {
    const onSave = vi.fn();
    render(<InvoiceDetailsForm data={null} onSave={onSave} saving={false} />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Total"), "-4");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Enter a positive amount")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
