"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";
import { sharedEntityReturnTransition } from "@/shared/presentation/motionTransitions";

import { parseInvoiceScanFilters } from "../../domain/filterParams";
import type { InvoiceScanFilters } from "../../domain/filters";
import { CLASSIFICATION_LABELS, STATUS_LABELS } from "../../domain/labels";
import { filterChoiceLayoutId, MotionFilterButton } from "./InvoiceScanFilterChoice";

export const FILTER_SELECTS = [
  {
    key: "recordType", param: "type", label: "Record type", options: [
      ["invoice", "Invoice file"], ["transaction", "Manual transaction"],
    ],
  },
  {
    key: "moneyDirection", param: "direction", label: "Money direction", options: [
      ["in", "Money in"], ["out", "Money out"],
    ],
  },
  { key: "status", param: "status", label: "Status", options: Object.entries(STATUS_LABELS) },
  { key: "classification", param: "classification", label: "Category", options: Object.entries(CLASSIFICATION_LABELS) },
] as const;

export const FILTER_RANGES = [
  { key: "dateFrom", param: "from", label: "Invoice date from", type: "date" },
  { key: "dateTo", param: "to", label: "Invoice date to", type: "date" },
  { key: "amountMin", param: "min", label: "Minimum amount", type: "amount" },
  { key: "amountMax", param: "max", label: "Maximum amount", type: "amount" },
] as const;

interface DraftInputProps {
  id: string;
  value: string;
  type: "search" | "text";
  param: "q" | "min" | "max";
  onChange: (value: string) => void;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

/** Keep editing text (spaces, a decimal point or a minus) until the URL value is committed. */
export function InvoiceScanDraftInput({ value, param, onChange, ...props }: DraftInputProps) {
  const [draft, setDraft] = useState(value);
  const lastWritten = useRef(value);

  useEffect(() => {
    if (lastWritten.current !== value) {
      lastWritten.current = value;
      setDraft(value);
    }
  }, [value]);

  return (
    <Input
      {...props}
      className="h-9"
      inputMode={param === "q" ? "search" : "decimal"}
      value={draft}
      onBlur={() => {
        if (param !== "q") setDraft(lastWritten.current);
      }}
      onChange={(event) => {
        const next = event.target.value;
        const parsed = parseInvoiceScanFilters(new URLSearchParams([[param, next]]).toString());
        const normalized = param === "q" ? parsed.search : param === "min" ? parsed.amountMin : parsed.amountMax;
        lastWritten.current = normalized === undefined ? "" : String(normalized);
        setDraft(next);
        onChange(next);
      }}
    />
  );
}

interface Props {
  filters: InvoiceScanFilters;
  resetKey: number;
  onChange: (patch: Partial<InvoiceScanFilters>) => void;
  openField: keyof InvoiceScanFilters | null;
  onOpenFieldChange: (key: keyof InvoiceScanFilters | null) => void;
}

export function InvoiceScanFilterFields({ filters, resetKey, onChange, openField, onOpenFieldChange }: Props) {
  const reduceMotion = usePrefersReducedMotion();
  const dateError = Boolean(filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo);
  const amountError = filters.amountMin !== undefined && filters.amountMax !== undefined && filters.amountMin > filters.amountMax;
  const update = (key: keyof InvoiceScanFilters, param: string, value: string) => {
    const parsed = parseInvoiceScanFilters(new URLSearchParams([[param, value]]).toString());
    onChange({ [key]: parsed[key] });
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {FILTER_SELECTS.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label htmlFor={`invoice-filter-${field.key}`} className="text-xs">{field.label}</Label>
            <Popover open={openField === field.key} onOpenChange={(open) => onOpenFieldChange(open ? field.key : null)}>
              <PopoverTrigger asChild>
                <Button
                  id={`invoice-filter-${field.key}`}
                  type="button"
                  role="combobox"
                  aria-haspopup="dialog"
                  variant="outline"
                  className="h-9 w-full justify-between px-2 font-normal"
                  value={filters[field.key] ?? ""}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      onOpenFieldChange(field.key);
                    }
                  }}
                >
                  {field.options.find(([value]) => value === filters[field.key])?.[1] ?? "All"}
                  <ChevronDown className="size-3" aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent aria-label={field.label} align="start" className="flex w-72 flex-col gap-1 p-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => {
                  update(field.key, field.param, "");
                  onOpenFieldChange(null);
                }}>All</Button>
                {field.options.map(([value, label]) => (
                  <MotionFilterButton
                    key={`${value}-${filters[field.key] === value ? "selected" : "available"}-${reduceMotion ? "static" : "motion"}`}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    aria-label={`Apply filter ${field.label}: ${label}`}
                    aria-pressed={filters[field.key] === value}
                    {...reduceMotion || filters[field.key] === value ? {} : {
                      layoutId: filterChoiceLayoutId(field.key, value),
                      transition: sharedEntityReturnTransition,
                    }}
                    onClick={() => {
                      update(field.key, field.param, value);
                      onOpenFieldChange(null);
                    }}
                  >{label}</MotionFilterButton>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FILTER_RANGES.map((field) => {
          const isDate = field.type === "date";
          const invalid = isDate ? dateError : amountError;
          const description = isDate
            ? `invoice-filter-date-help${dateError ? " invoice-filter-date-error" : ""}`
            : amountError ? "invoice-filter-amount-error" : undefined;
          const value = filters[field.key] === undefined ? "" : String(filters[field.key]);
          return (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={`invoice-filter-${field.key}`} className="text-xs">{field.label}</Label>
              {isDate ? (
                <Input
                  id={`invoice-filter-${field.key}`}
                  type="date"
                  className="h-9"
                  value={value}
                  aria-invalid={invalid || undefined}
                  aria-describedby={description}
                  onChange={(event) => update(field.key, field.param, event.target.value)}
                />
              ) : (
                <InvoiceScanDraftInput
                  key={`${field.key}-${resetKey}`}
                  id={`invoice-filter-${field.key}`}
                  type="text"
                  param={field.param === "min" ? "min" : "max"}
                  value={value}
                  aria-invalid={invalid || undefined}
                  aria-describedby={description}
                  onChange={(next) => update(field.key, field.param, next)}
                />
              )}
            </div>
          );
        })}
      </div>
      <p id="invoice-filter-date-help" className="text-xs text-muted-foreground">
        Invoice date uses the issue date, or the creation date when missing, in your local time zone.
        Records without a usable date are excluded from a date range.
      </p>
      {dateError && (
        <p id="invoice-filter-date-error" role="alert" className="text-xs text-destructive">
          Invoice date to must be on or after Invoice date from.
        </p>
      )}
      {amountError && (
        <p id="invoice-filter-amount-error" role="alert" className="text-xs text-destructive">
          Maximum amount must be at least Minimum amount.
        </p>
      )}
    </>
  );
}
