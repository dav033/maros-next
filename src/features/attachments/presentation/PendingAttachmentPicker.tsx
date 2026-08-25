"use client";

import { useRef } from "react";

export type PendingAttachment = { id: string; file: File; progress: number; error?: string };

export function PendingAttachmentPicker({ value, onChange, disabled = false }: { value: PendingAttachment[]; onChange: (next: PendingAttachment[]) => void; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" multiple hidden disabled={disabled} onChange={(event) => {
        const selected = Array.from(event.target.files ?? []).map((file) => ({ id: crypto.randomUUID(), file, progress: 0 }));
        if (selected.length) onChange([...value, ...selected]);
        event.target.value = "";
      }} />
      <button type="button" disabled={disabled} onClick={() => inputRef.current?.click()} className="rounded-md border px-3 py-2 text-sm">
        Add files
      </button>
      {value.map((item) => (
        <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm">
          <span className="min-w-0 truncate">{item.file.name}</span>
          <span className="text-xs text-muted-foreground">{item.error ?? `${item.progress}%`}</span>
          <button type="button" onClick={() => onChange(value.filter((entry) => entry.id !== item.id))} aria-label={`Remove ${item.file.name}`}>Remove</button>
        </div>
      ))}
    </div>
  );
}
