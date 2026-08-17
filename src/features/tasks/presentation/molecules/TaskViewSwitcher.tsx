"use client";

import { CalendarDays, KanbanSquare, Rows3, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasksViewState, type TasksView } from "../hooks/useTasksViewState";

export function TaskViewSwitcher({ current }: { current: TasksView }) {
  const { replaceState } = useTasksViewState();
  const options = [
    { value: "board" as const, label: "Board", icon: KanbanSquare },
    { value: "list" as const, label: "List", icon: Rows3 },
    { value: "mine" as const, label: "Mine", icon: UserCheck },
    { value: "calendar" as const, label: "Calendar", icon: CalendarDays },
  ];

  return (
    <div className="inline-flex rounded-lg border border-border/60 bg-background/60 p-0.5">
      {options.map((option) => {
        const active = option.value === current;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            onClick={() => replaceState({ view: option.value })}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
