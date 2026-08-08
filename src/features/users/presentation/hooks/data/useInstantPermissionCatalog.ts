"use client";

import { useQuery } from "@tanstack/react-query";
import { useUsersApp } from "@/di";
import { rolesKeys, getPermissionCatalog } from "@/features/users/application";
import type { PermissionCatalog } from "@/features/users/domain";

export function useInstantPermissionCatalog(initialData?: PermissionCatalog) {
  const ctx = useUsersApp();
  const query = useQuery<PermissionCatalog>({
    queryKey: rolesKeys.permissions(),
    queryFn: () => getPermissionCatalog(ctx),
    initialData,
    staleTime: 5 * 60 * 1000,
  });
  return { ...query, catalog: query.data ?? { permissions: [], groups: [] } };
}
