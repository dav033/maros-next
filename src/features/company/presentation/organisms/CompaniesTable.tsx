"use client";

import * as React from "react";
import type { Company } from "../../domain/models";
import { ContextMenu, SimpleTable } from "@/shared/ui";
import { CompaniesToolbar } from "../molecules/CompaniesToolbar";
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
  onManageServices?: () => void;
  onNewCompany?: () => void;
}

export function CompaniesTable({
  companies,
  isLoading,
  onEdit,
  onDelete,
  services = [],
  onManageServices,
  onNewCompany,
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
    if (isLoading) {
      return (
        <div className="rounded-2xl border border-theme-border/60 bg-theme-dark/40 p-4 text-sm text-theme-muted">
          Loading companies...
        </div>
      );
    }
    return (
      <div className="rounded-2xl border border-dashed border-theme-border/60 bg-theme-dark/40 p-4 text-sm text-theme-muted">
        No companies found.
      </div>
    );
  }

  return (
    <>
      <div className="mb-2">
        <CompaniesToolbar
          searchQuery={searchState.searchQuery}
          searchField={searchState.searchField}
          onSearchQueryChange={searchState.setSearchQuery}
          onSearchFieldChange={searchState.setSearchField}
          totalCount={searchState.totalCount}
          filteredCount={searchState.filteredCount}
          onManageServices={onManageServices}
          onNewCompany={onNewCompany}
        />
      </div>
      <SimpleTable<Company>
        columns={columns}
        data={filteredCompanies}
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
