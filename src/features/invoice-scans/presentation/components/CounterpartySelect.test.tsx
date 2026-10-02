import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type { QboCounterparty } from "../../domain/models";

const api = vi.hoisted(() => ({ listQboCounterparties: vi.fn() }));
vi.mock("../../infra/invoiceScansApi", () => ({
  listQboCounterparties: api.listQboCounterparties,
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
function Harness({ onChange }: { onChange: (value: unknown) => void }) {
  const [value, setValue] = useState(EMPTY_COUNTERPARTY);
  return (
    <CounterpartySelect
      label="Paid to / received from"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange(next);
      }}
    />
  );
}

function renderField(counterparties: QboCounterparty[] | Error) {
  if (counterparties instanceof Error) {
    api.listQboCounterparties.mockRejectedValue(counterparties);
  } else {
    api.listQboCounterparties.mockResolvedValue(counterparties);
  }
  const onChange = vi.fn();
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Harness onChange={onChange} />
    </QueryClientProvider>,
  );
  return { onChange, user: userEvent.setup() };
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
});
