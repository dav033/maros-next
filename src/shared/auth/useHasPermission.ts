"use client";

import { useCurrentUser } from "./CurrentUserProvider";
import type { Permission } from "./permissions";

export function useHasPermission(permission: Permission): boolean {
  return useCurrentUser().hasPermission(permission);
}
