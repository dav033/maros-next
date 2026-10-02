"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { FilePlus2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NOTE_REFERENCE_KIND_LABELS,
  type NoteReferenceKind,
  type NoteReferenceTarget,
} from "@/notes/domain";
import { NOTE_REFERENCE_ICONS } from "../atoms/noteReferenceVisuals";

/**
 * A row in the menu: either an existing record, or the offer to create a note with what
 * has been typed so far. The second kind is what makes `[[` usable for a note that does
 * not exist yet — Obsidian's behaviour, and the reason a wiki of notes grows at all
 * rather than requiring every page to be created before it can be linked.
 */
export type NoteReferenceMenuItem =
  | { type: "target"; target: NoteReferenceTarget }
  | { type: "create-note"; title: string };

export interface NoteReferenceMenuListProps {
  items: NoteReferenceMenuItem[];
  command: (item: NoteReferenceMenuItem) => void;
  /** Shown while the first request for a query is still out. */
  loading?: boolean;
}

export interface NoteReferenceMenuListHandle {
  onKeyDown: (event: { event: KeyboardEvent }) => boolean;
}

/** Order the groups appear in: CRM records first, then people, then notes. */
const KIND_ORDER: NoteReferenceKind[] = [
  "lead",
  "project",
  "contact",
  "company",
  "task",
  "user",
  "note",
];

type Group = { key: string; heading: string | null; items: Array<{ item: NoteReferenceMenuItem; index: number }> };

/**
 * Groups by kind while keeping one flat index per row, because the keyboard moves through
 * the whole list and the headings are not stops on that path.
 */
function groupItems(items: NoteReferenceMenuItem[]): Group[] {
  const byKind = new Map<string, Group>();
  const create: Group = { key: "create", heading: null, items: [] };

  items.forEach((item, index) => {
    if (item.type === "create-note") {
      create.items.push({ item, index });
      return;
    }
    const kind = item.target.kind;
    const group =
      byKind.get(kind) ??
      ({ key: kind, heading: `${NOTE_REFERENCE_KIND_LABELS[kind]}s`, items: [] } as Group);
    group.items.push({ item, index });
    byKind.set(kind, group);
  });

  const groups = KIND_ORDER.map((kind) => byKind.get(kind)).filter((g): g is Group => !!g);
  return create.items.length > 0 ? [...groups, create] : groups;
}

/**
 * Owns arrow/enter/escape handling itself (imperative onKeyDown, exposed via ref to the
 * suggestion plugin) rather than delegating to cmdk — same reasoning NoteSlashMenuList and
 * TaskMentionMenuList give: cmdk and the ProseMirror suggestion plugin fighting over arrow
 * keys is the classic mention-menu bug.
 */
export const NoteReferenceMenuList = forwardRef<
  NoteReferenceMenuListHandle,
  NoteReferenceMenuListProps
>(({ items, command, loading = false }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const groups = useMemo(() => groupItems(items), [items]);

  useEffect(() => setSelectedIndex(0), [items]);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (items.length === 0) return false;
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        return true;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (items.length === 0) {
    return (
      <div className="w-72 rounded-md border border-line bg-elev-4 p-2 text-sm text-muted-foreground shadow-md">
        {loading ? "Searching…" : "No matches"}
      </div>
    );
  }

  return (
    <div className="w-72 max-h-72 overflow-y-auto rounded-md border border-line bg-elev-4 p-1 shadow-md">
      {groups.map((group) => (
        <div key={group.key}>
          {group.heading && (
            <div className="px-2 pb-0.5 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {group.heading}
            </div>
          )}
          {group.items.map(({ item, index }) => {
            const Icon =
              item.type === "create-note" ? FilePlus2 : NOTE_REFERENCE_ICONS[item.target.kind];
            const label =
              item.type === "create-note"
                ? `Create note “${item.title}”`
                : item.target.label;
            const sublabel = item.type === "create-note" ? null : item.target.sublabel;

            return (
              <button
                key={item.type === "create-note" ? "create" : `${item.target.kind}-${item.target.id}`}
                type="button"
                onClick={() => selectItem(index)}
                // The suggestion plugin keeps focus in the document; without this the
                // mousedown blurs the editor and the insert lands nowhere.
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                  index === selectedIndex ? "bg-elev-5 text-foreground" : "hover:bg-elev-5"
                )}
              >
                <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {sublabel && (
                  <span className="shrink-0 max-w-24 truncate text-xs text-muted-foreground">
                    {sublabel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
});

NoteReferenceMenuList.displayName = "NoteReferenceMenuList";
