import type { HttpClientLike } from "@/shared/infra";
import { optimizedApiClient } from "@/shared/infra";
import type { RolesRepositoryPort } from "@/features/users/domain";
import type {
  AppRole,
  PermissionCatalog,
  RoleDraft,
  RolePatch,
} from "@/features/users/domain";

import { endpoints } from "./endpoints";

export class RolesHttpRepository implements RolesRepositoryPort {
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async list(): Promise<AppRole[]> {
    const { data } = await this.api.get<AppRole[]>(endpoints.roles());
    return data;
  }

  async create(draft: RoleDraft): Promise<AppRole> {
    const { data } = await this.api.post<AppRole>(endpoints.roles(), draft);
    return data;
  }

  async update(id: number, patch: RolePatch): Promise<AppRole> {
    const { data } = await this.api.patch<AppRole>(endpoints.role(id), patch);
    return data;
  }

  async delete(id: number): Promise<void> {
    await this.api.delete<void>(endpoints.role(id));
  }

  async permissionCatalog(): Promise<PermissionCatalog> {
    const { data } = await this.api.get<PermissionCatalog>(endpoints.permissions());
    return data;
  }
}
