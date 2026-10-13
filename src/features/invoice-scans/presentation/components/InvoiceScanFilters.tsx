"use client";

import { X } from "lucide-react";
import { LayoutGroup } from "motion/react";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import { sharedEntityReturnTransition } from "@/shared/presentation/motionTransitions";

import type { InvoiceScanFilters as FilterValues } from "../../domain/filters";
import {
  FILTER_RANGES,
  FILTER_SELECTS,
  InvoiceScanDraftInput,
  InvoiceScanFilterFields,
} from "./InvoiceScanFilterFields";
import { filterChoiceLayoutId, MotionFilterButton } from "./InvoiceScanFilterChoice";

interface Props {
  filters: FilterValues;
  resultCount: number;
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  resetKey: number;
  onChange: (patch: Partial<FilterValues>) => void;
  onClear: () => void;
}

function activeChips(filters: FilterValues): Array<{ key: keyof FilterValues; label: string; layoutId?: string }> {
  const chips: Array<{ key: keyof FilterValues; label: string; layoutId?: string }> = [];
  if (filters.search) chips.push({ key: "search", label: `Search: ${filters.search}` });
  for (const field of FILTER_SELECTS) {
    const value = filters[field.key];
    const option = field.options.find(([optionValue]) => optionValue === value);
    if (option) chips.push({ key: field.key, label: `${field.label}: ${option[1]}`, layoutId: filterChoiceLayoutId(field.key, option[0]) });
  }
  for (const field of FILTER_RANGES) {
    if (filters[field.key] !== undefined) {
      chips.push({ key: field.key, label: `${field.label}: ${filters[field.key]}` });
    }
  }
  return chips;
}

export function InvoiceScanFilters({
  filters, resultCount, totalCount, isLoading, isError, resetKey, onChange, onClear,
}: Props) {
  const chips = activeChips(filters);
  const reduceMotion = usePrefersReducedMotion();
  const scope = useId();
  const [openField, setOpenField] = useState<keyof FilterValues | null>(null);

  return (
    <LayoutGroup id={scope}>
    <section aria-label="Document filters" className="space-y-3 rounded-xl border border-line bg-elev-1 p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 basis-60 space-y-1.5">
          <Label htmlFor="invoice-filter-search" className="text-xs">Search documents</Label>
          <InvoiceScanDraftInput
            key={`search-${resetKey}`}
            id="invoice-filter-search"
            type="search"
            param="q"
            value={filters.search ?? ""}
            onChange={(search) => onChange({ search })}
          />
        </div>
        <p aria-live="polite" aria-atomic="true" className="py-2 font-mono text-xs text-muted-foreground tabular-nums">
          {isLoading ? "Loading documents…" : isError ? "Results unavailable" : `${resultCount} of ${totalCount}`}
        </p>
        <Button type="button" variant="outline" size="sm" disabled={chips.length === 0} onClick={onClear}>
          Clear filters
        </Button>
      </div>
      <InvoiceScanFilterFields filters={filters} onChange={onChange} resetKey={resetKey} openField={openField} onOpenFieldChange={setOpenField} />
      {chips.length > 0 && (
        <div aria-label="Active filters" className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <MotionFilterButton
              key={`${chip.layoutId ?? chip.key}-${reduceMotion ? "static" : "motion"}`}
              type="button"
              variant="secondary"
              size="sm"
              className="max-w-full rounded-full text-xs"
              aria-label={`Remove filter ${chip.label}`}
              {...reduceMotion ? {} : { layout: "position", layoutId: chip.layoutId, transition: sharedEntityReturnTransition }}
              onClick={() => {
                onChange({ [chip.key]: undefined });
                if (chip.layoutId) setOpenField(chip.key);
              }}
            >
              <span className="truncate">{chip.label}</span>
              <X className="size-3" aria-hidden="true" />
            </MotionFilterButton>
          ))}
        </div>
      )}
    </section>
    </LayoutGroup>
  );
}
