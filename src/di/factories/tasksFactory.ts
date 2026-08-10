import type { TasksAppContext } from "@/tasks";
import { makeTasksAppContext, TasksHttpRepository, TaskLabelsHttpRepository } from "@/tasks";

export function createTasksAppContext(): TasksAppContext {
  return makeTasksAppContext({
    repos: {
      task: new TasksHttpRepository(),
      label: new TaskLabelsHttpRepository(),
    },
  });
}
