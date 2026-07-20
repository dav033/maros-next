"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface MultiSelectOption<T extends string> {
  value: T;
  label: string;
  /** Punto de color opcional (hex o `hsl(var(--x))`), mismo lenguaje visual que los badges. */
  color?: string;
}

export interface MultiSelectFilterProps<T extends string> {
  icon?: LucideIcon;
  placeholder: string;
  options: MultiSelectOption<T>[];
  /** Vacío = sin filtro (se muestra todo), igual que el "all" de un Select simple. */
  selected: Set<T>;
  onChange: (next: Set<T>) => void;
  className?: string;
}

// Dropdown con checkboxes: filtra por varios valores a la vez (status, tipo, etc.),
// en vez del Select de un solo valor. Reusa DropdownMenuCheckboxItem (ya existe en el
// design system) en lugar de traer una librería de multi-select nueva.
export function MultiSelectFilter<T extends string>({
  icon: Icon,
  placeholder,
  options,
  selected,
  onChange,
  className,
}: MultiSelectFilterProps<T>) {
  const toggle = (value: T) => {
    const next = new Set(selected);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    onChange(next);
  };

  const hasFilter = selected.size > 0 && selected.size < options.length;
  const summary = !hasFilter
    ? placeholder
    : selected.size === 1
      ? (options.find((o) => selected.has(o.value))?.label ?? placeholder)
      : `${placeholder} (${selected.size})`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-9 w-full items-center justify-between gap-1.5 rounded-md border border-border/60 bg-background/60 px-3 text-xs shadow-sm transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            hasFilter && "border-primary/40 text-primary",
            className,
          )}
        >
          <span className="inline-flex min-w-0 items-center gap-1.5">
            {Icon ? <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /> : null}
            <span className="truncate">{summary}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        <DropdownMenuItem
          disabled={selected.size === 0}
          onSelect={(event) => {
            event.preventDefault();
            onChange(new Set());
          }}
        >
          Clear filter
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selected.has(option.value)}
            onSelect={(event) => event.preventDefault()}
            onCheckedChange={() => toggle(option.value)}
            className="gap-2"
          >
            {option.color ? (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: option.color }}
              />
            ) : null}
            <span className="truncate">{option.label}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
