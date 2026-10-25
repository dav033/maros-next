"use client";

import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CLASSIFICATION_LABELS, STATUS_LABELS } from "../../domain/labels";
import type { InvoiceScanFilters } from "../../domain/filters";

function FilterSelect<T extends string>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: ReadonlyArray<readonly [T, string]>;
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <select
        className="h-10 w-full rounded-md border border-input bg-input px-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        value={value}
        onChange={(event) => {
          const selected = options.find(([key]) => key === event.target.value);
          if (selected) onChange(selected[0]);
        }}
      >
        {options.map(([key, text]) => <option key={key} value={key}>{text}</option>)}
      </select>
    </label>
  );
}

function FilterInput({ label, children }: { label: string; children: ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-1 text-xs text-muted-foreground">{label}{children}</label>;
}

export function InvoiceScanFiltersBar({ filters, onChange, onReset, matched, total, loading, error }: {
  filters: InvoiceScanFilters;
  onChange: (filters: InvoiceScanFilters) => void;
  onReset: () => void;
  matched: number;
  total: number;
  loading: boolean;
  error: string | null;
}) {
  function update<K extends keyof InvoiceScanFilters>(key: K, value: InvoiceScanFilters[K]) {
    onChange({ ...filters, [key]: value });
  }
  return (
    <section aria-label="Search and filter documents" className="rounded-xl border border-line bg-elev-1 p-3 sm:p-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <FilterInput label="Search documents">
          <span className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4" />
            <Input type="search" className="pl-9" placeholder="Invoice, company, project, file or comments…" value={filters.search} onChange={(event) => update("search", event.target.value)} />
          </span>
        </FilterInput>
        <FilterSelect label="Search in" value={filters.searchField} onChange={(value) => update("searchField", value)} options={[
          ["all", "All fields"], ["invoiceNumber", "Invoice number"], ["description", "Description"],
          ["counterparty", "Paid to / received from"], ["project", "Project number"], ["fileName", "File name"], ["comments", "Comments"],
        ]} />
        <FilterSelect label="QuickBooks entry" value={filters.entry} onChange={(value) => update("entry", value)} options={[["all", "All entries"], ["pending", "To enter"], ["entered", "Entered"]]} />
      </div>
      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium">More filters</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect label="Record type" value={filters.recordType} onChange={(value) => update("recordType", value)} options={[["all", "All types"], ["invoice", "Scanned document"], ["transaction", "Manual transaction"]]} />
          <FilterSelect label="Money flow" value={filters.flow} onChange={(value) => update("flow", value)} options={[["all", "All directions"], ["out", "Money out"], ["in", "Money in"], ["unknown", "Unknown"]]} />
          <FilterSelect label="Category" value={filters.classification} onChange={(value) => update("classification", value)} options={[
            ["all", "All categories"], ["customer_service", CLASSIFICATION_LABELS.customer_service], ["materials_expense", CLASSIFICATION_LABELS.materials_expense],
            ["subcontractor_expense", CLASSIFICATION_LABELS.subcontractor_expense], ["other", CLASSIFICATION_LABELS.other], ["unknown", CLASSIFICATION_LABELS.unknown],
          ]} />
          <FilterSelect label="Scan status" value={filters.status} onChange={(value) => update("status", value)} options={[
            ["all", "All statuses"], ["uploaded", STATUS_LABELS.uploaded], ["processing", STATUS_LABELS.processing], ["needs_review", STATUS_LABELS.needs_review], ["failed", STATUS_LABELS.failed],
          ]} />
          <FilterInput label="Transaction date from"><Input type="date" value={filters.dateFrom} onChange={(event) => update("dateFrom", event.target.value)} /></FilterInput>
          <FilterInput label="Transaction date to"><Input type="date" value={filters.dateTo} onChange={(event) => update("dateTo", event.target.value)} /></FilterInput>
          <FilterInput label="Minimum amount"><Input type="number" step="0.01" value={filters.amountMin} onChange={(event) => update("amountMin", event.target.value)} /></FilterInput>
          <FilterInput label="Maximum amount"><Input type="number" step="0.01" value={filters.amountMax} onChange={(event) => update("amountMax", event.target.value)} /></FilterInput>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Dates use the document / transaction date. Amounts use each record’s currency.</p>
      </details>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p role="status" className="text-xs text-muted-foreground">{loading ? "Loading documents…" : `${matched} of ${total} loaded records`} · Filters apply to the loaded list, including recent QuickBooks entries.</p>
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>Clear filters</Button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
    </section>
  );
}
