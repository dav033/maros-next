"use client";

import * as React from "react";
import type { Contact } from "@/contact";
import type { Company } from "@/company";
import { useContactsApp } from "@/di";
import {
  useContextMenu,
  useDeleteModal,
  useNotesModal,
} from "@/shared/ui";
import type { ContextMenuOption } from "@/shared/ui";
import { deleteContact, patchContact } from "@/contact";

interface UseContactsTableLogicProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: number) => void;
}

export function useContactsTableLogic({
  contacts,
  onEdit,
  onDelete,
}: UseContactsTableLogicProps) {
  const app = useContactsApp();
  const { isVisible, position, options, show, hide } = useContextMenu();
  const [localContacts, setLocalContacts] = React.useState<Contact[]>(contacts);
  const [companyModalOpen, setCompanyModalOpen] = React.useState(false);
  const [companyToView, setCompanyToView] = React.useState<Company | null>(null);

  const {
    deleteModalState,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
  } = useDeleteModal<Contact>();

  const {
    notesModalState,
    openNotesModal,
    closeNotesModal,
    updateNotes,
    saveNotes,
  } = useNotesModal<Contact>();

  React.useEffect(() => {
    setLocalContacts(contacts);
  }, [contacts]);

  const handleOpenCompanyModal = React.useCallback((company: Company) => {
    setCompanyToView(company);
    setCompanyModalOpen(true);
  }, []);

  const handleCloseCompanyModal = React.useCallback(() => {
    setCompanyModalOpen(false);
    setCompanyToView(null);
  }, []);

  const handleDeleteContactClick = React.useCallback(
    async (contact: Contact) => {
      await confirmDelete(async (contactToDelete) => {
        await deleteContact(app, contactToDelete.id);
        setLocalContacts((prev) =>
          prev.filter((c) => c.id !== contactToDelete.id)
        );
        onDelete(contactToDelete.id);
      });
    },
    [app, confirmDelete, onDelete]
  );

  const handleOpenContactNotesModal = React.useCallback(
    (contact: Contact) => {
      const notes = Array.isArray(contact.notes) ? contact.notes : [];
      openNotesModal(contact, contact.name, notes);
    },
    [openNotesModal]
  );

  const handleRowContextMenu = React.useCallback(
    (event: React.MouseEvent<HTMLTableRowElement>, contact: Contact) => {
      const contextOptions: ContextMenuOption[] = [
        {
          id: "edit",
          label: "Edit Contact",
          icon: "lucide:edit",
          action: () => {
            onEdit(contact);
            hide();
          },
        },
        {
          id: "view-notes",
          label: "View Notes",
          icon: "lucide:file-text",
          action: () => {
            handleOpenContactNotesModal(contact);
            hide();
          },
        },
        {
          id: "view-company",
          label: "View Company",
          icon: "lucide:building-2",
          disabled: !contact.company,
          action: () => {
            if (contact.company) {
              handleOpenCompanyModal(contact.company);
              hide();
            }
          },
        },
        {
          id: "separator-1" as const,
          label: "",
          separator: true,
          action: () => {},
        },
        {
          id: "delete",
          label: "Delete Contact",
          icon: "lucide:trash-2",
          action: () => {
            openDeleteModal(contact);
            hide();
          },
          danger: true,
        },
      ];
      show(event, contextOptions);
    },
    [onEdit, show, hide, openDeleteModal, handleOpenContactNotesModal, handleOpenCompanyModal]
  );

  const handleSaveContactNotes = React.useCallback(async () => {
    await saveNotes(async (contact, notes) => {
      const updated = await patchContact(app, contact.id, {
        notes: notes ?? [],
      });
      setLocalContacts((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    });
  }, [app, saveNotes]);

  return {
    localContacts,
    contextMenu: { isVisible, position, options, hide },
    companyModal: {
      isOpen: companyModalOpen,
      company: companyToView,
      open: handleOpenCompanyModal,
      close: handleCloseCompanyModal,
    },
    deleteModal: {
      state: deleteModalState,
      close: closeDeleteModal,
      handleDelete: handleDeleteContactClick,
    },
    notesModal: {
      state: notesModalState,
      open: handleOpenContactNotesModal,
      close: closeNotesModal,
      update: updateNotes,
      save: handleSaveContactNotes,
    },
    handleRowContextMenu,
  };
}
