"use client";

import { Check, ChevronsUpDown, Download, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
import {
  useDownloadInvoiceScanFile,
  useProjectPickerOptions,
  useUpdateInvoiceScanInline,
} from "../hooks/useInvoiceScans";

/** Saves one field of a row; every editor below is a thin control over this. */
function useRowSave(scan: Pick<InvoiceScan, "id">) {
  const mutation = useUpdateInvoiceScanInline();
  return {
    saving: mutation.isPending,
    save: (patch: InvoiceScanPatch) => mutation.mutate({ id: scan.id, patch }),
  };
}

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
            "inline-flex h-8 min-w-24 items-center justify-between gap-2 rounded-md border border-line-strong px-2 font-mono text-sm tabular-nums hover:bg-elev-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60",
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
        className="h-8 min-w-36 border-line-strong bg-transparent px-2 shadow-none hover:bg-elev-3"
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

/**
 * El monto, editable desde la fila: el escaneo a veces lee un número que no es
 * el del documento y corregirlo no debería obligar a abrir el detalle. En una
 * transacción manual el subtotal acompaña al total, que es un solo importe.
 */
export function AmountCell({ scan }: { scan: InvoiceScan }) {
  const { save, saving } = useRowSave(scan);
  const invoice = scan.extractedData;
  const stored = invoice?.total ?? null;
  const [draft, setDraft] = useState(stored === null ? "" : String(stored));

  useEffect(() => setDraft(stored === null ? "" : String(stored)), [stored]);

  // Sin datos leídos no hay dónde guardar el importe; eso se resuelve en el
  // detalle, que es donde se escriben todos los campos del documento.
  if (!invoice) return <span className="px-2 text-muted-foreground">—</span>;

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === "") {
      if (stored === null) return;
      save(scan.recordType === "transaction" ? { total: null, subtotal: null } : { total: null });
      return;
    }
    const next = Number(trimmed);
    if (!Number.isFinite(next) || next < 0) {
      setDraft(stored === null ? "" : String(stored));
      return;
    }
    if (next === stored) return;
    save(scan.recordType === "transaction" ? { total: next, subtotal: next } : { total: next });
  };

  return (
    <Input
      value={draft}
      inputMode="decimal"
      disabled={saving}
      placeholder="0.00"
      aria-label={`Amount of ${scan.fileName}`}
      className="h-8 w-28 border-line-strong bg-transparent px-2 text-right font-mono tabular-nums shadow-none hover:bg-elev-3"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") setDraft(stored === null ? "" : String(stored));
      }}
    />
  );
}

/** Descarga el documento original; solo aparece cuando hay archivo guardado. */
export function DownloadFileButton({
  scan,
  className,
}: {
  scan: Pick<InvoiceScan, "id" | "fileName" | "hasFile">;
  className?: string;
}) {
  const download = useDownloadInvoiceScanFile();
  if (!scan.hasFile) return null;
  const busy = download.isPending && download.variables === scan.id;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("size-8 text-muted-foreground hover:text-foreground", className)}
      aria-label={`Download ${scan.fileName}`}
      disabled={busy}
      onClick={() => download.mutate(scan.id)}
    >
      {busy ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : (
        <Download aria-hidden="true" />
      )}
    </Button>
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
      className="h-8 min-w-44 border-line-strong bg-transparent px-2 shadow-none hover:bg-elev-3"
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") setDraft(stored);
      }}
    />
  );
}

/** Read-only: the server records whoever last saved a change to the row. */
export function LastEditorCell({ scan, users }: { scan: InvoiceScan; users: DirectoryUser[] }) {
  if (scan.updatedBy === null) return <span className="px-2 text-muted-foreground">—</span>;
  const editor = users.find((user) => user.id === scan.updatedBy);
  return (
    <span className="block max-w-40 truncate px-2 text-sm">
      {editor ? userLabel(editor) : `User #${scan.updatedBy}`}
    </span>
  );
}
