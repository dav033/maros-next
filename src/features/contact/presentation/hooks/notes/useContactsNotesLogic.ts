"use client";

import { useNotesModal, useToast } from "@dav033/dav-components";
import { useContactsApp } from "@/di";
import { patchContact } from "@/contact/application";
import type { Contact } from "@/contact/domain";

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

export function useContactsNotesLogic(): UseContactsNotesLogicReturn {
  const app = useContactsApp();
  const toast = useToast();

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
      await patchContact(app, contact.id, {
        notes: notes ?? [],
      });
      toast.showSuccess("Notes updated successfully!");
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

