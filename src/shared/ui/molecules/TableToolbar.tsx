"use client";

import type { ReactNode } from "react";
import { Button } from "@/shared/ui";
import { SearchBoxWithDropdown } from "./SearchBoxWithDropdown";

type SearchFieldDescriptor = {
  value: string;
  label: string;
};

export type TableToolbarProps = {
  onCreate?: () => void;
  createLabel?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedField: string;
  onFieldChange: (value: string) => void;
  searchFields: SearchFieldDescriptor[];
  placeholder?: string;
  hasActiveSearch?: boolean;
  onClearSearch?: () => void;
  resultCount?: number;
  totalCount?: number;
  rightSlot?: ReactNode;
  className?: string;
};

export function TableToolbar({
  onCreate,
  createLabel = "Add",
  searchTerm,
  onSearchChange,
  selectedField,
  onFieldChange,
  searchFields,
  placeholder,
  hasActiveSearch,
  onClearSearch,
  resultCount,
  totalCount,
  rightSlot,
  className,
}: TableToolbarProps) {
  const normalizedFields = searchFields.map((field) => ({
    key: field.value,
    label: field.label,
  }));

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl bg-theme-gray-subtle/60 p-3 md:flex-row md:items-center md:justify-between ${className ?? ""}`}
    >
      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <SearchBoxWithDropdown
          searchTerm={searchTerm}
          onSearchTermChange={onSearchChange}
          options={normalizedFields}
          selectedKey={selectedField}
          onSelectKey={onFieldChange}
          placeholder={placeholder}
          hasActiveSearch={hasActiveSearch}
          onClearSearch={onClearSearch}
          resultCount={resultCount}
          totalCount={totalCount}
        />
      </div>

      <div className="mt-2 flex items-center justify-end gap-2 md:mt-0">
        {rightSlot}

        {onCreate && (
          <Button
            variant="primary"
            onClick={onCreate}
            className="whitespace-nowrap text-sm font-medium"
          >
            {createLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
