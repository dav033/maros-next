"use client";

import type { Contact } from "@/contact/domain";
import { useContactsApp } from "@/di";
import { deleteContact } from "@/contact/application";
import { useEntityTableLogic, useTableWithSearch } from "@dav033/dav-components";
import { contactsSearchConfig } from "../../search/contactsSearchConfig";

interface UseContactsTableLogicProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: number) => void;
  onOpenNotesModal?: (contact: Contact) => void;
  onOpenCompanyModal?: (company: any) => void;
}

export interface UseContactsTableLogicReturn {
  rows: Contact[];
  totalCount: number;
  filteredCount: number;
  searchState: {
    searchQuery: string;
    searchField: string;
    setSearchQuery: (q: string) => void;
    setSearchField: (f: string) => void;
  };
  deleteModalProps: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemToDelete: Contact | null;
    isDeleting: boolean;
    error: string | null;
  };
  getContextMenuItems: (contact: Contact) => Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
    icon?: string;
    disabled?: boolean;
  }>;
  onOpenNotesModal?: (contact: Contact) => void;
  onOpenCompanyModal?: (company: any) => void;
}

export function useContactsTableLogic({
  contacts,
  onEdit,
  onDelete,
  onOpenNotesModal,
  onOpenCompanyModal,
}: UseContactsTableLogicProps): UseContactsTableLogicReturn {
  const app = useContactsApp();

  // 1) Estado de selección / delete modal / acciones base
  const {
    rows: localContacts,
    deleteModalProps,
    getContextMenuItems,
  } = useEntityTableLogic<Contact, number>({
    items: contacts,
    getId: (c) => (typeof c.id === "number" ? c.id : 0),
    onDelete: async (id) => {
      await deleteContact(app, id);
      onDelete(id);
    },
    onEdit,
    buildExtraMenuItems: (contact) => {
      const items = [];

      if (onOpenNotesModal) {
        items.push({
          label: "View Notes",
          onClick: () => onOpenNotesModal(contact),
          icon: "lucide:file-text",
        });
      }

      if (onOpenCompanyModal && contact.company) {
        items.push({
          label: "View Company",
          onClick: () => onOpenCompanyModal(contact.company),
          icon: "lucide:building-2",
          disabled: !contact.company,
        });
      }

      return items;
    },
  });

  // 2) Estado de búsqueda y conteos
  const {
    filteredData: filteredContacts,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
  } = useTableWithSearch<Contact>({
    data: localContacts,
    searchableFields: contactsSearchConfig.fields.map((f) => f.key),
    defaultSearchField: contactsSearchConfig.defaultField,
    normalize: contactsSearchConfig.normalize,
  });

  return {
    rows: filteredContacts,
    totalCount,
    filteredCount,
    searchState: {
      searchQuery,
      searchField,
      setSearchQuery,
      setSearchField,
    },
    deleteModalProps,
    getContextMenuItems,
    onOpenNotesModal,
    onOpenCompanyModal,
  };
}
