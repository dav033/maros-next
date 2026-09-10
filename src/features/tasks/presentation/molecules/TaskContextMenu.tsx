import { Check } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";
import type { Task } from "@/tasks/domain";
import { createTaskActionDefinitions, type TaskActionHandlers } from "./taskActionDefinitions";

export function TaskContextMenu({ task, handlers, children }: { task: Task; handlers: TaskActionHandlers; children: ReactNode }) {
  const actions = createTaskActionDefinitions(task, handlers);
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-52">
        {actions.map((action, index) => (
          <Fragment key={action.id}>
            {action.id === "delete" || index === 1 ? <ContextMenuSeparator /> : null}
            {action.children ? (
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <action.icon />
                  {action.label}
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {action.children.map((child) => (
                    <ContextMenuItem key={child.id} onSelect={child.onSelect}>
                      <span className="flex w-4 justify-center">{child.selected ? <Check className="h-3.5 w-3.5" /> : null}</span>
                      {child.label}
                    </ContextMenuItem>
                  ))}
                </ContextMenuSubContent>
              </ContextMenuSub>
            ) : (
              <ContextMenuItem onSelect={action.onSelect} className={cn(action.destructive && "text-destructive focus:text-destructive")}>
                <action.icon />
                {action.label}
              </ContextMenuItem>
            )}
          </Fragment>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
}
