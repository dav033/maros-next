import type { HttpClientLike } from "@/shared/infra";
import { optimizedApiClient } from "@/shared/infra";
import type { UsersRepositoryPort } from "@/features/users/domain";
import type { AppUser, UserPatch } from "@/features/users/domain";

import { endpoints } from "./endpoints";

export class UsersHttpRepository implements UsersRepositoryPort {
  constructor(private readonly api: HttpClientLike = optimizedApiClient) {}

  async list(): Promise<AppUser[]> {
    const { data } = await this.api.get<AppUser[]>(endpoints.users());
    return data;
  }

  async update(id: number, patch: UserPatch): Promise<AppUser> {
    const { data } = await this.api.patch<AppUser>(endpoints.user(id), patch);
    return data;
  }
}
