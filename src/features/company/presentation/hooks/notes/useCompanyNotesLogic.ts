"use client";

import { useNotesModal } from "@/common/hooks";
// useCompanyNotesLogic.ts
import { toast } from "sonner";
import { companyKeys } from "../../../application";
import type { Company } from "../../../domain/models";
import { useQueryClient } from "@tanstack/react-query";
import { useCompanyMutations } from "..";
import { updateCompanyNotesAction } from "../../../actions/notesActions";

export interface UseCompanyNotesLogicReturn {
  openFromCompany: (company: Company) => void;
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

export function useCompanyNotesLogic(): UseCompanyNotesLogicReturn {
  const queryClient = useQueryClient();
  const { invalidateQueries } = useCompanyMutations();

  const {
    notesModalState,
    openNotesModal,
    closeNotesModal,
    updateNotes,
    saveNotes: saveNotesBase,
  } = useNotesModal<Company>();

  const openFromCompany = (company: Company) => {
    const notes = Array.isArray(company.notes) ? company.notes : [];
    openNotesModal(company, company.name, notes);
  };

  const handleSaveNotes = async () => {
    await saveNotesBase(async (company, notes) => {
      try {
        const result = await updateCompanyNotesAction(company.id, notes);

        if (!result.success) {
          throw new Error(result.error);
        }

        const updated = result.data;

        queryClient.setQueryData<Company[]>(
          companyKeys.lists(),
          (oldCompanies) => {
            if (!oldCompanies) return oldCompanies;
            return oldCompanies.map((c) => (c.id === company.id ? updated : c));
          }
        );

        await invalidateQueries();
        toast.success("Notes updated successfully!");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not update notes";
        toast.error(message);
        throw error;
      }
    });
  };

  return {
    openFromCompany,
    modalProps: {
      isOpen: notesModalState.isOpen,
      title: notesModalState.title,
      notes: notesModalState.notes,
      onChangeNotes: updateNotes,
      onClose: closeNotesModal,
      onSave: handleSaveNotes,
      loading: notesModalState.isLoading,
    },
  };
}
