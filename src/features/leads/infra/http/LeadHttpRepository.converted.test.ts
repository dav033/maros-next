import { describe, expect, it, vi } from "vitest";
import { LeadType } from "@/leads/domain";
import type { HttpClientLike } from "@/shared/infra";
import { LeadHttpRepository } from "./LeadHttpRepository";

describe("LeadHttpRepository converted leads", () => {
  it("requests converted leads by type and maps the associated project", async () => {
    const get = vi.fn().mockResolvedValue({
      status: 200,
      data: [{
        id: 71,
        leadNumber: "065P-0726",
        name: "Chilled Water distribution piping Planet Fitness",
        startDate: "2026-07-01",
        status: "WON",
        contact: { id: 8, name: "Amanda Eldridge" },
        projectType: { id: 3, name: "Plumbing" },
        project: { id: 148 },
      }],
    });
    const api = { get } as unknown as HttpClientLike;
    const repository = new LeadHttpRepository(api);

    const leads = await repository.findConvertedByType(LeadType.PLUMBING);

    expect(get).toHaveBeenCalledWith(expect.stringMatching(/\/leads\/converted$/), {
      params: { type: "PLUMBING" },
    });
    expect(leads).toHaveLength(1);
    expect(leads[0].leadNumber).toBe("065P-0726");
    expect(leads[0].project).toEqual({ id: 148 });
  });
});
