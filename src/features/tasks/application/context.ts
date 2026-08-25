import type { TaskLabelsRepositoryPort, TasksRepositoryPort } from "@/features/tasks/domain";
import type { TaskWorkspacesRepositoryPort } from "@/features/task-workspaces/domain";

export type TasksAppContext = Readonly<{
  repos: {
    task: TasksRepositoryPort;
    label: TaskLabelsRepositoryPort;
    workspace: TaskWorkspacesRepositoryPort;
  };
}>;

export function makeTasksAppContext(deps: TasksAppContext): TasksAppContext {
  return deps;
}
