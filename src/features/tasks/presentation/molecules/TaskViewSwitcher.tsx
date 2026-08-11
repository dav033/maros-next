"use client";

import Link from "next/link";
import { KanbanSquare, Rows3, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function TaskViewSwitcher({ current }: { current: "board" | "list" | "mine" }) {
  const options = [
    { value: "board" as const, label: "Board", href: "/tasks", icon: KanbanSquare },
    { value: "list" as const, label: "List", href: "/tasks/list", icon: Rows3 },
    { value: "mine" as const, label: "Mine", href: "/tasks/mine", icon: UserCheck },
  ];

  return (
    <div className="inline-flex rounded-lg border border-border/60 bg-background/60 p-0.5">
      {options.map((option) => {
        const active = option.value === current;
        const Icon = option.icon;
        return (
          <Link
            key={option.value}
            href={option.href}
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
          </Link>
        );
      })}
    </div>
  );
}
