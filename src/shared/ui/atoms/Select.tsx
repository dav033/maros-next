"use client";

import { SelectNative } from "./SelectNative";
import { SearchableSelect } from "./SearchableSelect";

export type SelectOption = {
  value: string | number;
  label?: string;
  disabled?: boolean;
  color?: string | null;
};

export interface SelectProps {
  options: ReadonlyArray<SelectOption>;
  value: string | number | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  icon?: string;
  disabled?: boolean;
  className?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

/**
 * Unified Select component that delegates to specialized implementations:
 * - SelectNative: Native <select> for simple dropdowns (better accessibility & performance)
 * - SearchableSelect: Custom dropdown with search, color indicators, and portal positioning
 * 
 * This composition reduces complexity and separates concerns:
 * - Native behavior vs custom UI
 * - Search/filter logic
 * - Portal positioning
 */
export function Select({ searchable = false, ...rest }: SelectProps) {
  if (!searchable) {
    return <SelectNative {...rest} />;
  }

  return <SearchableSelect {...rest} />;
}
