import type {
  AppRole,
  AppUser,
  DirectoryUser,
  InvitedUser,
  PermissionCatalog,
  RoleDraft,
  RolePatch,
  UserInvite,
  UserInvitation,
  UserPatch,
} from "./models";

export interface UsersRepositoryPort {
  list(): Promise<AppUser[]>;
  update(id: number, patch: UserPatch): Promise<AppUser>;
  /** Creates the account and emails its invitation. */
  invite(draft: UserInvite): Promise<InvitedUser>;
  /** Mints a fresh token, which kills the previous link. */
  resendInvite(id: number): Promise<UserInvitation>;
  /** Revokes the invitation and deactivates the account. */
  revokeInvite(id: number): Promise<void>;
  /** Plain name/email/picture for people pickers — see UsersController.findUserDirectory. */
  listDirectory(): Promise<DirectoryUser[]>;
}

export interface RolesRepositoryPort {
  list(): Promise<AppRole[]>;
  create(draft: RoleDraft): Promise<AppRole>;
  update(id: number, patch: RolePatch): Promise<AppRole>;
  delete(id: number): Promise<void>;
  permissionCatalog(): Promise<PermissionCatalog>;
}
