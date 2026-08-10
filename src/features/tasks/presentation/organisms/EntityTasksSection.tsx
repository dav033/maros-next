"use client";

import { AlertTriangle, ListTodo, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TaskEntityKind } from "@/tasks/domain";
import { useInstantTasksByEntity } from "../hooks/data/useInstantTasksByEntity";
import { useTaskDetailRoute } from "../hooks/useTaskDetailRoute";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { TaskKindIcon } from "../atoms/TaskKindIcon";
import { TaskStatusBadge } from "../atoms/TaskStatusBadge";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { DueDatePill } from "../atoms/DueDatePill";

/** Calqued on EntityNotesSection — same Card, same "create preselects this record" pattern. */
export function EntityTasksSection({
  entityKind,
  entityId,
}: {
  entityKind: TaskEntityKind;
  entityId: number;
}) {
  const { tasks, isLoading } = useInstantTasksByEntity(entityKind, entityId);
  const { taskId, openTask, closeTask } = useTaskDetailRoute();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <ListTodo className="h-4 w-4" />
          Tasks
        </CardTitle>
        <CreateTaskDialog
          defaultEntityKind={entityKind}
          defaultEntityId={entityId}
          onCreated={openTask}
          trigger={
            <Button type="button" variant="outline" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              New task
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {!isLoading && tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No tasks linked yet.</p>
        )}
        <div className="space-y-1">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => openTask(task.id)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent/50"
            >
              <TaskKindIcon kind={task.kind} />
              <span className="min-w-0 flex-1 truncate">{task.title}</span>
              {task.status === "blocked" ? (
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />
              ) : null}
              <TaskStatusBadge status={task.status} />
              <AssigneeAvatar person={task.assignee} />
              {task.dueDate ? <DueDatePill dueDate={task.dueDate} /> : null}
            </button>
          ))}
        </div>
      </CardContent>

      <TaskDetailSheet taskId={taskId} onClose={closeTask} onOpenTask={openTask} />
    </Card>
  );
}
