"use client";

import { useInstantList } from "@/shared/query";
import { useUsersApp } from "@/di";
import { rolesKeys, listRoles } from "@/features/users/application";
import type { AppRole } from "@/features/users/domain";

export function useInstantRolesList(initialData?: AppRole[]) {
  const ctx = useUsersApp();
  const result = useInstantList<AppRole>({
    queryKey: rolesKeys.lists(),
    queryFn: () => listRoles(ctx),
    initialData,
  });
  return { ...result, roles: result.data ?? [] };
}
