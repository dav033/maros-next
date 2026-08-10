"use client";

import { useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { TaskLabel } from "@/tasks/domain";
import { taskLabelColor } from "../atoms/taskVisualTokens";

export function LabelPicker({
  trigger,
  labels,
  selectedIds,
  onToggle,
}: {
  trigger: ReactNode;
  labels: TaskLabel[];
  selectedIds: Set<number>;
  onToggle: (labelId: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search labels…" />
          <CommandList>
            <CommandEmpty>No labels yet.</CommandEmpty>
            <CommandGroup>
              {labels.map((label) => {
                const checked = selectedIds.has(label.id);
                return (
                  <CommandItem
                    key={label.id}
                    value={label.name}
                    onSelect={() => onToggle(label.id)}
                    className="gap-2"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: taskLabelColor(label.color) }}
                    />
                    <span className="flex-1 truncate">{label.name}</span>
                    {checked && <Check className="h-3.5 w-3.5" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
