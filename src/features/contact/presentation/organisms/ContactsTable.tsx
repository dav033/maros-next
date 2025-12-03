"use client";

import * as React from "react";
import type { Contact } from "@/contact";
import type { Company } from "@/company";
import { ContextMenu, SimpleTable } from "@/shared/ui";
import { DeleteFeedbackModal } from "@/shared/ui/organisms/DeleteFeedbackModal";
import { NotesEditorModal } from "@/shared/ui/organisms/NotesEditorModal";
import { CompanyDetailsModal } from "./CompanyDetailsModal";
import { useContactsTableLogic } from "../hooks/useContactsTableLogic";
import { useContactsTableColumns } from "../hooks/useContactsTableColumns";

export interface ContactsTableProps {
  contacts: Contact[];
  companies?: Company[];
  isLoading?: boolean;
  onEdit: (contact: Contact) => void;
  onDelete: (contactId: number) => void;
}

export function ContactsTable({
  contacts,
  companies = [],
  isLoading,
  onEdit,
  onDelete,
}: ContactsTableProps) {
  const {
    localContacts,
    contextMenu,
    companyModal,
    deleteModal,
    notesModal,
    handleRowContextMenu,
  } = useContactsTableLogic({ contacts, onEdit, onDelete });

  const columns = useContactsTableColumns({
    companies,
    onOpenCompanyModal: companyModal.open,
    onOpenNotesModal: notesModal.open,
  });


  if (!localContacts || localContacts.length === 0) {
    if (isLoading) {
      return (
        <div className="rounded-2xl border border-theme-border/60 bg-theme-dark/40 p-4 text-sm text-theme-muted">
          Loading contacts...
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-dashed border-theme-border/60 bg-theme-dark/40 p-4 text-sm text-theme-muted">
        No contacts found.
      </div>
    );
  }

  return (
    <>
      <SimpleTable<Contact>
        columns={columns}
        data={localContacts}
        rowKey={(contact) => contact.id}
        onRowContextMenu={handleRowContextMenu}
      />

      <ContextMenu
        isOpen={contextMenu.isVisible}
        position={contextMenu.position}
        onClose={contextMenu.hide}
        options={Array.isArray(contextMenu.options) ? contextMenu.options : []}
      />

      <NotesEditorModal
        isOpen={notesModal.state.isOpen}
        title={`Notes – ${notesModal.state.title || ""}`}
        notes={notesModal.state.notes}
        loading={notesModal.state.isLoading}
        onChangeNotes={notesModal.update}
        onClose={notesModal.close}
        onSave={notesModal.save}
      />

      <DeleteFeedbackModal
        isOpen={deleteModal.state.isOpen}
        title="Delete Contact"
        description={
          <>
            Are you sure you want to delete contact{" "}
            <span className="font-semibold text-theme-light">
              {deleteModal.state.item?.name}
            </span>
            ?
            <br />
            This action cannot be undone.
          </>
        }
        error={deleteModal.state.error}
        loading={deleteModal.state.isLoading}
        onClose={deleteModal.close}
        onConfirm={() =>
          deleteModal.state.item && deleteModal.handleDelete(deleteModal.state.item)
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />

      <CompanyDetailsModal
        isOpen={companyModal.isOpen}
        company={companyModal.company}
        onClose={companyModal.close}
      />
    </>
  );
}
