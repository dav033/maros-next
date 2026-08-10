"use client";

import { useEntityMutation } from "@/shared/presentation/hooks/useEntityMutation";
import { taskLabelsKeys } from "@/tasks/application";
import type { TaskLabelDraft, TaskLabelPatch } from "@/tasks/domain";
import {
  createTaskLabelAction,
  updateTaskLabelAction,
  deleteTaskLabelAction,
} from "@/tasks/actions/taskActions";

export function useTaskLabelMutations() {
  const createMutation = useEntityMutation({
    entityLabel: "Label",
    action: "created",
    mutationFn: (draft: TaskLabelDraft) => createTaskLabelAction(draft),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: taskLabelsKeys.lists() });
    },
  });

  const updateMutation = useEntityMutation({
    entityLabel: "Label",
    action: "updated",
    mutationFn: ({ id, patch }: { id: number; patch: TaskLabelPatch }) =>
      updateTaskLabelAction(id, patch),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: taskLabelsKeys.lists() });
    },
  });

  const deleteMutation = useEntityMutation({
    entityLabel: "Label",
    action: "deleted",
    mutationFn: (id: number) => deleteTaskLabelAction(id),
    invalidate: (qc) => {
      void qc.invalidateQueries({ queryKey: taskLabelsKeys.lists() });
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
