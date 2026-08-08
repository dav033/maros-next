"use client";

import { useEntityMutation } from "@/shared/presentation/hooks/useEntityMutation";
import { rolesKeys } from "@/features/users/application";
import type { RoleDraft, RolePatch } from "@/features/users/domain";
import {
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
} from "@/features/users/actions/userActions";

export function useRoleMutations() {
  const createMutation = useEntityMutation({
    entityLabel: "Role",
    action: "created",
    mutationFn: (draft: RoleDraft) => createRoleAction(draft),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });

  const updateMutation = useEntityMutation({
    entityLabel: "Role",
    action: "updated",
    mutationFn: ({ id, patch }: { id: number; patch: RolePatch }) =>
      updateRoleAction(id, patch),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });

  const deleteMutation = useEntityMutation({
    entityLabel: "Role",
    action: "deleted",
    mutationFn: (id: number) => deleteRoleAction(id),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
