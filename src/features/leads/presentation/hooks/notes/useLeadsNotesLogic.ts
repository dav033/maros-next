"use client";

import { useNotesModal, useToast } from "@dav033/dav-components";
import { useLeadsApp } from "@/di";
import { patchLead, leadsKeys } from "@/leads/application";
import type { Lead, LeadType } from "@/leads/domain";
import { useQueryClient } from "@tanstack/react-query";
import { useLeadsData } from "../data/useLeadsData";

export interface UseLeadsNotesLogicOptions {
  leadType: LeadType;
}

export interface UseLeadsNotesLogicReturn {
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

export function useLeadsNotesLogic({
  leadType,
}: UseLeadsNotesLogicOptions): UseLeadsNotesLogicReturn {
  const app = useLeadsApp();
  const queryClient = useQueryClient();
  const toast = useToast();
  const data = useLeadsData(leadType);

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
      const updated = await patchLead(app, lead.id, { notes: notes ?? [] }, {});

      queryClient.setQueryData<Lead[]>(leadsKeys.byType(leadType), (oldLeads) => {
        if (!oldLeads) return oldLeads;
        return oldLeads.map((l) => (l.id === lead.id ? updated : l));
      });

      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
      await data.refetch();
      toast.showSuccess("Notes updated successfully!");
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

