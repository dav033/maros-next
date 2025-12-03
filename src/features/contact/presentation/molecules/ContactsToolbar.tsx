"use client";

import type { Contact } from "@/contact";
import {
  contactsSearchConfig,
  contactsSearchPlaceholder,
} from "../search";
import { TableToolbar } from "@/shared/ui";

export type ContactsToolbarProps<T extends Contact> = {
  searchQuery: string;
  searchField: string;
  onSearchQueryChange: (value: string) => void;
  onSearchFieldChange: (value: string) => void;
  onCreateContact: () => void;
  totalCount?: number;
  filteredCount?: number;
};

export function ContactsToolbar<T extends Contact>({
  searchQuery,
  searchField,
  onSearchQueryChange,
  onSearchFieldChange,
  onCreateContact,
  totalCount,
  filteredCount,
}: ContactsToolbarProps<T>) {
  const searchFields = [
    { value: "all", label: "All fields" },
    ...contactsSearchConfig.fields.map((field) => ({
      value: field.key,
      label: field.label,
    })),
  ];

  const hasActiveSearch = searchQuery.trim().length > 0;

  function handleClearSearch() {
    onSearchQueryChange("");
  }

  return (
    <TableToolbar
      onCreate={onCreateContact}
      createLabel="New contact"
      searchTerm={searchQuery}
      onSearchChange={onSearchQueryChange}
      selectedField={searchField}
      onFieldChange={onSearchFieldChange}
      searchFields={searchFields}
      placeholder={contactsSearchPlaceholder}
      hasActiveSearch={hasActiveSearch}
      onClearSearch={handleClearSearch}
      resultCount={filteredCount}
      totalCount={totalCount}
    />
  );
}
