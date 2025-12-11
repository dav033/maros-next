"use client";

import type { Lead } from "@/leads/domain";
import type { Contact } from "@/contact/domain";
import { useEntityTableLogic, useTableWithSearch } from "@dav033/dav-components";
import { leadsSearchConfig } from "../../search/leadsSearchConfig";

export interface UseLeadsTableLogicProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: number) => Promise<void>;
  onViewContact: (contact: Contact) => void;
  onOpenNotesModal?: (lead: Lead) => void;
}

export interface UseLeadsTableLogicReturn {
  rows: Lead[];
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
    itemToDelete: Lead | null;
    isDeleting: boolean;
    error: string | null;
  };
  getContextMenuItems: (lead: Lead) => Array<{
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
    icon?: string;
    disabled?: boolean;
  }>;
  onOpenNotesModal?: (lead: Lead) => void;
  onViewContact: (contact: Contact) => void;
}

export function useLeadsTableLogic({
  leads,
  onEdit,
  onDelete,
  onViewContact,
  onOpenNotesModal,
}: UseLeadsTableLogicProps): UseLeadsTableLogicReturn {
  // 1) Estado de selección / delete modal / acciones base
  const {
    rows: localLeads,
    deleteModalProps,
    getContextMenuItems,
  } = useEntityTableLogic<Lead, number>({
    items: leads,
    getId: (l) => (typeof l.id === "number" ? l.id : 0),
    onDelete,
    onEdit,
    buildExtraMenuItems: (lead) => {
      const items = [];

      if (onOpenNotesModal) {
        items.push({
          label: "Notes",
          onClick: () => onOpenNotesModal(lead),
          icon: "lucide:file-text",
        });
      }

      items.push({
        label: "View Contact",
        icon: "lucide:user",
        onClick: () => {
          if (lead.contact) onViewContact(lead.contact);
        },
        disabled: !lead.contact,
      });

      return items;
    },
  });

  // 2) Estado de búsqueda y conteos
  const {
    filteredData: filteredLeads,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
  } = useTableWithSearch<Lead>({
    data: localLeads,
    searchableFields: leadsSearchConfig.fields.map((f) => f.key),
    defaultSearchField: leadsSearchConfig.defaultField,
    normalize: leadsSearchConfig.normalize,
  });

  return {
    rows: filteredLeads,
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
    onViewContact,
  };
}
