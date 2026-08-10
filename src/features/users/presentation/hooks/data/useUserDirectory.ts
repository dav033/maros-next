"use client";

import { useQuery } from "@tanstack/react-query";
import { useUsersApp } from "@/di";
import { usersKeys, listUserDirectory } from "@/features/users/application";
import type { DirectoryUser } from "@/features/users/domain";

/** Colleagues change rarely; five minutes of cache keeps pickers instant. */
const STALE_TIME_MS = 5 * 60_000;

export function useUserDirectory(enabled: boolean) {
  const ctx = useUsersApp();

  const query = useQuery<DirectoryUser[]>({
    queryKey: usersKeys.directory(),
    queryFn: () => listUserDirectory(ctx),
    enabled,
    staleTime: STALE_TIME_MS,
  });

  return { users: query.data ?? [], isLoading: query.isPending };
}
