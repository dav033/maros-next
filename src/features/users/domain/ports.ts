import type {
  AppRole,
  AppUser,
  PermissionCatalog,
  RoleDraft,
  RolePatch,
  UserPatch,
} from "./models";

export interface UsersRepositoryPort {
  list(): Promise<AppUser[]>;
  update(id: number, patch: UserPatch): Promise<AppUser>;
}

export interface RolesRepositoryPort {
  list(): Promise<AppRole[]>;
  create(draft: RoleDraft): Promise<AppRole>;
  update(id: number, patch: RolePatch): Promise<AppRole>;
  delete(id: number): Promise<void>;
  permissionCatalog(): Promise<PermissionCatalog>;
}
