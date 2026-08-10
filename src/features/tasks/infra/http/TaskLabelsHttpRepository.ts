import type { HttpClientLike } from "@/shared/infra";
import { optimizedApiClient } from "@/shared/infra";
import type {
  TaskLabel,
  TaskLabelDraft,
  TaskLabelPatch,
  TaskLabelsRepositoryPort,
} from "@/features/tasks/domain";

import { endpoints } from "./endpoints";

export class TaskLabelsHttpRepository implements TaskLabelsRepositoryPort {
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async list(): Promise<TaskLabel[]> {
    const { data } = await this.api.get<TaskLabel[]>(endpoints.labels());
    return Array.isArray(data) ? data : [];
  }

  async create(draft: TaskLabelDraft): Promise<TaskLabel> {
    const { data } = await this.api.post<TaskLabel>(endpoints.labels(), draft);
    return data;
  }

  async update(id: number, patch: TaskLabelPatch): Promise<TaskLabel> {
    const { data } = await this.api.patch<TaskLabel>(endpoints.label(id), patch);
    return data;
  }

  async delete(id: number): Promise<void> {
    await this.api.delete<void>(endpoints.label(id));
  }
}
