import type { Permission } from "@/shared/auth/permissions";
import type { LeadType } from "@/leads/domain";

/** 'internal' is staff; 'external' is an outside guest scoped to a company/contact. */
export type UserType = "internal" | "external";

/** Lifecycle only. `isActive` stays the flag that actually grants access. */
export type UserStatus = "invited" | "active" | "disabled";

export interface AppUser {
  id: number;
  email: string;
  name: string | null;
  picture: string | null;
  isActive: boolean;
  userType: UserType;
  status: UserStatus;
  scopedCompanyId: number | null;
  scopedContactId: number | null;
  /**
   * Los tipos de lead que puede ver. `null` es todos.
   *
   * A diferencia de `scopedCompanyId` y `scopedContactId`, este sí filtra: se
   * aplica en las lecturas de leads y de proyectos del backend.
   */
  scopedLeadTypes: LeadType[] | null;
  /** Non-null only while `status === "invited"`. */
  invitationExpiresAt: string | null;
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
  /** `null` quita la restricción y le devuelve todos los tipos. */
  scopedLeadTypes?: LeadType[] | null;
}>;

export type UserInvite = Readonly<{
  email: string;
  name?: string;
  roleId: number;
  userType: UserType;
  scopedCompanyId?: number;
  scopedContactId?: number;
  expiresInDays?: number;
}>;

/** What the API tells us about an invitation. Never the token itself. */
export interface UserInvitation {
  id: number;
  expiresAt: string;
}

export interface InvitedUser {
  user: AppUser;
  invitation: UserInvitation;
}

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

/** A colleague, as returned by /users/directory — no role, no permissions, no status. */
export interface DirectoryUser {
  id: number;
  name: string | null;
  email: string;
  picture: string | null;
}
