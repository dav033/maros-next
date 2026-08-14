"use server";

import { headers } from "next/headers";
import { createServerApiClient } from "@/shared/infra/http";
import { TasksHttpRepository, TaskLabelsHttpRepository, makeTasksAppContext } from "@/tasks";
import type { ActionResult } from "@/shared/actions/types";
import { success, handleActionError } from "@/shared/actions/utils";
import type {
  TaskBulkResult,
  TaskComment,
  TaskDetail,
  TaskDraft,
  TaskEntityLink,
  TaskLabel,
  TaskLabelDraft,
  TaskLabelPatch,
  TaskMoveInput,
  TaskMoveResult,
  TaskPatch,
  TaskReorderInput,
  TaskStatus,
} from "@/tasks/domain";

// The plain `serverApiClient` singleton carries no request context and forwards no
// cookie — every call through it comes back 401 no matter what the browser's session
// is. createServerApiClient forwards this request's Cookie header instead.
async function createServerTasksAppContext() {
  const api = createServerApiClient(await headers());
  return makeTasksAppContext({
    repos: {
      task: new TasksHttpRepository(api),
      label: new TaskLabelsHttpRepository(api),
    },
  });
}

export async function createTaskAction(draft: TaskDraft): Promise<ActionResult<TaskDetail>> {
  try {
    const ctx = await createServerTasksAppContext();
    const task = await ctx.repos.task.create(draft);
    return success(task);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateTaskAction(
  id: number,
  patch: TaskPatch
): Promise<ActionResult<TaskDetail>> {
  try {
    const ctx = await createServerTasksAppContext();
    const task = await ctx.repos.task.update(id, patch);
    return success(task);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function moveTaskAction(
  id: number,
  input: TaskMoveInput
): Promise<ActionResult<TaskMoveResult>> {
  try {
    const ctx = await createServerTasksAppContext();
    const result = await ctx.repos.task.move(id, input);
    return success(result);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderSubtaskAction(
  id: number,
  input: TaskReorderInput
): Promise<ActionResult<TaskDetail>> {
  try {
    const ctx = await createServerTasksAppContext();
    const parent = await ctx.repos.task.reorderSubtask(id, input);
    return success(parent);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function setTaskAssigneeAction(
  id: number,
  userId: number | null
): Promise<ActionResult<TaskDetail>> {
  try {
    const ctx = await createServerTasksAppContext();
    const task = await ctx.repos.task.setAssignee(id, userId);
    return success(task);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function setTaskLabelsAction(
  id: number,
  labelIds: number[]
): Promise<ActionResult<TaskDetail>> {
  try {
    const ctx = await createServerTasksAppContext();
    const task = await ctx.repos.task.setLabels(id, labelIds);
    return success(task);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function setTaskEntityAction(
  id: number,
  link: TaskEntityLink | null
): Promise<ActionResult<TaskDetail>> {
  try {
    const ctx = await createServerTasksAppContext();
    const task = await ctx.repos.task.setEntityLink(id, link);
    return success(task);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function addTaskAttachmentsAction(
  id: number,
  keys: string[]
): Promise<ActionResult<TaskDetail>> {
  try {
    const ctx = await createServerTasksAppContext();
    const task = await ctx.repos.task.addAttachments(id, keys);
    return success(task);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function removeTaskAttachmentAction(
  id: number,
  key: string
): Promise<ActionResult<TaskDetail>> {
  try {
    const ctx = await createServerTasksAppContext();
    const task = await ctx.repos.task.removeAttachment(id, key);
    return success(task);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function reorderTaskAttachmentsAction(
  id: number,
  keys: string[]
): Promise<ActionResult<TaskDetail>> {
  try {
    const ctx = await createServerTasksAppContext();
    const task = await ctx.repos.task.reorderAttachments(id, keys);
    return success(task);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteTaskAction(id: number): Promise<ActionResult<null>> {
  try {
    const ctx = await createServerTasksAppContext();
    await ctx.repos.task.delete(id);
    return success(null);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function createTaskLabelAction(
  draft: TaskLabelDraft
): Promise<ActionResult<TaskLabel>> {
  try {
    const ctx = await createServerTasksAppContext();
    const label = await ctx.repos.label.create(draft);
    return success(label);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateTaskLabelAction(
  id: number,
  patch: TaskLabelPatch
): Promise<ActionResult<TaskLabel>> {
  try {
    const ctx = await createServerTasksAppContext();
    const label = await ctx.repos.label.update(id, patch);
    return success(label);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteTaskLabelAction(id: number): Promise<ActionResult<null>> {
  try {
    const ctx = await createServerTasksAppContext();
    await ctx.repos.label.delete(id);
    return success(null);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function addTaskCommentAction(
  taskId: number,
  body: Record<string, unknown>
): Promise<ActionResult<TaskComment>> {
  try {
    const ctx = await createServerTasksAppContext();
    const comment = await ctx.repos.task.addComment(taskId, body);
    return success(comment);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function updateTaskCommentAction(
  taskId: number,
  commentId: number,
  body: Record<string, unknown>
): Promise<ActionResult<TaskComment>> {
  try {
    const ctx = await createServerTasksAppContext();
    const comment = await ctx.repos.task.updateComment(taskId, commentId, body);
    return success(comment);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function deleteTaskCommentAction(
  taskId: number,
  commentId: number
): Promise<ActionResult<null>> {
  try {
    const ctx = await createServerTasksAppContext();
    await ctx.repos.task.deleteComment(taskId, commentId);
    return success(null);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function bulkSetTaskAssigneeAction(
  taskIds: number[],
  userId: number | null
): Promise<ActionResult<TaskBulkResult>> {
  try {
    const ctx = await createServerTasksAppContext();
    const result = await ctx.repos.task.bulkSetAssignee(taskIds, userId);
    return success(result);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function bulkSetTaskStatusAction(
  taskIds: number[],
  status: TaskStatus,
  blockedReason?: string
): Promise<ActionResult<TaskBulkResult>> {
  try {
    const ctx = await createServerTasksAppContext();
    const result = await ctx.repos.task.bulkSetStatus(taskIds, status, blockedReason);
    return success(result);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function bulkAddTaskLabelsAction(
  taskIds: number[],
  labelIds: number[]
): Promise<ActionResult<TaskBulkResult>> {
  try {
    const ctx = await createServerTasksAppContext();
    const result = await ctx.repos.task.bulkAddLabels(taskIds, labelIds);
    return success(result);
  } catch (error) {
    return handleActionError(error);
  }
}

export async function bulkDeleteTasksAction(
  taskIds: number[]
): Promise<ActionResult<TaskBulkResult>> {
  try {
    const ctx = await createServerTasksAppContext();
    const result = await ctx.repos.task.bulkDelete(taskIds);
    return success(result);
  } catch (error) {
    return handleActionError(error);
  }
}
