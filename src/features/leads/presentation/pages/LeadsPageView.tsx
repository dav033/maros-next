"use client";

import type { Lead } from "@/leads/domain";
import { LeadsTable } from "@/leads/presentation";
import { DeleteFeedbackModal, NotesEditorModal } from "@dav033/dav-components";
import { ContactViewModal } from "@/contact";
import { LeadModal } from "../organisms/LeadModal";
import { TableToolbar, SimplePageHeader, Icon } from "@dav033/dav-components";
import { LeadsTableSkeleton } from "../organisms/LeadsTableSkeleton";
import { EntityCrudPageTemplate } from "@dav033/dav-components";
import type { UseLeadsPageLogicReturn } from "./useLeadsPageLogic";
import {
  useLeadModalController,
  useLeadsToolbarSearchController,
  useLeadsNotesModalController,
} from "../hooks";

export interface LeadsPageViewProps {
  logic: UseLeadsPageLogicReturn;
}

export function LeadsPageView({ logic }: LeadsPageViewProps) {
  const { config, data, crud, table, notesModal, viewContactModal } = logic;

  const { title, description, createModalTitle } = config;

  const { leads, contacts, projectTypes, showSkeleton } = data;

  const {
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    createController,
    isEditModalOpen,
    selectedLead,
    openEditModal,
    closeEditModal,
    updateController,
  } = crud;

  const {
    rows,
    totalCount,
    filteredCount,
    searchState,
    deleteModalProps,
    getContextMenuItems,
  } = table;

  const { searchQuery, searchField, setSearchQuery, setSearchField } =
    searchState;

  const { controller: leadModalController, contactsForModal } =
    useLeadModalController({
      isCreateModalOpen,
      isEditModalOpen,
      closeCreateModal,
      closeEditModal,
      createController,
      updateController,
      selectedLead,
      contacts,
    });

  const notesModalController = useLeadsNotesModalController({
    isOpen: notesModal.isOpen,
    title: notesModal.title,
    notes: notesModal.notes,
    onChangeNotes: notesModal.onChangeNotes,
    onClose: notesModal.onClose,
    onSave: notesModal.onSave,
    loading: notesModal.loading,
  });

  const toolbarSearchController = useLeadsToolbarSearchController({
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    filteredCount,
    totalCount,
  });

  return (
    <EntityCrudPageTemplate
      header={
        <SimplePageHeader
          title={title}
          description={description}
        />
      }
      toolbar={
        <TableToolbar
          search={toolbarSearchController}
          onCreate={openCreateModal}
          createLabel="New Lead"
          createIcon={<Icon name="mdi:briefcase-plus-outline" size={18} />}
        />
      }
      isLoading={showSkeleton}
      loadingContent={<LeadsTableSkeleton />}
      tableContent={
        <LeadsTable
          leads={rows}
          isLoading={showSkeleton}
          onEdit={openEditModal}
          getContextMenuItems={getContextMenuItems}
          onOpenNotesModal={table.onOpenNotesModal}
          onViewContact={table.onViewContact}
        />
      }
      modals={
        <>
          <DeleteFeedbackModal
            isOpen={deleteModalProps.isOpen}
            title="Delete Lead"
            description={
              <>
                Are you sure you want to delete lead{" "}
                <span className="font-semibold text-theme-light">
                  {(deleteModalProps.itemToDelete as any)?.name}
                </span>
                ?
                <br />
                This action cannot be undone.
              </>
            }
            error={deleteModalProps.error}
            loading={deleteModalProps.isDeleting}
            onClose={deleteModalProps.onClose}
            onConfirm={deleteModalProps.onConfirm}
          />

          <NotesEditorModal controller={notesModalController} />

          <ContactViewModal
            isOpen={viewContactModal.isOpen}
            contact={viewContactModal.contact}
            onClose={viewContactModal.close}
          />

          <LeadModal
            controller={leadModalController}
            contacts={contactsForModal}
            projectTypes={projectTypes}
          />
        </>
      }
    />
  );
}
