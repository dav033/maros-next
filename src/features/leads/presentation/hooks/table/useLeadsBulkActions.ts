"use client";

import { useMemo, useState } from "react";
import { LeadStatus, canTransition } from "@/leads/domain";
import type { Lead, LeadLostReason } from "@/leads/domain";
import type { useLeadsMutations } from "../mutations/useLeadsMutations";
import { useLeadStatusChange, type UseLeadStatusChangeReturn } from "../mutations/useLeadStatusChange";

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
  lostReasonDialogProps: UseLeadStatusChangeReturn["lostReasonDialogProps"];
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

  const { requestStatusChange, lostReasonDialogProps } = useLeadStatusChange();

  const clearSelection = () => setSelectedIds(new Set());

  const applyStatus = async (status: LeadStatus, lostReason?: LeadLostReason) => {
    setIsChangingStatus(true);
    try {
      await Promise.allSettled(
        selectedLeads.map((lead) =>
          updateStatusMutation.mutateAsync({ id: lead.id as number, status, lostReason }),
        ),
      );
      clearSelection();
    } finally {
      setIsChangingStatus(false);
    }
  };

  // Un motivo por lead volvería inusable el lote, así que se pide uno solo y el
  // diálogo dice a cuántos leads se va a aplicar.
  const changeStatus = (status: LeadStatus) =>
    requestStatusChange({
      status,
      appliesToCount: selectedLeads.length,
      commit: (lostReason) => applyStatus(status, lostReason),
    });

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
    lostReasonDialogProps,
    deleteModal: {
      isOpen: isDeleteModalOpen,
      open: () => setIsDeleteModalOpen(true),
      close: () => setIsDeleteModalOpen(false),
      confirm: confirmDelete,
      isDeleting,
    },
  };
}
