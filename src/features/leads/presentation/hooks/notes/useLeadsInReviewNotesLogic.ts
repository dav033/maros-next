"use client";

import { useNotesModal } from "@/common/hooks";


import { toast } from "sonner";

import { leadsKeys } from "@/leads/application";
import type { Lead } from "@/leads/domain";
import { useQueryClient } from "@tanstack/react-query";
import { useLeadsInReviewData } from "../data/useLeadsInReviewData";
import { updateLeadNotesAction } from "../../../actions/notesActions";

export interface UseLeadsInReviewNotesLogicReturn {
  openFromLead: (lead: Lead) => void;
  modalProps: {
    isOpen: boolean;
    title: string;
    notes: string[];
    onChangeNotes: (notes: string[]) => void;
    onClose: () => void;
    onSave: () => Promise<void>;
    loading: boolean;
  };
}

export function useLeadsInReviewNotesLogic(): UseLeadsInReviewNotesLogicReturn {
  const queryClient = useQueryClient();
  const data = useLeadsInReviewData();

  const {
    notesModalState,
    openNotesModal,
    closeNotesModal,
    updateNotes,
    saveNotes: saveNotesBase,
  } = useNotesModal<Lead>();

  const openFromLead = (lead: Lead) => {
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

      const updated = result.data;

      // Actualizar la query key de leads en revisión
      queryClient.setQueryData<Lead[]>(leadsKeys.inReview(), (oldLeads) => {
        if (!oldLeads) return oldLeads;
        return oldLeads.map((l) => (l.id === lead.id ? updated : l));
      });

      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
      await data.refetch();
      toast.success("Notes updated successfully!");
    });
  };

  return {
    openFromLead,
    modalProps: {
      isOpen: notesModalState.isOpen,
      title: notesModalState.title || "",
      notes: notesModalState.notes,
      onChangeNotes: updateNotes,
      onClose: closeNotesModal,
      onSave: handleSaveNotes,
      loading: notesModalState.isLoading,
    },
  };
}
