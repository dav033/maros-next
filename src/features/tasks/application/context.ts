import type { TaskLabelsRepositoryPort, TasksRepositoryPort } from "@/features/tasks/domain";

export type TasksAppContext = Readonly<{
  repos: {
    task: TasksRepositoryPort;
    label: TaskLabelsRepositoryPort;
  };
}>;

export function makeTasksAppContext(deps: TasksAppContext): TasksAppContext {
  return deps;
}
