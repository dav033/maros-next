"use client";

import { useMemo, useState } from "react";
import { LeadStatus, canTransition } from "@/leads/domain";
import type { Lead } from "@/leads/domain";
import type { useLeadsMutations } from "../mutations/useLeadsMutations";

export interface UseLeadsBulkActionsProps {
  leads: Lead[];
  updateStatusMutation: ReturnType<typeof useLeadsMutations>["updateStatusMutation"];
  deleteMutation: ReturnType<typeof useLeadsMutations>["deleteMutation"];
}

export interface UseLeadsBulkActionsReturn {
  selectedIds: Set<string | number>;
  onSelectionChange: (ids: Set<string | number>) => void;
  selectedCount: number;
  clearSelection: () => void;
  /** Estados a los que se puede transicionar TODOS los leads seleccionados a la vez. */
  availableStatuses: LeadStatus[];
  changeStatus: (status: LeadStatus) => Promise<void>;
  isChangingStatus: boolean;
  deleteModal: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    confirm: () => Promise<void>;
    isDeleting: boolean;
  };
}

export function useLeadsBulkActions({
  leads,
  updateStatusMutation,
  deleteMutation,
}: UseLeadsBulkActionsProps): UseLeadsBulkActionsReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedLeads = useMemo(
    () => leads.filter((lead) => typeof lead.id === "number" && selectedIds.has(lead.id)),
    [leads, selectedIds],
  );

  const availableStatuses = useMemo(() => {
    if (selectedLeads.length === 0) return [];
    return Object.values(LeadStatus).filter((status) =>
      selectedLeads.every(
        (lead) => lead.status !== status && canTransition(lead.status, status),
      ),
    );
  }, [selectedLeads]);

  const clearSelection = () => setSelectedIds(new Set());

  const changeStatus = async (status: LeadStatus) => {
    setIsChangingStatus(true);
    try {
      await Promise.allSettled(
        selectedLeads.map((lead) =>
          updateStatusMutation.mutateAsync({ id: lead.id as number, status }),
        ),
      );
      clearSelection();
    } finally {
      setIsChangingStatus(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await Promise.allSettled(
        selectedLeads.map((lead) => deleteMutation.mutateAsync(lead.id as number)),
      );
      clearSelection();
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    selectedIds,
    onSelectionChange: setSelectedIds,
    selectedCount: selectedIds.size,
    clearSelection,
    availableStatuses,
    changeStatus,
    isChangingStatus,
    deleteModal: {
      isOpen: isDeleteModalOpen,
      open: () => setIsDeleteModalOpen(true),
      close: () => setIsDeleteModalOpen(false),
      confirm: confirmDelete,
      isDeleting,
    },
  };
}
