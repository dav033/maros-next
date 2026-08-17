"use client";

import type { QueryClient } from "@tanstack/react-query";
import { useEntityMutation } from "@/shared/presentation/hooks/useEntityMutation";
import { tasksKeys } from "@/tasks/application";
import type {
  TaskDraft,
  TaskEntityLink,
  TaskMoveInput,
  TaskRescheduleInput,
  TaskPatch,
  TaskReorderInput,
  TaskStatus,
} from "@/tasks/domain";
import {
  createTaskAction,
  updateTaskAction,
  moveTaskAction,
  rescheduleTaskAction,
  reorderSubtaskAction,
  setTaskAssigneeAction,
  setTaskLabelsAction,
  setTaskEntityAction,
  setTaskPartiesAction,
  addTaskWatcherAction,
  removeTaskWatcherAction,
  archiveTaskAction,
  restoreTaskAction,
  addTaskAttachmentsAction,
  removeTaskAttachmentAction,
  reorderTaskAttachmentsAction,
  deleteTaskAction,
  addTaskCommentAction,
  updateTaskCommentAction,
  deleteTaskCommentAction,
  bulkSetTaskAssigneeAction,
  bulkSetTaskStatusAction,
  bulkAddTaskLabelsAction,
  bulkDeleteTasksAction,
} from "@/tasks/actions/taskActions";
import { scopeForTaskPatch, type TaskInvalidationScope } from "./taskInvalidationScope";
import { optimisticMoveTask } from "../../organisms/taskBoardOptimisticMove";

function invalidateDetail(qc: QueryClient, id: number) {
  void qc.invalidateQueries({ queryKey: tasksKeys.detail(id) });
}

function invalidateBoardAndLists(qc: QueryClient) {
  // `tasksKeys.all` also covers entity/party boards embedded in CRM records;
  // otherwise a mutation made from an embedded board would look stale until a
  // full page refresh.
  void qc.invalidateQueries({ queryKey: tasksKeys.all });
}

/**
 * The four query groups a task can appear in. Kept as one function (rather than
 * scattering `invalidateQueries` calls per mutation) so every caller reasons about
 * scope the same way — see TaskInvalidationScope and scopeForTaskPatch.
 */
function invalidateByScope(qc: QueryClient, scope: TaskInvalidationScope, id?: number) {
  if (scope === "detail") {
    if (id != null) invalidateDetail(qc, id);
    return;
  }
  invalidateBoardAndLists(qc);
  if (scope === "all") {
    void qc.invalidateQueries({ queryKey: tasksKeys.mine() });
  }
  if (id != null) invalidateDetail(qc, id);
}

export function useTaskMutations() {
  const createMutation = useEntityMutation({
    entityLabel: "Task",
    action: "created",
    mutationFn: (draft: TaskDraft) => createTaskAction(draft),
    // A brand-new task has no cached detail to invalidate yet.
    invalidate: (qc) => invalidateByScope(qc, "all"),
  });

  const updateMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    mutationFn: ({ id, patch }: { id: number; patch: TaskPatch }) => updateTaskAction(id, patch),
    // Scoped to whichever fields the patch actually touched — see
    // scopeForTaskPatch. A description-only save (the common autosave-on-blur
    // case) no longer refetches the board and every list on every edit.
    invalidate: (qc, data, input) => invalidateByScope(qc, scopeForTaskPatch(input.patch), data.id),
  });

  const moveMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    successMessage: "Task moved",
    mutationFn: ({ id, input }: { id: number; input: TaskMoveInput }) => moveTaskAction(id, input),
    // The board reorders the instant a card is dropped instead of waiting on the
    // round trip — see taskBoardOptimisticMove. Only the array order moves; `position`
    // stays server-computed (computeInsertPosition), so the eventual invalidate below
    // (or someone else's move arriving over SSE) reconciles the real value shortly
    // after. On failure, useEntityMutation's onError restores the pre-drag snapshot —
    // the card visibly springs back rather than staying in a spot the server rejected.
    optimistic: (qc, { id, input }) =>
      optimisticMoveTask(qc, {
        taskId: id,
        toStatus: input.status,
        beforeId: input.beforeId ?? undefined,
        afterId: input.afterId ?? undefined,
      }),
    // Status change can flip whether the task appears in "Mine" at all (findMine
    // excludes done/cancelled) — always the full scope.
    invalidate: (qc, data) => invalidateByScope(qc, "all", data.id),
  });

  const reorderSubtaskMutation = useEntityMutation({
    entityLabel: "Subtask",
    action: "updated",
    successMessage: "Subtask reordered",
    mutationFn: ({ id, input }: { id: number; parentId: number; input: TaskReorderInput }) =>
      reorderSubtaskAction(id, input),
    // Subtask order shows nowhere but the parent's detail sheet — not on the board's
    // card, which only counts them ("2/4 subtasks"), and not on the list or "Mine".
    invalidate: (qc, _data, input) => invalidateByScope(qc, "detail", input.parentId),
  });

  const setAssigneeMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    successMessage: "Assignee updated",
    mutationFn: ({ id, userId }: { id: number; userId: number | null }) =>
      setTaskAssigneeAction(id, userId),
    // Reassigning changes "Mine" membership for both the old and new assignee.
    invalidate: (qc, data) => invalidateByScope(qc, "all", data.id),
  });

  const setLabelsMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    successMessage: "Labels updated",
    mutationFn: ({ id, labelIds }: { id: number; labelIds: number[] }) =>
      setTaskLabelsAction(id, labelIds),
    // Labels render on the board and the list, not on "Mine".
    invalidate: (qc, data) => invalidateByScope(qc, "detail+board+lists", data.id),
  });

  const setEntityMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    successMessage: "Linked record updated",
    mutationFn: ({ id, link }: { id: number; link: TaskEntityLink | null }) =>
      setTaskEntityAction(id, link),
    // The linked record's address shows on "Mine" (MyTaskRow) too, not just board/list.
    invalidate: (qc, data) => invalidateByScope(qc, "all", data.id),
  });

  const rescheduleMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    successMessage: "Schedule updated",
    mutationFn: ({ id, input }: { id: number; input: TaskRescheduleInput }) => rescheduleTaskAction(id, input),
    invalidate: (qc, data) => invalidateByScope(qc, "all", data.id),
  });

  const setPartiesMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    successMessage: "Related party updated",
    mutationFn: ({
      id,
      parties,
    }: {
      id: number;
      parties: Array<{ partyKind: "company" | "contact"; partyId: number; role?: string }>;
    }) => setTaskPartiesAction(id, parties),
    invalidate: (qc, _data, input) => {
      invalidateByScope(qc, "all", input.id);
    },
  });

  const addWatcherMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    mutationFn: ({ id, userId }: { id: number; userId: number }) => addTaskWatcherAction(id, userId),
    invalidate: (qc, _data, input) => invalidateDetail(qc, input.id),
  });
  const removeWatcherMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    mutationFn: ({ id, userId }: { id: number; userId: number }) => removeTaskWatcherAction(id, userId),
    invalidate: (qc, _data, input) => invalidateDetail(qc, input.id),
  });

  // Additive, never a full-list replace — see TaskPatch for why. No success toast:
  // uploads/removals get their own feedback (EntityAttachmentsSection's own toasts).
  // Attachments render only inside the detail sheet — no board/list/mine card shows them.
  const addAttachmentsMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    mutationFn: ({ id, keys }: { id: number; keys: string[] }) => addTaskAttachmentsAction(id, keys),
    invalidate: (qc, data) => invalidateByScope(qc, "detail", data.id),
  });

  const removeAttachmentMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    mutationFn: ({ id, key }: { id: number; key: string }) => removeTaskAttachmentAction(id, key),
    invalidate: (qc, data) => invalidateByScope(qc, "detail", data.id),
  });

  const reorderAttachmentsMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    mutationFn: ({ id, keys }: { id: number; keys: string[] }) => reorderTaskAttachmentsAction(id, keys),
    invalidate: (qc, data) => invalidateByScope(qc, "detail", data.id),
  });

  const deleteMutation = useEntityMutation({
    entityLabel: "Task",
    action: "deleted",
    // No detail invalidation: the caller closes the sheet on success (see
    // TaskDetailSheet's confirm-delete handler) rather than this hook reaching
    // for a query about to have nothing to show.
    mutationFn: (id: number) => deleteTaskAction(id),
    invalidate: (qc) => invalidateByScope(qc, "all"),
  });

  const archiveMutation = useEntityMutation({
    entityLabel: "Task",
    action: "archived",
    mutationFn: (id: number) => archiveTaskAction(id),
    invalidate: (qc) => invalidateByScope(qc, "all"),
  });

  const restoreMutation = useEntityMutation({
    entityLabel: "Task",
    action: "restored",
    mutationFn: (id: number) => restoreTaskAction(id),
    invalidate: (qc, data) => invalidateByScope(qc, "all", data.id),
  });

  // commentsCount shows on the board's TaskCard, but not on the list or "Mine" —
  // see TaskListTable/MyTaskRow.
  const addCommentMutation = useEntityMutation({
    entityLabel: "Comment",
    action: "created",
    mutationFn: ({ taskId, body }: { taskId: number; body: Record<string, unknown> }) =>
      addTaskCommentAction(taskId, body),
    invalidate: (qc, data) => {
      invalidateDetail(qc, data.taskId);
      void qc.invalidateQueries({ queryKey: tasksKeys.board() });
    },
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
    // Editing a comment's text doesn't change commentsCount — detail only.
    invalidate: (qc, data) => invalidateByScope(qc, "detail", data.taskId),
  });

  const deleteCommentMutation = useEntityMutation({
    entityLabel: "Comment",
    action: "deleted",
    mutationFn: ({ taskId, commentId }: { taskId: number; commentId: number }) =>
      deleteTaskCommentAction(taskId, commentId),
    invalidate: (qc, _data, input) => {
      invalidateDetail(qc, input.taskId);
      void qc.invalidateQueries({ queryKey: tasksKeys.board() });
    },
  });

  // Bulk mutations report per-task success/failure (TaskBulkResult) rather than one
  // pass/fail — the caller (the list's selection toolbar) reads that to show which
  // tasks, if any, didn't go through, on top of the generic success toast below.
  const bulkSetAssigneeMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    successMessage: "Assignee updated",
    mutationFn: ({ taskIds, userId }: { taskIds: number[]; userId: number | null }) =>
      bulkSetTaskAssigneeAction(taskIds, userId),
    invalidate: (qc) => invalidateByScope(qc, "all"),
  });

  const bulkSetStatusMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    successMessage: "Tasks moved",
    mutationFn: ({
      taskIds,
      status,
      blockedReason,
    }: {
      taskIds: number[];
      status: TaskStatus;
      blockedReason?: string;
    }) => bulkSetTaskStatusAction(taskIds, status, blockedReason),
    invalidate: (qc) => invalidateByScope(qc, "all"),
  });

  const bulkAddLabelsMutation = useEntityMutation({
    entityLabel: "Task",
    action: "updated",
    successMessage: "Labels added",
    mutationFn: ({ taskIds, labelIds }: { taskIds: number[]; labelIds: number[] }) =>
      bulkAddTaskLabelsAction(taskIds, labelIds),
    // Labels render on the board and the list, not on "Mine" — matches setLabelsMutation.
    invalidate: (qc) => invalidateByScope(qc, "detail+board+lists"),
  });

  const bulkDeleteMutation = useEntityMutation({
    entityLabel: "Task",
    action: "deleted",
    mutationFn: ({ taskIds }: { taskIds: number[] }) => bulkDeleteTasksAction(taskIds),
    invalidate: (qc) => invalidateByScope(qc, "all"),
  });

  return {
    createMutation,
    updateMutation,
    moveMutation,
    rescheduleMutation,
    setAssigneeMutation,
    setLabelsMutation,
    setEntityMutation,
    setPartiesMutation,
    addWatcherMutation,
    removeWatcherMutation,
    addAttachmentsMutation,
    removeAttachmentMutation,
    reorderAttachmentsMutation,
    reorderSubtaskMutation,
    deleteMutation,
    archiveMutation,
    restoreMutation,
    addCommentMutation,
    updateCommentMutation,
    deleteCommentMutation,
    bulkSetAssigneeMutation,
    bulkSetStatusMutation,
    bulkAddLabelsMutation,
    bulkDeleteMutation,
  };
}
