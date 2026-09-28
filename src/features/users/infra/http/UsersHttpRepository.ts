import type { HttpClientLike } from "@/shared/infra";
import { optimizedApiClient } from "@/shared/infra";
import type { UsersRepositoryPort } from "@/features/users/domain";
import type {
  AppUser,
  DirectoryUser,
  InvitedUser,
  UserInvitation,
  UserInvite,
  UserPatch,
} from "@/features/users/domain";

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

  async invite(draft: UserInvite): Promise<InvitedUser> {
    const { data } = await this.api.post<InvitedUser>(endpoints.invite(), draft);
    return data;
  }

  async resendInvite(id: number): Promise<UserInvitation> {
    const { data } = await this.api.post<{ invitation: UserInvitation }>(
      endpoints.resendInvite(id)
    );
    return data.invitation;
  }

  async revokeInvite(id: number): Promise<void> {
    await this.api.delete(endpoints.userInvite(id));
  }

  async listDirectory(): Promise<DirectoryUser[]> {
    const { data } = await this.api.get<DirectoryUser[]>(endpoints.directory());
    return Array.isArray(data) ? data : [];
  }
}
