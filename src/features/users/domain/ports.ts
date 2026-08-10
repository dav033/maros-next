import type {
  AppRole,
  AppUser,
  DirectoryUser,
  PermissionCatalog,
  RoleDraft,
  RolePatch,
  UserPatch,
} from "./models";

export interface UsersRepositoryPort {
  list(): Promise<AppUser[]>;
  update(id: number, patch: UserPatch): Promise<AppUser>;
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
