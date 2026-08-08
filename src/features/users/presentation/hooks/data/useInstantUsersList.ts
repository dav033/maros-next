"use client";

import { useInstantList } from "@/shared/query";
import { useUsersApp } from "@/di";
import { usersKeys, listUsers } from "@/features/users/application";
import type { AppUser } from "@/features/users/domain";

export function useInstantUsersList(initialData?: AppUser[]) {
  const ctx = useUsersApp();
  const result = useInstantList<AppUser>({
    queryKey: usersKeys.lists(),
    queryFn: () => listUsers(ctx),
    initialData,
  });
  return { ...result, users: result.data ?? [] };
}
