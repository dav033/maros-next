"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export function QuickAddTask({ onAdd }: { onAdd: (value: string) => Promise<void> }) {
  const [value, setValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const submit = async () => {
    if (!value.trim() || isAdding) return;
    setIsAdding(true);
    try { await onAdd(value); setValue(""); } finally { setIsAdding(false); }
  };
  return (
    <div className="border-t border-border/60 p-2">
      <div className="flex items-center gap-2 rounded-md border border-dashed border-border bg-background px-2">
        <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void submit(); } }}
          placeholder="Add task…"
          aria-label="Add task to this column"
          disabled={isAdding}
          className="h-8 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
        />
      </div>
    </div>
  );
}
