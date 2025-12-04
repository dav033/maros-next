"use client";

import type { ChangeEvent } from "react";
import { Icon, Button, Select, Input } from "@/shared/ui";

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

  function handleSelectChange(value: string) {
    onSelectKey(value);
  }

  const showCounts =
    typeof resultCount === "number" && typeof totalCount === "number";

  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
      <div className="flex flex-1 gap-2 max-w-2xl">
        <div className="w-40 shrink-0">
          <Select
            value={selectedKey}
            onChange={handleSelectChange}
            options={options.map((option) => ({
              value: option.key,
              label: option.label,
            }))}
          />
        </div>

        <div className="flex-1 min-w-0">
          <Input
            type="text"
            value={searchTerm}
            onChange={handleTermChange}
            placeholder={placeholder}
            leftAddon={
              <Icon
                name="material-symbols:search"
                className="h-4 w-4 text-gray-400"
              />
            }
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-gray-400 md:justify-start">
        {hasActiveSearch && onClearSearch && (
          <Button
            type="button"
            onClick={onClearSearch}
            variant="subtle"
            size="sm"
          >
            Clear search
          </Button>
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
