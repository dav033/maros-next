"use client";

import { useState } from "react";
import { AlertTriangle, Columns3, ListTodo, Plus, Rows3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TaskEntityKind } from "@/tasks/domain";
import { useInstantTasksByEntity } from "../hooks/data/useInstantTasksByEntity";
import { useInstantTasksByParty } from "../hooks/data/useInstantTasksByParty";
import { useTaskDetailRoute } from "../hooks/useTaskDetailRoute";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskDetailSheet } from "./TaskDetailSheet";
import { TaskKindIcon } from "../atoms/TaskKindIcon";
import { TaskStatusBadge } from "../atoms/TaskStatusBadge";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { DueDatePill } from "../atoms/DueDatePill";
import { TaskBoard } from "./TaskBoard";

/** Calqued on EntityNotesSection — same Card, same "create preselects this record" pattern. */
export function EntityTasksSection({
  entityKind,
  entityId,
  partyKind,
  partyId,
  entityLabel,
}: {
  entityKind: TaskEntityKind;
  entityId: number;
  partyKind?: "company" | "contact";
  partyId?: number;
  entityLabel?: string;
}) {
  const entityQuery = useInstantTasksByEntity(entityKind, entityId);
  const partyQuery = useInstantTasksByParty(partyKind, partyId);
  const query = partyKind && partyId != null ? partyQuery : entityQuery;
  const { tasks, isLoading } = query;
  const { taskId, openTask, closeTask } = useTaskDetailRoute();
  const [displayMode, setDisplayMode] = useState<"list" | "board">("board");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <ListTodo className="h-4 w-4" />
          Tasks{entityLabel ? ` · ${entityLabel}` : ""}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setDisplayMode((mode) => mode === "list" ? "board" : "list")} aria-label="Toggle task board">
            {displayMode === "list" ? <Columns3 className="h-4 w-4" /> : <Rows3 className="h-4 w-4" />}
          </Button>
          <CreateTaskDialog
            defaultEntityKind={partyKind ? undefined : entityKind}
            defaultEntityId={partyKind ? undefined : entityId}
            defaultEntityLabel={entityLabel}
            defaultPartyKind={partyKind}
            defaultPartyId={partyId}
            defaultPartyLabel={entityLabel}
            onCreated={openTask}
            trigger={<Button type="button" variant="outline" size="sm"><Plus className="mr-1 h-4 w-4" />New task</Button>}
          />
        </div>
      </CardHeader>
      <CardContent>
        {!isLoading && tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">No tasks linked yet.</p>
        )}
        {displayMode === "board" ? (
          <TaskBoard
            embeddedTasks={tasks}
            embeddedEntity={{ entityKind: partyKind ? undefined : entityKind, entityId: partyKind ? undefined : entityId, partyKind, partyId }}
            onOpenTask={openTask}
          />
        ) : null}
        {displayMode === "list" ? <div className="space-y-1">
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
        </div> : null}
      </CardContent>

      <TaskDetailSheet taskId={taskId} onClose={closeTask} onOpenTask={openTask} />
    </Card>
  );
}
