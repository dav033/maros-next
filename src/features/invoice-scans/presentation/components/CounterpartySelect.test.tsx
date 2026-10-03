import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { InvoiceDirection, QboCounterparty } from "../../domain/models";

const api = vi.hoisted(() => ({
  listQboCounterparties: vi.fn(),
  createQboCounterparty: vi.fn(),
}));
vi.mock("../../infra/invoiceScansApi", () => ({
  listQboCounterparties: api.listQboCounterparties,
  createQboCounterparty: api.createQboCounterparty,
}));
vi.mock("@/shared/presentation/toast", () => ({
  notifyError: vi.fn(),
  notifySuccess: vi.fn(),
}));

import { CounterpartySelect, EMPTY_COUNTERPARTY } from "./CounterpartySelect";

beforeAll(() => {
  // cmdk mide su lista y jsdom no trae ResizeObserver; sin el stub el
  // componente no llega ni a montarse.
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(cleanup);

const QBO: QboCounterparty[] = [
  { id: "58", name: "Home Depot", type: "Vendor" },
  { id: "7", name: "Anderson Family", type: "Customer" },
];

/** Re-renders with whatever the field reports, as the real forms do. */
function Harness({
  onChange,
  direction,
}: {
  onChange: (value: unknown) => void;
  direction?: InvoiceDirection;
}) {
  const [value, setValue] = useState(EMPTY_COUNTERPARTY);
  return (
    <CounterpartySelect
      label="Paid to / received from"
      value={value}
      direction={direction}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

function renderField(
  counterparties: QboCounterparty[] | Error,
  direction?: InvoiceDirection,
) {
  if (counterparties instanceof Error) {
    api.listQboCounterparties.mockRejectedValue(counterparties);
  } else {
    api.listQboCounterparties.mockResolvedValue(counterparties);
  }
  const onChange = vi.fn();
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Harness onChange={onChange} direction={direction} />
    </QueryClientProvider>,
  );
  return { onChange, client, user: userEvent.setup() };
}

describe("CounterpartySelect", () => {
  it("reports the id and the type of a name picked from QuickBooks", async () => {
    const { onChange, user } = renderField(QBO);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText("Home Depot"));

    expect(onChange).toHaveBeenLastCalledWith({
      name: "Home Depot",
      id: "58",
      type: "Vendor",
    });
    expect(screen.getByRole("combobox")).toHaveValue("Home Depot");
  });

  it("narrows the list as the name is typed", async () => {
    const { user } = renderField(QBO);

    await user.click(screen.getByRole("combobox"));
    await user.type(screen.getByRole("combobox"), "ander");

    expect(await screen.findByText("Anderson Family")).toBeInTheDocument();
    expect(screen.queryByText("Home Depot")).not.toBeInTheDocument();
  });

  // Un pago en efectivo a quien no esta dado de alta en QuickBooks tiene que
  // poder anotarse: el nombre escrito vale y viaja sin id.
  it("keeps a name that is not in QuickBooks, with no id", async () => {
    const { onChange, user } = renderField(QBO);

    await user.type(screen.getByRole("combobox"), "Jose, day labourer");

    expect(onChange).toHaveBeenLastCalledWith({
      name: "Jose, day labourer",
      id: null,
      type: null,
    });
    expect(await screen.findByText(/is saved as typed/)).toBeInTheDocument();
  });

  it("unlinks the QuickBooks record when the picked name is typed over", async () => {
    const { onChange, user } = renderField(QBO);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByText("Home Depot"));
    await user.type(screen.getByRole("combobox"), " Supply");

    expect(onChange).toHaveBeenLastCalledWith({
      name: "Home Depot Supply",
      id: null,
      type: null,
    });
  });

  it("still takes a typed name when QuickBooks is not connected", async () => {
    const { onChange, user } = renderField([]);

    await user.type(screen.getByRole("combobox"), "Cash to Jose");

    expect(
      await screen.findByText(/no quickbooks list available/i),
    ).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith({
      name: "Cash to Jose",
      id: null,
      type: null,
    });
  });

  it("does not break when the list request fails", async () => {
    const { onChange, user } = renderField(new Error("QBO down"));

    await user.type(screen.getByRole("combobox"), "Cash to Jose");

    expect(onChange).toHaveBeenLastCalledWith({
      name: "Cash to Jose",
      id: null,
      type: null,
    });
  });

  describe("creating the counterparty", () => {
    beforeEach(() => api.createQboCounterparty.mockReset());

    const CREATED = {
      id: "412",
      name: "Gulf Coast Lumber",
      type: "Vendor" as const,
      existedInQuickbooks: false,
      crmCompanyId: 77,
      existedInCrm: false,
      linkedToQuickbooks: true,
    };

    async function offerCreation(direction: InvoiceDirection = "outgoing") {
      const field = renderField(QBO, direction);
      await field.user.type(screen.getByRole("combobox"), "Gulf Coast Lumber");
      await field.user.click(
        await screen.findByText(/create “Gulf Coast Lumber” in QuickBooks and the CRM/i),
      );
      return field;
    }

    // Crear es irreversible (QuickBooks no borra, desactiva), así que la fila de
    // acción abre una confirmación y no escribe nada por sí sola.
    it("asks for confirmation naming the records and the two places", async () => {
      const { onChange, user } = await offerCreation();

      expect(
        await screen.findByText(
          /a vendor named “Gulf Coast Lumber” in QuickBooks, and a company named “Gulf Coast Lumber” in the CRM/i,
        ),
      ).toBeInTheDocument();
      expect(api.createQboCounterparty).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: /cancel/i }));

      expect(api.createQboCounterparty).not.toHaveBeenCalled();
      expect(onChange).toHaveBeenLastCalledWith({
        name: "Gulf Coast Lumber",
        id: null,
        type: null,
      });
    });

    it("leaves the counterparty selected with its id and type once created", async () => {
      api.createQboCounterparty.mockResolvedValue(CREATED);
      const { onChange, client, user } = await offerCreation();
      const invalidate = vi.spyOn(client, "invalidateQueries");

      await user.click(screen.getByRole("button", { name: /create vendor/i }));

      expect(api.createQboCounterparty.mock.calls[0][0]).toEqual({
        name: "Gulf Coast Lumber",
        direction: "outgoing",
      });
      expect(await screen.findByText(/linked to the QuickBooks vendor/i)).toBeInTheDocument();
      expect(onChange).toHaveBeenLastCalledWith({
        name: "Gulf Coast Lumber",
        id: "412",
        type: "Vendor",
      });
      // Sin esto el nombre recién creado no volvería en la siguiente búsqueda:
      // el servidor cachea la lista diez minutos.
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: ["invoice-scans", "counterparties"],
      });
    });

    it("creates a customer when the money comes in", async () => {
      api.createQboCounterparty.mockResolvedValue({
        ...CREATED,
        type: "Customer" as const,
        linkedToQuickbooks: false,
      });
      const { user } = await offerCreation("incoming");

      await user.click(screen.getByRole("button", { name: /create customer/i }));

      expect(api.createQboCounterparty.mock.calls[0][0]).toEqual({
        name: "Gulf Coast Lumber",
        direction: "incoming",
      });
    });

    it("does not offer to create while there is no QuickBooks list to create into", async () => {
      const { user } = renderField([], "outgoing");

      await user.type(screen.getByRole("combobox"), "Gulf Coast Lumber");

      expect(await screen.findByText(/no quickbooks list available/i)).toBeInTheDocument();
      expect(screen.queryByText(/create “Gulf Coast Lumber”/i)).not.toBeInTheDocument();
    });

    it("does not offer to create while the direction is still unknown", async () => {
      const { user } = renderField(QBO);

      await user.type(screen.getByRole("combobox"), "Gulf Coast Lumber");

      expect(await screen.findByText(/is saved as typed/)).toBeInTheDocument();
      expect(screen.queryByText(/create “Gulf Coast Lumber”/i)).not.toBeInTheDocument();
    });
  });
});
