"use client";

import { FolderKanban, LoaderCircle } from "lucide-react";
import { useMemo } from "react";

import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { Button } from "@/components/ui/button";

import { useProjectPickerOptions } from "../hooks/useInvoiceScans";

interface Props {
  value: string | null;
  onChange: (projectNumber: string | null) => void;
  saving?: boolean;
  disabled?: boolean;
}

/**
 * Search-select over every project (by lead number and name). The value stored
 * on the scan is the lead number, which is what QuickBooks uses too.
 */
export function ProjectNumberSelect({ value, onChange, saving, disabled }: Props) {
  const projects = useProjectPickerOptions();

  const options = useMemo(() => {
    const list = projects.data ?? [];
    // A scan may carry a number whose project was renamed or removed: keep it selectable.
    if (value && !list.some((option) => option.value === value)) {
      return [{ value, label: `${value} · (project not in the list)` }, ...list];
    }
    return list;
  }, [projects.data, value]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="min-w-0 flex-1 basis-64">
        <SearchableSelect
          icon={FolderKanban}
          options={options}
          value={value ?? ""}
          onChange={(next) => onChange(next || null)}
          placeholder={projects.isLoading ? "Loading projects…" : "Pick a project"}
          searchPlaceholder="Search by number or name…"
          emptyText={projects.isError ? "Projects could not be loaded." : "No project matches."}
          disabled={disabled || projects.isLoading}
        />
      </div>
      {saving ? (
        <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Saving project" />
      ) : value ? (
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} disabled={disabled}>
          Clear
        </Button>
      ) : null}
    </div>
  );
}
