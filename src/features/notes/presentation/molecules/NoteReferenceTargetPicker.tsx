"use client";

import { useState, type ReactNode } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  NOTE_REFERENCE_KINDS,
  NOTE_REFERENCE_KIND_LABELS,
  type NoteReferenceKind,
  type NoteReferenceTarget,
} from "@/notes/domain";
import { NOTE_REFERENCE_ICONS } from "../atoms/noteReferenceVisuals";
import { useReferenceTargetSearch } from "../hooks/data/useReferenceTargetSearch";

/** Kinds offered when the caller does not narrow it: everything a note can be related to. */
const ALL_KINDS = [...NOTE_REFERENCE_KINDS];

export function NoteReferenceTargetPicker({
  trigger,
  onSelect,
  kinds = ALL_KINDS,
  excluded = [],
}: {
  trigger: ReactNode;
  onSelect: (target: NoteReferenceTarget) => void;
  /** Narrows the search, e.g. to notes only. */
  kinds?: NoteReferenceKind[];
  /** Already-related records, hidden so the list cannot offer a duplicate. */
  excluded?: Array<{ kind: NoteReferenceKind; id: number }>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { targets, isLoading, error } = useReferenceTargetSearch(query, kinds, open);

  const excludedKeys = new Set(excluded.map((item) => `${item.kind}:${item.id}`));
  const visible = targets.filter((target) => !excludedKeys.has(`${target.kind}:${target.id}`));

  const grouped = kinds
    .map((kind) => ({ kind, items: visible.filter((target) => target.kind === kind) }))
    .filter((group) => group.items.length > 0);

  const choose = (target: NoteReferenceTarget) => {
    onSelect(target);
    setOpen(false);
    // Cleared on close, not on open: reopening the picker to relate a second record from
    // the same search should not make the user retype it.
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className="w-[min(22rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] p-0"
        align="start"
      >
        {/* shouldFilter={false}: the matching happens on the server, across seven tables.
            Letting cmdk filter again would hide rows the backend matched on a field that
            is not in the label — a lead found by its number, a contact by email. */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search leads, projects, people, tasks, notes…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading
                ? "Searching…"
                : error
                  ? "Couldn’t search records. Try again."
                  : "No matches."}
            </CommandEmpty>
            {grouped.map(({ kind, items }) => {
              const Icon = NOTE_REFERENCE_ICONS[kind];
              return (
                <CommandGroup key={kind} heading={`${NOTE_REFERENCE_KIND_LABELS[kind]}s`}>
                  {items.map((target) => (
                    <CommandItem
                      key={`${target.kind}-${target.id}`}
                      value={`${target.kind}-${target.id}`}
                      onSelect={() => choose(target)}
                    >
                      <Icon
                        className="mr-2 size-3.5 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="truncate">{target.label}</span>
                      {target.sublabel && (
                        <span className="ml-auto shrink-0 max-w-28 truncate text-xs text-muted-foreground">
                          {target.sublabel}
                        </span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
