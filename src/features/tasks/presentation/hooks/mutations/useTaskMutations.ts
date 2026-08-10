"use client";

import type { QueryClient } from "@tanstack/react-query";
import { useEntityMutation } from "@/shared/presentation/hooks/useEntityMutation";
import { tasksKeys } from "@/tasks/application";
import type { TaskDraft, TaskEntityLink, TaskMoveInput, TaskPatch } from "@/tasks/domain";
import {
  createTaskAction,
  updateTaskAction,
  moveTaskAction,
  setTaskAssigneeAction,
  setTaskLabelsAction,
  setTaskEntityAction,
  deleteTaskAction,
  addTaskCommentAction,
  updateTaskCommentAction,
  deleteTaskCommentAction,
} from "@/tasks/actions/taskActions";

function invalidateAfterChange(qc: QueryClient, id?: number) {
  void qc.invalidateQueries({ queryKey: tasksKeys.board() });
  void qc.invalidateQueries({ queryKey: tasksKeys.lists() });
  if (id != null) void qc.invalidateQueries({ queryKey: tasksKeys.detail(id) });
}

/**
 * No optimistic cache patch on move: the true position is server-computed
 * (computeInsertPosition), so — same call notes made for its own tree drag
 * (useNoteMutations.moveMutation) — the board just waits on the round trip and
 * refetches. dnd-kit's own transform handles the feel during the drag itself.
 */
export function useTaskMutations() {
  const createMutation = useEntityMutation({
    entityLabel: "Task",
    action: "created",
    mutationFn: (draft: TaskDraft) => createTaskAction(draft),
    invalidate: (qc) => invalidateAfterChange(qc),
  });

  const updateMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    mutationFn: ({ id, patch }: { id: number; patch: TaskPatch }) => updateTaskAction(id, patch),
    invalidate: (qc, data) => invalidateAfterChange(qc, data.id),
  });

  const moveMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    successMessage: "Task moved",
    mutationFn: ({ id, input }: { id: number; input: TaskMoveInput }) => moveTaskAction(id, input),
    invalidate: (qc, data) => invalidateAfterChange(qc, data.id),
  });

  const setAssigneeMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    successMessage: "Assignee updated",
    mutationFn: ({ id, userId }: { id: number; userId: number | null }) =>
      setTaskAssigneeAction(id, userId),
    invalidate: (qc, data) => invalidateAfterChange(qc, data.id),
  });

  const setLabelsMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    successMessage: "Labels updated",
    mutationFn: ({ id, labelIds }: { id: number; labelIds: number[] }) =>
      setTaskLabelsAction(id, labelIds),
    invalidate: (qc, data) => invalidateAfterChange(qc, data.id),
  });

  const setEntityMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    successMessage: "Linked record updated",
    mutationFn: ({ id, link }: { id: number; link: TaskEntityLink | null }) =>
      setTaskEntityAction(id, link),
    invalidate: (qc, data) => invalidateAfterChange(qc, data.id),
  });

  const deleteMutation = useEntityMutation({
    entityLabel: "Task",
    action: "deleted",
    mutationFn: (id: number) => deleteTaskAction(id),
    invalidate: (qc) => invalidateAfterChange(qc),
  });

  const addCommentMutation = useEntityMutation({
    entityLabel: "Comment",
    action: "created",
    mutationFn: ({ taskId, body }: { taskId: number; body: Record<string, unknown> }) =>
      addTaskCommentAction(taskId, body),
    invalidate: (qc, data) => invalidateAfterChange(qc, data.taskId),
  });

  const updateCommentMutation = useEntityMutation({
    entityLabel: "Comment",
    action: "updated",
    mutationFn: ({
      taskId,
      commentId,
      body,
    }: {
      taskId: number;
      commentId: number;
      body: Record<string, unknown>;
    }) => updateTaskCommentAction(taskId, commentId, body),
    invalidate: (qc, data) => invalidateAfterChange(qc, data.taskId),
  });

  const deleteCommentMutation = useEntityMutation({
    entityLabel: "Comment",
    action: "deleted",
    mutationFn: ({ taskId, commentId }: { taskId: number; commentId: number }) =>
      deleteTaskCommentAction(taskId, commentId),
    invalidate: (qc, _data, input) => invalidateAfterChange(qc, input.taskId),
  });

  return {
    createMutation,
    updateMutation,
    moveMutation,
    setAssigneeMutation,
    setLabelsMutation,
    setEntityMutation,
    deleteMutation,
    addCommentMutation,
    updateCommentMutation,
    deleteCommentMutation,
  };
}
