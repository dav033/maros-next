"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DirectoryUser } from "@/features/users/domain";
import { cn } from "@/lib/utils";

import { CLASSIFICATION_LABELS } from "../../domain/labels";
import type { InvoiceClassification, InvoiceScan, InvoiceScanPatch } from "../../domain/models";
import { useProjectPickerOptions, useUpdateInvoiceScanInline } from "../hooks/useInvoiceScans";

/** Saves one field of a row; every editor below is a thin control over this. */
function useRowSave(scan: Pick<InvoiceScan, "id">) {
  const mutation = useUpdateInvoiceScanInline();
  return {
    saving: mutation.isPending,
    save: (patch: InvoiceScanPatch) => mutation.mutate({ id: scan.id, patch }),
  };
}

const NO_USER = "none";

export function userLabel(user: Pick<DirectoryUser, "name" | "email">): string {
  return user.name?.trim() || user.email;
}

export function ProjectCell({ scan }: { scan: InvoiceScan }) {
  const [open, setOpen] = useState(false);
  const projects = useProjectPickerOptions(open);
  const { save, saving } = useRowSave(scan);
  const current = scan.projectNumber;

  const choose = (projectNumber: string | null) => {
    setOpen(false);
    if (projectNumber !== current) save({ projectNumber });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={saving}
          aria-label={`Project of ${scan.fileName}`}
          className={cn(
            "inline-flex h-8 min-w-24 items-center justify-between gap-2 rounded-md border border-transparent px-2 text-sm tabular-nums hover:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
            !current && "text-muted-foreground",
          )}
        >
          <span className="truncate">{current || "Add project"}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <Command>
          <CommandInput placeholder="Search by number or name…" />
          <CommandList>
            <CommandEmpty>
              {projects.isLoading
                ? "Loading projects…"
                : projects.isError
                  ? "Projects could not be loaded."
                  : "No project matches."}
            </CommandEmpty>
            <CommandGroup>
              {current && (
                <CommandItem value="no project clear remove" onSelect={() => choose(null)}>
                  <span className="text-muted-foreground">No project</span>
                </CommandItem>
              )}
              {(projects.data ?? []).map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  onSelect={() => choose(option.value)}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", current === option.value ? "opacity-100" : "opacity-0")}
                    aria-hidden="true"
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function CategoryCell({ scan }: { scan: InvoiceScan }) {
  const { save, saving } = useRowSave(scan);
  const invoice = scan.extractedData;

  // Without scanned details there is nothing to classify; editing would also
  // turn a failed scan into a reviewable one, which belongs on the detail page.
  if (!invoice) return <span className="px-2 text-muted-foreground">—</span>;

  return (
    <Select
      value={invoice.classification}
      disabled={saving}
      onValueChange={(next) => save({ classification: next as InvoiceClassification })}
    >
      <SelectTrigger
        aria-label={`Category of ${scan.fileName}`}
        className="h-8 min-w-36 border-transparent bg-transparent px-2 shadow-none hover:border-input"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(CLASSIFICATION_LABELS) as InvoiceClassification[]).map((key) => (
          <SelectItem key={key} value={key}>
            {CLASSIFICATION_LABELS[key]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Free text, saved when the field loses focus or Enter is pressed. */
export function CommentsCell({ scan }: { scan: InvoiceScan }) {
  const { save, saving } = useRowSave(scan);
  const stored = scan.comments ?? "";
  const [draft, setDraft] = useState(stored);

  useEffect(() => setDraft(stored), [stored]);

  const commit = () => {
    const next = draft.trim();
    if (next === stored.trim()) {
      setDraft(stored);
      return;
    }
    save({ comments: next || null });
  };

  return (
    <Input
      value={draft}
      maxLength={2000}
      disabled={saving}
      placeholder="Add a comment"
      aria-label={`Comments on ${scan.fileName}`}
      className="h-8 min-w-44 border-transparent bg-transparent px-2 shadow-none hover:border-input"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") setDraft(stored);
      }}
    />
  );
}

export function UserCell({ scan, users }: { scan: InvoiceScan; users: DirectoryUser[] }) {
  const { save, saving } = useRowSave(scan);
  const current = scan.enteredBy;

  const options = useMemo(() => {
    // Keep the assigned user selectable even if the directory does not list them.
    if (current !== null && !users.some((user) => user.id === current)) {
      return [...users, { id: current, name: `User #${current}`, email: "", picture: null }];
    }
    return users;
  }, [users, current]);

  return (
    <Select
      value={current === null ? NO_USER : String(current)}
      disabled={saving}
      onValueChange={(next) => save({ enteredBy: next === NO_USER ? null : Number(next) })}
    >
      <SelectTrigger
        aria-label={`User of ${scan.fileName}`}
        className="h-8 min-w-36 border-transparent bg-transparent px-2 shadow-none hover:border-input"
      >
        <SelectValue placeholder="No user" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_USER}>No user</SelectItem>
        {options.map((user) => (
          <SelectItem key={user.id} value={String(user.id)}>
            {userLabel(user)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
