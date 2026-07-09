"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNotesModal } from "@/common/hooks";
import { leadsKeys } from "@/leads/application";
import type { Lead } from "@/leads/domain";
import { LeadStatus } from "@/leads/domain";
import {
  useLeadViewContactModal,
  useLeadsMutations,
  useLeadsTableLogic,
  useLostLeadsData,
  type UseLostLeadsDataReturn,
  type UseLeadsTableLogicReturn,
} from "../hooks";
import { updateLeadNotesAction } from "../../actions/notesActions";

export interface UseLostLeadsPageLogicReturn {
  data: UseLostLeadsDataReturn;
  table: UseLeadsTableLogicReturn;
  notesModal: {
    isOpen: boolean;
    title: string;
    notes: string[];
    onChangeNotes: (notes: string[]) => void;
    onClose: () => void;
    onSave: () => Promise<void>;
    loading: boolean;
  };
  viewContactModal: {
    isOpen: boolean;
    contact: ReturnType<typeof useLeadViewContactModal>["contact"];
    close: () => void;
  };
}

export function useLostLeadsPageLogic(): UseLostLeadsPageLogicReturn {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1) Datos
  const data = useLostLeadsData();

  // 2) Negocio
  const { deleteMutation, updateStatusMutation, updateProjectTypeMutation } = useLeadsMutations();
  const viewContactModal = useLeadViewContactModal();

  // 3) Notas (edición in-place)
  const {
    notesModalState,
    openNotesModal,
    closeNotesModal,
    updateNotes,
    saveNotes: saveNotesBase,
  } = useNotesModal<Lead>();

  const openNotesFromLead = (lead: Lead) => {
    const notes = Array.isArray(lead.notes) ? lead.notes : [];
    openNotesModal(lead, lead.name, notes);
  };

  const handleSaveNotes = async () => {
    await saveNotesBase(async (lead, notes) => {
      if (typeof lead.id !== "number") return;
      const result = await updateLeadNotesAction(lead.id, notes ?? []);
      if (!result.success) {
        throw new Error(result.error);
      }
      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
      await data.refetch();
      toast.success("Notes updated successfully!");
    });
  };

  const handleUpdateStatus = async (lead: Lead, status: LeadStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: lead.id, status });
    } catch {
      // Error ya manejado por useEntityMutation
    }
  };

  const handleUpdateProjectType = async (lead: Lead, projectTypeId: number) => {
    try {
      await updateProjectTypeMutation.mutateAsync({ id: lead.id, projectTypeId });
    } catch {
      // Error ya manejado por useEntityMutation
    }
  };

  // 4) Tabla (búsqueda, filtrado e interacciones)
  const table = useLeadsTableLogic({
    leads: data.leads,
    onEdit: (lead) => {
      if (typeof lead.id === "number") {
        router.push(`/lead/${lead.id}`);
      }
    },
    onDelete: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
    onViewContact: viewContactModal.open,
    onOpenNotesModal: openNotesFromLead,
    projectTypes: data.projectTypes,
    onUpdateStatus: handleUpdateStatus,
    onUpdateProjectType: handleUpdateProjectType,
    isUpdatingStatus: (lead) =>
      updateStatusMutation.isPending && updateStatusMutation.variables?.id === lead.id,
    isUpdatingProjectType: (lead) =>
      updateProjectTypeMutation.isPending && updateProjectTypeMutation.variables?.id === lead.id,
  });

  return {
    data,
    table,
    notesModal: {
      isOpen: notesModalState.isOpen,
      title: notesModalState.title || "",
      notes: notesModalState.notes,
      onChangeNotes: updateNotes,
      onClose: closeNotesModal,
      onSave: handleSaveNotes,
      loading: notesModalState.isLoading,
    },
    viewContactModal: {
      isOpen: viewContactModal.isOpen,
      contact: viewContactModal.contact,
      close: viewContactModal.close,
    },
  };
}
