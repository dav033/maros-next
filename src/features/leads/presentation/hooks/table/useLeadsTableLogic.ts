"use client";

import { useCallback, useMemo, useState } from "react";
import { useEntityTableLogic, useTableWithSearch } from "@/common/hooks";
import { type EntityContextMenuItem } from "@/components/shared";
import type { Lead } from "@/leads/domain";
import { LeadStatus, canTransition } from "@/leads/domain";
import type { Contact } from "@/contact/domain";
import type { ProjectType } from "@/projectType/domain";
import { Check, FileText, FolderPlus, User } from "lucide-react";
import React from "react";
import { leadsSearchConfig } from "../../search/leadsSearchConfig";

export type LeadGroupBy = "none" | "status" | "projectType" | "leadType";

/** Props de entrada para `useLeadsTableLogic`. */
export interface UseLeadsTableLogicProps {
  /** Lista completa de leads a mostrar. */
  leads: Lead[];
  /** Callback al hacer clic en "Edit" del menú contextual. */
  onEdit: (lead: Lead) => void;
  /** Callback al confirmar eliminación desde el modal de delete. */
  onDelete: (leadId: number) => Promise<void>;
  /** Abre el modal de vista de contacto. */
  onViewContact: (contact: Contact) => void;
  /** Abre el modal de notas del lead. */
  onOpenNotesModal?: (lead: Lead) => void;
  /** Convierte el lead a proyecto. */
  onConvertToProject?: (lead: Lead) => Promise<void> | void;
  /** Tipos de proyecto disponibles para el submenú "Change Project Type". */
  projectTypes: ProjectType[];
  /** Callback ejecutado al seleccionar un nuevo estado en el submenú "Change Status". */
  onUpdateStatus: (lead: Lead, status: LeadStatus) => Promise<void> | void;
  /** Callback ejecutado al seleccionar un nuevo project type en el submenú "Change Project Type". */
  onUpdateProjectType: (lead: Lead, projectTypeId: number) => Promise<void> | void;
  /** Predicate que retorna `true` si el lead está siendo actualizado (status). Deshabilita el submenú. */
  isUpdatingStatus?: (lead: Lead) => boolean;
  /** Predicate que retorna `true` si el lead está siendo actualizado (project type). Deshabilita el submenú. */
  isUpdatingProjectType?: (lead: Lead) => boolean;
}

/** Valores retornados por `useLeadsTableLogic`. */
export interface UseLeadsTableLogicReturn {
  /** Filas visibles tras filtro de búsqueda y status. */
  rows: Lead[];
  /** Cantidad total de leads sin filtrar. */
  totalCount: number;
  /** Cantidad de leads visibles tras aplicar filtros. */
  filteredCount: number;
  searchState: {
    searchQuery: string;
    searchField: string;
    setSearchQuery: (q: string) => void;
    setSearchField: (f: string) => void;
  };
  filterState: {
    statusFilter: LeadStatus | "all";
    setStatusFilter: (v: LeadStatus | "all") => void;
    groupBy: LeadGroupBy;
    setGroupBy: (v: LeadGroupBy) => void;
  };
  /** Props del modal de confirmación de eliminación. */
  deleteModalProps: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemToDelete: Lead | null;
    isDeleting: boolean;
    error: string | null;
  };
  /** Construye los items del menú contextual para un lead dado (incluye submenús de status y project type). */
  getContextMenuItems: (lead: Lead) => EntityContextMenuItem[];
  onOpenNotesModal?: (lead: Lead) => void;
  onViewContact: (contact: Contact) => void;
  /** Predicate que retorna `true` si el lead está en medio de una mutación (status o project type). */
  isMutating?: (lead: Lead) => boolean;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  [LeadStatus.NEW_LEAD]: "New Lead",
  [LeadStatus.CONTACTED]: "Contacted",
  [LeadStatus.ESTIMATING_PREPARING_PROPOSAL]: "Estimating / Preparing Proposal",
  [LeadStatus.PROPOSAL_SENT]: "Proposal Sent",
  [LeadStatus.FOLLOW_UP]: "Follow Up",
  [LeadStatus.WON]: "Won",
  [LeadStatus.LOST]: "Lost",
};

export function useLeadsTableLogic({
  leads,
  onEdit,
  onDelete,
  onViewContact,
  onOpenNotesModal,
  onConvertToProject,
  projectTypes,
  onUpdateStatus,
  onUpdateProjectType,
  isUpdatingStatus,
  isUpdatingProjectType,
}: UseLeadsTableLogicProps): UseLeadsTableLogicReturn {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [groupBy, setGroupBy] = useState<LeadGroupBy>("none");

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
      const isMutatingRow = isUpdatingStatus?.(lead) || isUpdatingProjectType?.(lead) || false;

      items.push({
        label: "Change Status",
        icon: React.createElement(Check, { className: "size-4" }),
        disabled: isMutatingRow,
        subItems: Object.values(LeadStatus).map((status) => ({
          label: STATUS_LABELS[status],
          checked: lead.status === status,
          disabled:
            lead.status === status ||
            isMutatingRow ||
            !canTransition(lead.status, status),
          onClick: () => {
            void onUpdateStatus(lead, status);
          },
        })),
      });

      items.push({
        label: "Change Project Type",
        icon: React.createElement(FolderPlus, { className: "size-4" }),
        disabled: isMutatingRow || projectTypes.length === 0,
        subItems: projectTypes.map((pt) => ({
          label: pt.name,
          checked: lead.projectType?.id === pt.id,
          disabled:
            lead.projectType?.id === pt.id || isMutatingRow,
          onClick: () => {
            void onUpdateProjectType(lead, pt.id);
          },
        })),
      });

      items.push({ label: "", separator: true });

      if (onOpenNotesModal) {
        items.push({
          label: "Notes",
          onClick: () => onOpenNotesModal(lead),
          icon: React.createElement(FileText, { className: "size-4" }),
          disabled: isMutatingRow,
        });
      }

      if (onConvertToProject) {
        items.push({
          label: "Convert to Project",
          onClick: () => {
            void onConvertToProject(lead);
          },
          icon: React.createElement(FolderPlus, { className: "size-4" }),
          disabled: isMutatingRow,
        });
      }

      items.push({
        label: "View Contact",
        icon: React.createElement(User, { className: "size-4" }),
        onClick: () => {
          if (lead.contact) onViewContact(lead.contact);
        },
        disabled: !lead.contact || isMutatingRow,
      });

      return items;
    },
  });

  const isMutating = useCallback(
    (lead: Lead) => {
      return isUpdatingStatus?.(lead) || isUpdatingProjectType?.(lead) || false;
    },
    [isUpdatingStatus, isUpdatingProjectType]
  );

  // 2) Estado de búsqueda
  const {
    filteredData: searchFilteredLeads,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
  } = useTableWithSearch<Lead>({
    data: localLeads,
    searchableFields: leadsSearchConfig.fields.map((f) => f.key),
    defaultSearchField: leadsSearchConfig.defaultField,
    normalize: leadsSearchConfig.normalize,
  });

  // 3) Filtro por status
  const filteredLeads = useMemo(() => {
    if (statusFilter === "all") return searchFilteredLeads;
    return searchFilteredLeads.filter((l) => l.status === statusFilter);
  }, [searchFilteredLeads, statusFilter]);

  return {
    rows: filteredLeads,
    totalCount,
    filteredCount: filteredLeads.length,
    searchState: {
      searchQuery,
      searchField,
      setSearchQuery,
      setSearchField,
    },
    filterState: {
      statusFilter,
      setStatusFilter,
      groupBy,
      setGroupBy,
    },
    deleteModalProps,
    getContextMenuItems,
    onOpenNotesModal,
    onViewContact,
    isMutating,
  };
}
