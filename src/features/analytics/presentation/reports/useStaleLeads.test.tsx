import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// `entityToast.info` llama a `toast(...)` como función, no sólo a sus métodos.
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), info: vi.fn() }),
}));

const updateLeadStatusAction = vi.fn().mockResolvedValue({ success: true, data: undefined });

vi.mock("@/features/leads/actions/leadActions", () => ({
  updateLeadStatusAction: (...args: unknown[]) => updateLeadStatusAction(...args),
  acceptLeadAction: vi.fn(),
  deleteLeadAction: vi.fn(),
  updateLeadProjectTypeAction: vi.fn(),
}));

import { LeadStatus } from "@/leads/domain";
import { useCloseStaleLead } from "./useStaleLeads";

describe("useCloseStaleLead", () => {
  it("invalidates the stale report and the leads queries once a lead is decided", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCloseStaleLead(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await result.current.close({ id: 41, status: LeadStatus.LOST, lostReason: "no_response" });

    expect(updateLeadStatusAction).toHaveBeenCalledWith(41, "LOST", "no_response");

    await waitFor(() => {
      const keys = invalidateQueries.mock.calls.map(([filters]) => filters?.queryKey);
      expect(keys).toContainEqual(["analytics", "leads", "stale"]);
      expect(keys).toContainEqual(["leads"]);
    });
  });
});
