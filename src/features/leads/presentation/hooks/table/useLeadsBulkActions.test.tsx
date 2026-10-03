import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { LeadStatus, type Lead } from "@/leads/domain";
import { LeadLostReasonDialog } from "../../molecules/LeadLostReasonDialog";
import { useLeadsBulkActions } from "./useLeadsBulkActions";

beforeAll(() => {
  // Radix mide y captura el puntero; jsdom no implementa nada de eso y sin estos
  // stubs el diálogo no llega a abrirse.
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = vi.fn();
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(cleanup);

function makeLead(id: number): Lead {
  return { id, status: LeadStatus.NEW_LEAD, name: `Lead ${id}` } as Lead;
}

function Harness({
  leads,
  mutateAsync,
}: {
  leads: Lead[];
  mutateAsync: (input: unknown) => Promise<void>;
}) {
  const bulk = useLeadsBulkActions({
    leads,
    updateStatusMutation: { mutateAsync } as never,
    deleteMutation: { mutateAsync: vi.fn() } as never,
  });

  return (
    <>
      <button
        type="button"
        onClick={() => bulk.onSelectionChange(new Set(leads.map((lead) => lead.id)))}
      >
        select all
      </button>
      <button type="button" onClick={() => void bulk.changeStatus(LeadStatus.LOST)}>
        set lost
      </button>
      <button type="button" onClick={() => void bulk.changeStatus(LeadStatus.CONTACTED)}>
        set contacted
      </button>
      <LeadLostReasonDialog {...bulk.lostReasonDialogProps} />
    </>
  );
}

async function renderBulk(leads: Lead[]) {
  const mutateAsync = vi.fn().mockResolvedValue(undefined);
  const user = userEvent.setup({ pointerEventsCheck: 0 });
  render(<Harness leads={leads} mutateAsync={mutateAsync} />);
  await user.click(screen.getByRole("button", { name: "select all" }));
  return { mutateAsync, user };
}

describe("bulk lead status change", () => {
  it("does not fire the request when LOST has no reason yet", async () => {
    const { mutateAsync, user } = await renderBulk([makeLead(1)]);

    await user.click(screen.getByRole("button", { name: "set lost" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("sends status and lostReason together once a reason is picked", async () => {
    const { mutateAsync, user } = await renderBulk([makeLead(1)]);

    await user.click(screen.getByRole("button", { name: "set lost" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Price" }));
    await user.click(within(dialog).getByRole("button", { name: /Mark as lost/ }));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(mutateAsync).toHaveBeenCalledWith({ id: 1, status: "LOST", lostReason: "price" });
  });

  it("sends nothing when the reason dialog is dismissed", async () => {
    const { mutateAsync, user } = await renderBulk([makeLead(1)]);

    await user.click(screen.getByRole("button", { name: "set lost" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("asks nothing for a status other than LOST and sends only the status", async () => {
    const { mutateAsync, user } = await renderBulk([makeLead(1)]);

    await user.click(screen.getByRole("button", { name: "set contacted" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mutateAsync).toHaveBeenCalledWith({ id: 1, status: "CONTACTED" });
  });

  it("warns that one reason covers the whole selection and applies it to every lead", async () => {
    const { mutateAsync, user } = await renderBulk([makeLead(1), makeLead(2), makeLead(3)]);

    await user.click(screen.getByRole("button", { name: "set lost" }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/all 3 selected leads/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "No response" }));
    await user.click(within(dialog).getByRole("button", { name: /Mark 3 leads as lost/ }));

    expect(mutateAsync.mock.calls.map(([input]) => input)).toEqual([
      { id: 1, status: "LOST", lostReason: "no_response" },
      { id: 2, status: "LOST", lostReason: "no_response" },
      { id: 3, status: "LOST", lostReason: "no_response" },
    ]);
  });
});
