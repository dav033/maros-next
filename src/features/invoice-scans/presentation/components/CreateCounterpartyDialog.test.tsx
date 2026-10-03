import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { CreateQboCounterpartyInput } from "../../infra/invoiceScansApi";

type MutateOptions = {
  onSuccess: (created: unknown) => void;
  onError: (error: Error) => void;
};

/**
 * El hook se sustituye por un doble: lo que importa aquí es a quién avisa el
 * diálogo en cada desenlace, no cómo viaja la petición.
 */
const mutation = vi.hoisted(() => ({
  isPending: false,
  mutate: vi.fn<(input: unknown, options: unknown) => void>(),
}));
vi.mock("../hooks/useInvoiceScans", () => ({
  useCreateQboCounterparty: () => mutation,
}));

import { CreateCounterpartyDialog } from "./CreateCounterpartyDialog";

afterEach(() => {
  cleanup();
  mutation.mutate.mockReset();
});

const CREATED = {
  id: "412",
  name: "Gulf Coast Lumber",
  type: "Vendor" as const,
  existedInQuickbooks: false,
  crmCompanyId: 77,
  existedInCrm: false,
  linkedToQuickbooks: true,
};

function renderDialog(direction: "outgoing" | "incoming" = "outgoing") {
  const onCreated = vi.fn();
  const onCancel = vi.fn();
  render(
    <CreateCounterpartyDialog
      name="Gulf Coast Lumber"
      direction={direction}
      onCancel={onCancel}
      onCreated={onCreated}
    />,
  );
  return { onCreated, onCancel, user: userEvent.setup() };
}

describe("CreateCounterpartyDialog", () => {
  it("hands the created counterparty back to the field", async () => {
    mutation.mutate.mockImplementation((_input, options) =>
      (options as MutateOptions).onSuccess(CREATED),
    );
    const { onCreated, onCancel, user } = renderDialog();

    await user.click(screen.getByRole("button", { name: /create vendor/i }));

    expect(mutation.mutate.mock.calls[0][0]).toEqual({
      name: "Gulf Coast Lumber",
      direction: "outgoing",
    } satisfies CreateQboCounterpartyInput);
    expect(onCreated).toHaveBeenCalledWith(CREATED);
    expect(onCancel).not.toHaveBeenCalled();
  });

  // El nombre escrito no se pierde porque el campo sólo cambia de valor a través
  // de onCreated: un fallo cierra el diálogo y deja el texto libre como estaba.
  it("closes without touching the field when QuickBooks rejects the name", async () => {
    mutation.mutate.mockImplementation((_input, options) =>
      (options as MutateOptions).onError(new Error("Duplicate Name Exists Error")),
    );
    const { onCreated, onCancel, user } = renderDialog();

    await user.click(screen.getByRole("button", { name: /create vendor/i }));

    expect(onCancel).toHaveBeenCalled();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("names a customer when the money comes in", () => {
    renderDialog("incoming");

    expect(
      screen.getByText(
        /a customer named “Gulf Coast Lumber” in QuickBooks, and a company named “Gulf Coast Lumber” in the CRM/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create customer/i })).toBeInTheDocument();
  });
});
