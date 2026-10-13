"use client";

import { CalendarDays, KanbanSquare, Rows3, UserCheck } from "lucide-react";
import { AnimatedBackground } from "@/components/ui/animated-background";
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
    <div
      role="group"
      aria-label="Task views"
      data-task-view-switcher
      className="inline-flex rounded-lg border border-line bg-elev-1 p-0.5"
    >
      <AnimatedBackground
        value={current}
        onValueChange={(view) => replaceState({ view })}
      >
        {options.map((option) => {
          const active = option.value === current;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              data-id={option.value}
              aria-current={active ? "page" : undefined}
              aria-pressed={active}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[checked=true]:text-foreground motion-reduce:transition-none"
            >
              <Icon className="h-3.5 w-3.5" />
              {option.label}
            </button>
          );
        })}
      </AnimatedBackground>
    </div>
  );
}
