"use client";

import type { ReactNode } from "react";
import { useHasPermission } from "./useHasPermission";
import type { Permission } from "./permissions";

type Props = {
  permission: Permission;
  children: ReactNode;
  /** Rendered instead when the permission is missing. Omit to render nothing. */
  fallback?: ReactNode;
};

/**
 * UX only, not a security boundary — the backend enforces the same
 * permission independently via @RequirePermissions. This just keeps a user
 * from seeing a widget or button that would 403 if they used it.
 */
export function Can({ permission, children, fallback = null }: Props) {
  const allowed = useHasPermission(permission);
  return <>{allowed ? children : fallback}</>;
}
