"use client";

import { useNotesModal } from "@/common/hooks";

import { toast } from "sonner";

import { useContactsApp } from "@/di";
import { patchContact, contactsKeys } from "@/contact/application";
import type { Contact } from "@/contact/domain";
import { useQueryClient } from "@tanstack/react-query";

export interface UseContactsNotesLogicOptions {
  onSuccess?: (notes: string[]) => void;
}

export interface UseContactsNotesLogicReturn {
  openFromContact: (contact: Contact) => void;
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

export function useContactsNotesLogic(options?: UseContactsNotesLogicOptions): UseContactsNotesLogicReturn {
  const app = useContactsApp();
  const queryClient = useQueryClient();
  const {
    notesModalState,
    openNotesModal,
    closeNotesModal,
    updateNotes,
    saveNotes: saveNotesBase,
  } = useNotesModal<Contact>();

  const openFromContact = (contact: Contact) => {
    const notes = Array.isArray(contact.notes) ? contact.notes : [];
    openNotesModal(contact, contact.name, notes);
  };

  const handleSaveNotes = async () => {
    await saveNotesBase(async (contact, notes) => {
      if (typeof contact.id !== "number") return;
      try {
        const updated = await patchContact(app, contact.id, {
          notes: notes ?? [],
        });
        queryClient.setQueryData<Contact[]>(contactsKeys.list, (old) => {
          if (!old) return old;
          return old.map((c) => (c.id === contact.id ? updated : c));
        });
        queryClient.invalidateQueries({ queryKey: contactsKeys.all });
        toast.success("Notes updated successfully!");
        options?.onSuccess?.(notes ?? []);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Could not update notes";
        toast.error(message);
        throw error;
      }
    });
  };

  return {
    openFromContact,
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

