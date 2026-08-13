"use client";

import { ChevronDown, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DirectoryUser } from "@/features/users/domain";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";
import type { AssigneeFilterKey } from "../organisms/taskBoardAssigneeFilter";

function describeSingle(selected: Set<AssigneeFilterKey>, users: DirectoryUser[]): string {
  const [key] = selected;
  if (key === "unassigned") return "Unassigned";
  return users.find((u) => u.id === key)?.name ?? users.find((u) => u.id === key)?.email ?? "1 assignee";
}

/**
 * Multi-select assignee filter with avatars — deliberately not built on the generic
 * MultiSelectFilter (string-keyed options with an optional color dot, no photo):
 * this stays task-specific rather than widening a component shared with leads and
 * other entities.
 */
export function AssigneeFilterDropdown({
  users,
  selected,
  onChange,
}: {
  users: DirectoryUser[];
  selected: Set<AssigneeFilterKey>;
  onChange: (next: Set<AssigneeFilterKey>) => void;
}) {
  const toggle = (key: AssigneeFilterKey) => {
    const next = new Set(selected);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(next);
  };

  const hasFilter = selected.size > 0;
  const summary = !hasFilter
    ? "All assignees"
    : selected.size === 1
      ? describeSingle(selected, users)
      : `Assignees (${selected.size})`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-9 items-center justify-between gap-1.5 rounded-md border border-border/60 bg-background/60 px-3 text-xs shadow-sm transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            hasFilter && "border-primary/40 text-primary"
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <Users className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="max-w-[9rem] truncate">{summary}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[220px]">
        <DropdownMenuItem
          disabled={selected.size === 0}
          onSelect={(event) => {
            event.preventDefault();
            onChange(new Set());
          }}
        >
          Clear filter
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={selected.has("unassigned")}
          onSelect={(event) => event.preventDefault()}
          onCheckedChange={() => toggle("unassigned")}
          className="gap-2"
        >
          <AssigneeAvatar person={null} />
          <span className="text-muted-foreground">Unassigned</span>
        </DropdownMenuCheckboxItem>
        {users.map((user) => (
          <DropdownMenuCheckboxItem
            key={user.id}
            checked={selected.has(user.id)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={() => toggle(user.id)}
            className="gap-2"
          >
            <AssigneeAvatar person={user} />
            <span className="truncate">{user.name ?? user.email}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
