import { describe, expect, it, vi } from "vitest";
import type { HttpClientLike } from "@/shared/infra";
import { TasksHttpRepository } from "./TasksHttpRepository";

describe("TasksHttpRepository.setEntityLink", () => {
  it("sends only entityKind and entityId (the backend rejects `label`)", async () => {
    const put = vi.fn().mockResolvedValue({ data: {} });
    const repo = new TasksHttpRepository({ put } as unknown as HttpClientLike);

    await repo.setEntityLink(7, { entityKind: "lead", entityId: 12, label: "Smith Roof" });

    expect(put).toHaveBeenCalledWith(expect.any(String), { entityKind: "lead", entityId: 12 });
  });
});
