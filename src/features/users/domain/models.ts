import type { Permission } from "@/shared/auth/permissions";

export interface AppUser {
  id: number;
  email: string;
  name: string | null;
  picture: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  role: { id: number; name: string; isSystem: boolean } | null;
}

export interface AppRole {
  id: number;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: Permission[];
}

export interface PermissionGroup {
  key: string;
  label: string;
  permissions: Permission[];
}

export interface PermissionCatalog {
  permissions: Permission[];
  groups: PermissionGroup[];
}

export type UserPatch = Readonly<{
  roleId?: number;
  isActive?: boolean;
}>;

export type RoleDraft = Readonly<{
  name: string;
  description?: string;
  permissions: Permission[];
}>;

export type RolePatch = Readonly<{
  name?: string;
  description?: string;
  permissions?: Permission[];
}>;
