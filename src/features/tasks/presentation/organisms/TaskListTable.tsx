"use client";

import Link from "next/link";
import { ListTodo } from "lucide-react";
import {
  DefaultTableLoading,
  EntityTable,
  type EntityTableGroupBy,
  type EntityTableSelection,
} from "@/components/shared";
import type { SimpleTableColumn } from "@/types/table";
import type { Task, TaskEntityKind } from "@/tasks/domain";
import { BOARD_STATUSES } from "@/tasks/domain";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import { DueDatePill } from "../atoms/DueDatePill";
import { TaskEmptyState } from "../atoms/TaskEmptyState";
import { TaskKindIcon } from "../atoms/TaskKindIcon";
import { TaskPriorityBadge } from "../atoms/TaskPriorityBadge";
import { TaskStatusBadge } from "../atoms/TaskStatusBadge";
import { TASK_KIND_LABELS, TASK_STATUS_COLORS, TASK_STATUS_LABELS, taskLabelColor } from "../atoms/taskVisualTokens";

const ENTITY_KIND_LABEL: Record<TaskEntityKind, string> = {
  lead: "Lead",
  project: "Project",
  contact: "Contact",
  company: "Company",
};

const groupByStatus: EntityTableGroupBy<Task> = {
  getKey: (task) => task.status,
  getLabel: (key) => (TASK_STATUS_LABELS as Record<string, string>)[key] ?? key,
  getColor: (key) => (TASK_STATUS_COLORS as Record<string, string>)[key],
  // cancelled sorts last — the list is the one view that shows it at all.
  order: [...BOARD_STATUSES, "cancelled"],
};

function buildColumns(onOpen: (id: number) => void): SimpleTableColumn<Task>[] {
  return [
    {
      key: "id",
      header: "Key",
      sortable: true,
      className: "w-20 font-mono text-xs text-muted-foreground",
      render: (task) => `T-${task.id}`,
    },
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (task) => (
        <button
          type="button"
          onClick={() => onOpen(task.id)}
          className="truncate text-left font-medium text-foreground hover:underline"
        >
          {task.title}
        </button>
      ),
    },
    {
      key: "kind",
      header: "Kind",
      sortable: true,
      sortValue: (task) => TASK_KIND_LABELS[task.kind],
      render: (task) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <TaskKindIcon kind={task.kind} />
          {TASK_KIND_LABELS[task.kind]}
        </span>
      ),
    },
    {
      key: "assignee",
      header: "Assignee",
      sortValue: (task) => task.assignee?.name ?? task.assignee?.email ?? "",
      render: (task) => (
        <div className="flex items-center gap-2">
          <AssigneeAvatar person={task.assignee} />
          <span className="truncate text-xs text-muted-foreground">
            {task.assignee?.name ?? task.assignee?.email ?? "Unassigned"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (task) => <TaskStatusBadge status={task.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      sortValue: (task) => task.priority,
      render: (task) => <TaskPriorityBadge priority={task.priority} showLabel={false} />,
    },
    {
      key: "dueDate",
      header: "Due",
      sortable: true,
      sortValue: (task) => task.dueDate ?? "",
      render: (task) =>
        task.dueDate ? <DueDatePill dueDate={task.dueDate} /> : <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      key: "entity",
      header: "Linked record",
      sortValue: (task) => task.entity?.label ?? "",
      render: (task) =>
        task.entity ? (
          <Link
            href={task.entity.href}
            onClick={(e) => e.stopPropagation()}
            className="truncate text-xs text-primary hover:underline"
          >
            {task.entity.label}
          </Link>
        ) : task.entityKind && task.entityId ? (
          <span className="text-xs text-muted-foreground">
            {ENTITY_KIND_LABEL[task.entityKind]} #{task.entityId} (not found)
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: "labels",
      header: "Labels",
      render: (task) =>
        task.labels.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {task.labels.map((label) => (
              <span
                key={label.id}
                className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: `${taskLabelColor(label.color)}22`,
                  color: taskLabelColor(label.color),
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
        ) : null,
    },
  ];
}

export function TaskListTable({
  tasks,
  isLoading,
  onOpenTask,
  selection,
}: {
  tasks: Task[];
  isLoading?: boolean;
  onOpenTask: (id: number) => void;
  /** Enables the row checkboxes + "select all" — see TaskBulkActionBar, which acts on whatever this holds. */
  selection?: EntityTableSelection;
}) {
  return (
    <EntityTable<Task>
      data={tasks}
      columns={buildColumns(onOpenTask)}
      rowKey={(task) => task.id}
      isLoading={isLoading}
      onRowClick={(task) => onOpenTask(task.id)}
      selection={selection}
      groupBy={groupByStatus}
      defaultSort={{ key: "id", dir: "desc" }}
      loadingState={<DefaultTableLoading label="Loading tasks…" />}
      emptyState={
        <TaskEmptyState
          icon={ListTodo}
          title="No tasks found."
          description="Use the button above to create one."
          className="bg-card/40"
        />
      }
    />
  );
}
