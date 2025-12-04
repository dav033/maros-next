"use client";

import * as React from "react";
import type { Company } from "../../domain/models";
import { ContextMenu, SimpleTable, EmptyState } from "@/shared/ui";
import { DeleteFeedbackModal } from "@/shared/ui/organisms/DeleteFeedbackModal";
import { NotesEditorModal } from "@/shared/ui/organisms/NotesEditorModal";
import { useCompaniesTableLogic } from "../hooks/useCompaniesTableLogic";
import { useCompaniesTableColumns } from "../hooks/useCompaniesTableColumns";

export interface CompaniesTableProps {
  companies: Company[];
  isLoading?: boolean;
  onEdit: (company: Company) => void;
  onDelete: (companyId: number) => void;
  services?: Array<{ id: number; name: string; color?: string | null }>;
}

export function CompaniesTable({
  companies,
  isLoading,
  onEdit,
  onDelete,
  services = [],
}: CompaniesTableProps) {
  const {
    localCompanies,
    filteredCompanies,
    searchState,
    contextMenu,
    deleteModal,
    notesModal,
    handleRowContextMenu,
  } = useCompaniesTableLogic({ companies, onEdit, onDelete, services });

  const columns = useCompaniesTableColumns({
    services,
    onOpenNotesModal: notesModal.open,
  });

  if (!localCompanies || localCompanies.length === 0) {
    return (
      <EmptyState
        iconName="lucide:building-2"
        title="No companies found."
        subtitle="Use the button above to create a new company."
      />
    );
  }

  return (
    <>
      <SimpleTable<Company>
        columns={columns}
        data={localCompanies}
        rowKey={(company) => company.id}
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
        title="Delete Company"
        description={
          <>
            Are you sure you want to delete company{" "}
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
