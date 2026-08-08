"use client";

import { useEntityMutation } from "@/shared/presentation/hooks/useEntityMutation";
import { usersKeys } from "@/features/users/application";
import type { UserPatch } from "@/features/users/domain";
import { updateUserAction } from "@/features/users/actions/userActions";

export function useUserMutations() {
  const updateMutation = useEntityMutation({
    entityLabel: "User",
    action: "updated",
    mutationFn: ({ id, patch }: { id: number; patch: UserPatch }) =>
      updateUserAction(id, patch),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });

  return { updateMutation };
}
