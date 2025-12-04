"use client";

import * as React from "react";
import type { Lead } from "@/leads/domain";
import {
  ContextMenu,
  SimpleTable,
  ContactViewModal,
  EmptyState,
} from "@/shared/ui";
import { NotesEditorModal } from "@/shared/ui/organisms/NotesEditorModal";
import { DeleteFeedbackModal } from "@/shared/ui/organisms/DeleteFeedbackModal";
import { useLeadsTableLogic } from "../hooks/useLeadsTableLogic";
import { useLeadsTableColumns } from "../hooks/useLeadsTableColumns";

export interface LeadsTableProps {
  leads: Lead[];
  isLoading?: boolean;
  onEdit?: (lead: Lead) => void;
  onDelete?: (leadId: number) => void;
}

export function LeadsTable({
  leads,
  isLoading,
  onEdit,
  onDelete,
}: LeadsTableProps) {
  const {
    localLeads,
    contextMenu,
    contactModal,
    deleteModal,
    notesModal,
    handleRowContextMenu,
  } = useLeadsTableLogic({ leads, onEdit, onDelete });

  const columns = useLeadsTableColumns({
    onOpenContactModal: contactModal.open,
    onOpenNotesModal: notesModal.open,
  });

  if (!localLeads || localLeads.length === 0) {
    return (
      <EmptyState
        iconName="lucide:clipboard-list"
        title="No leads found."
        subtitle="Use the button above to create a new lead."
      />
    );
  }

  return (
    <>
      <SimpleTable<Lead>
        columns={columns}
        data={localLeads}
        rowKey={(lead) => lead.id}
        onRowContextMenu={handleRowContextMenu}
      />

      <ContextMenu
        isOpen={contextMenu.isVisible}
        position={contextMenu.position}
        onClose={contextMenu.hide}
        options={Array.isArray(contextMenu.options) ? contextMenu.options : []}
      />

      <ContactViewModal
        isOpen={!!contactModal.contact}
        contact={contactModal.contact}
        onClose={contactModal.close}
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
        title="Delete Lead"
        description={
          <>
            Are you sure you want to delete lead{" "}
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
    </>
  );
}
