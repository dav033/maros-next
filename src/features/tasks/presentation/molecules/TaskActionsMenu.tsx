import { useRef, useState } from "react";
import { Check, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Task } from "@/tasks/domain";
import { createTaskActionDefinitions, type TaskActionHandlers } from "./taskActionDefinitions";

export function TaskActionsMenu({ task, handlers }: { task: Task; handlers: TaskActionHandlers }) {
  const actions = createTaskActionDefinitions(task, handlers);
  const [prioritySubmenuOpen, setPrioritySubmenuOpen] = useState(false);
  const prioritySubmenuTriggerRef = useRef<HTMLDivElement>(null);
  if (!actions.length) return null;
  return (
    <DropdownMenu onOpenChange={(open) => !open && setPrioritySubmenuOpen(false)}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Task actions"
          data-no-drag="true"
          className="rounded-md p-1 text-muted-foreground opacity-100 transition-opacity motion-reduce:transition-none hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100"
          onClick={(event) => event.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        {actions.map((action) => action.children ? (
          <DropdownMenuSub
            key={action.id}
            open={action.id === "priority" ? prioritySubmenuOpen : undefined}
            onOpenChange={action.id === "priority" ? setPrioritySubmenuOpen : undefined}
          >
            <DropdownMenuSubTrigger ref={action.id === "priority" ? prioritySubmenuTriggerRef : undefined}>
              <action.icon />
              {action.label}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              onEscapeKeyDown={(event) => {
                if (action.id !== "priority" || !prioritySubmenuOpen) return;
                event.preventDefault();
                setPrioritySubmenuOpen(false);
                prioritySubmenuTriggerRef.current?.focus({ preventScroll: true });
              }}
            >
              {action.children.map((child) => (
                <DropdownMenuItem key={child.id} onSelect={child.onSelect}>
                  <span className="flex w-4 justify-center">{child.selected ? <Check className="h-3.5 w-3.5" /> : null}</span>
                  {child.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ) : (
          <DropdownMenuItem key={action.id} onSelect={action.onSelect} className={cn(action.destructive && "text-destructive focus:text-destructive")}>
            <action.icon />
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
