"use client";

import type { ChangeEvent } from "react";
import { Icon } from "@/shared/ui";

type SearchFieldOption = {
  key: string;
  label: string;
};

export type SearchBoxWithDropdownProps = {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  options: SearchFieldOption[];
  selectedKey: string;
  onSelectKey: (value: string) => void;
  placeholder?: string;
  hasActiveSearch?: boolean;
  onClearSearch?: () => void;
  resultCount?: number;
  totalCount?: number;
};

export function SearchBoxWithDropdown({
  searchTerm,
  onSearchTermChange,
  options,
  selectedKey,
  onSelectKey,
  placeholder,
  hasActiveSearch,
  onClearSearch,
  resultCount,
  totalCount,
}: SearchBoxWithDropdownProps) {
  function handleTermChange(event: ChangeEvent<HTMLInputElement>) {
    onSearchTermChange(event.target.value);
  }

  function handleSelectChange(event: ChangeEvent<HTMLSelectElement>) {
    onSelectKey(event.target.value);
  }

  const showCounts =
    typeof resultCount === "number" && typeof totalCount === "number";

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
      <div className="flex flex-1 gap-2">
        <div className="w-40">
          <select
            value={selectedKey}
            onChange={handleSelectChange}
            className="block w-full rounded-lg border border-gray-700 bg-theme-dark/80 px-3 py-2 text-sm text-theme-light shadow-sm outline-none transition focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-primary)/50"
          >
            {options.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <Icon
              name="material-symbols:search"
              className="h-4 w-4 text-gray-400"
            />
          </span>

          <input
            type="text"
            value={searchTerm}
            onChange={handleTermChange}
            placeholder={placeholder}
            className="block w-full rounded-lg border border-gray-700 bg-theme-dark/60 py-2 pl-10 pr-3 text-sm text-theme-light placeholder:text-gray-400 outline-none transition focus:border-[var(--color-primary)] focus:bg-theme-dark focus:ring-2 focus:ring-[var(--color-primary)]/50"
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-gray-400 md:justify-start">
        {hasActiveSearch && onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="rounded-full px-3 py-1 text-xs font-medium text-gray-300 transition hover:bg-theme-gray-subtle hover:text-white"
          >
            Clear search
          </button>
        )}

        {showCounts && (
          <span className="ml-auto whitespace-nowrap text-[11px] text-gray-400 md:ml-0">
            Showing {resultCount} of {totalCount} results
          </span>
        )}
      </div>
    </div>
  );
}
