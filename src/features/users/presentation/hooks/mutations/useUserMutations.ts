"use client";

import { useEntityMutation } from "@/shared/presentation/hooks/useEntityMutation";
import { usersKeys } from "@/features/users/application";
import type { UserInvite, UserPatch } from "@/features/users/domain";
import {
  inviteUserAction,
  resendInvitationAction,
  revokeInvitationAction,
  updateUserAction,
} from "@/features/users/actions/userActions";

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

  const inviteMutation = useEntityMutation({
    entityLabel: "Invitación",
    action: "created",
    mutationFn: (draft: UserInvite) => inviteUserAction(draft),
    successMessage: "Invitación enviada por correo",
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });

  const resendInviteMutation = useEntityMutation({
    entityLabel: "Invitación",
    action: "updated",
    mutationFn: (id: number) => resendInvitationAction(id),
    successMessage: "Invitación reenviada. El enlace anterior ya no sirve.",
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });

  const revokeInviteMutation = useEntityMutation({
    entityLabel: "Invitación",
    action: "deleted",
    mutationFn: (id: number) => revokeInvitationAction(id),
    successMessage: "Invitación cancelada y cuenta desactivada",
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });

  return { updateMutation, inviteMutation, resendInviteMutation, revokeInviteMutation };
}
