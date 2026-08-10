"use client";

import { useState, type ReactNode } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUserDirectory } from "@/features/users/presentation/hooks/data/useUserDirectory";
import type { DirectoryUser } from "@/features/users/domain";
import { AssigneeAvatar } from "../atoms/AssigneeAvatar";

export function AssigneePicker({
  trigger,
  onSelect,
}: {
  trigger: ReactNode;
  /** The full directory row, so callers can render a name without a second lookup. */
  onSelect: (user: DirectoryUser | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const { users, isLoading } = useUserDirectory(open);

  const choose = (user: DirectoryUser | null) => {
    onSelect(user);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Assign to…" />
          <CommandList>
            <CommandEmpty>{isLoading ? "Loading…" : "No matches."}</CommandEmpty>
            <CommandGroup>
              <CommandItem value="unassigned" onSelect={() => choose(null)}>
                <span className="text-muted-foreground">Unassigned</span>
              </CommandItem>
              {users.map((user: DirectoryUser) => (
                <CommandItem
                  key={user.id}
                  value={`${user.name ?? ""} ${user.email}`}
                  onSelect={() => choose(user)}
                  className="gap-2"
                >
                  <AssigneeAvatar person={user} />
                  <div className="min-w-0">
                    <div className="truncate text-sm">{user.name ?? user.email}</div>
                    {user.name && (
                      <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
