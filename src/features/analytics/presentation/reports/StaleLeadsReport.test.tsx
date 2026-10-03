import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const hasPermission = vi.fn<(permission: string) => boolean>();
const close = vi.fn().mockResolvedValue(undefined);

vi.mock("@/shared/auth/useHasPermission", () => ({
  useHasPermission: (permission: string) => hasPermission(permission),
}));

vi.mock("./useStaleLeads", () => ({
  useStaleLeads: () => ({
    isPending: false,
    isError: false,
    data: {
      days: 60,
      asOf: "2026-10-02",
      leads: [
        {
          id: 41,
          leadNumber: "050C-0624",
          name: "Shelby Deck",
          status: null,
          estimate: 0,
          ageDays: 517,
          ageBucket: "365+",
        },
      ],
      summary: {
        totalCount: 1,
        totalEstimate: 0,
        buckets: [{ bucket: "365+", count: 1, estimate: 0 }],
        undatedCount: 0,
        undatedEstimate: 0,
      },
    },
  }),
  useCloseStaleLead: () => ({ close, pendingLeadId: null }),
}));

import { StaleLeadsReport } from "./StaleLeadsReport";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = vi.fn();
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

beforeEach(() => {
  hasPermission.mockReturnValue(true);
  close.mockClear();
});

afterEach(cleanup);

function renderReport() {
  render(<StaleLeadsReport />);
  return userEvent.setup({ pointerEventsCheck: 0 });
}

describe("StaleLeadsReport quick close", () => {
  it("closes a lead as lost with no_response in a single click", async () => {
    const user = renderReport();

    await user.click(screen.getByRole("button", { name: "Lost: no response" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(close).toHaveBeenCalledWith({ id: 41, status: "LOST", lostReason: "no_response" });
  });

  it("asks for the reason when another one is wanted, and sends nothing on cancel", async () => {
    const user = renderReport();

    await user.click(screen.getByRole("button", { name: /Other outcomes for Shelby Deck/ }));
    await user.click(screen.getByRole("menuitem", { name: /Lost for another reason/ }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("button", { name: "No response" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(close).not.toHaveBeenCalled();
  });

  it("sends the picked reason with the status", async () => {
    const user = renderReport();

    await user.click(screen.getByRole("button", { name: /Other outcomes for Shelby Deck/ }));
    await user.click(screen.getByRole("menuitem", { name: /Lost for another reason/ }));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Not qualified" }));
    await user.click(within(dialog).getByRole("button", { name: "Mark as lost" }));

    expect(close).toHaveBeenCalledWith({ id: 41, status: "LOST", lostReason: "not_qualified" });
  });

  it("offers no status control without leads:write", () => {
    hasPermission.mockImplementation((permission) => permission !== "leads:write");
    renderReport();

    expect(screen.queryByRole("button", { name: "Lost: no response" })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: "Decide" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shelby Deck" })).toBeInTheDocument();
  });
});
