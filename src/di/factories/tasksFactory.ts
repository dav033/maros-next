import type { TasksAppContext } from "@/tasks";
import { makeTasksAppContext, TasksHttpRepository, TaskLabelsHttpRepository, TaskWorkspacesHttpRepository } from "@/tasks";

export function createTasksAppContext(): TasksAppContext {
  return makeTasksAppContext({
    repos: {
      task: new TasksHttpRepository(),
      label: new TaskLabelsHttpRepository(),
      workspace: new TaskWorkspacesHttpRepository(),
    },
  });
}
