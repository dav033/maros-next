// useCompanyNotesLogic.ts
"use client";

import { useNotesModal, useToast } from "@dav033/dav-components";
import { useCompanyApp } from "@/di";
import { companyCrudUseCases, companyKeys } from "../../../application";
import type { Company } from "../../../domain/models";
import { useQueryClient } from "@tanstack/react-query";
import { useCompanyMutations } from "..";

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
  const companyApp = useCompanyApp();
  const queryClient = useQueryClient();
  const toast = useToast();
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
        const updated = await companyCrudUseCases.update(companyApp)(
          company.id,
          { notes }
        );

        queryClient.setQueryData<Company[]>(
          companyKeys.lists(),
          (oldCompanies) => {
            if (!oldCompanies) return oldCompanies;
            return oldCompanies.map((c) => (c.id === company.id ? updated : c));
          }
        );

        await invalidateQueries();
        toast.showSuccess("Notes updated successfully!");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not update notes";
        toast.showError(message);
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
