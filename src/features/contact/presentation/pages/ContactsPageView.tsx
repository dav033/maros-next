"use client";

import type { Contact } from "@/contact";
import { EntityCrudPageTemplate } from "@dav033/dav-components";
import {
  TableToolbar,
  SimplePageHeader,
  DeleteFeedbackModal,
  NotesEditorModal,
  Icon,
} from "@dav033/dav-components";
import { ContactsTable } from "../organisms/ContactsTable";
import { ContactsTableSkeleton } from "../organisms/ContactsTableSkeleton";
import { ContactModal } from "../organisms/ContactModal";
import { CompanyModal } from "@/features/company/presentation/organisms/CompanyModal";
import { CompanyDetailsModal } from "../organisms/CompanyDetailsModal";
import type { UseContactsPageLogicReturn } from "../hooks";
import {
  useContactCompanyModalController,
  useContactModalController,
  useContactsNotesModalController,
  useContactsToolbarSearchController,
} from "../hooks";

export interface ContactsPageViewProps {
  logic: UseContactsPageLogicReturn;
}

export function ContactsPageView({ logic }: ContactsPageViewProps) {
  const {
    data,
    crud,
    table,
    companyModal,
    notesModal,
    companyDetailsModal,
  } = logic;

  const {
    contacts: filteredContacts,
    companies,
    services,
    showSkeleton,
  } = data;

  const {
    rows: tableFilteredContacts,
    totalCount,
    filteredCount,
    searchState,
  } = table;

  const {
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
  } = searchState;

  const {
    isCompanyModalOpen,
    companyFormValue,
    companyServerError,
    isCompanySubmitting,
    openCompanyModal,
    closeCompanyModal,
    handleCompanyFormChange,
    handleCompanySubmit,
  } = companyModal;

  const contactModalController = useContactModalController({
    mode: crud.mode,
    closeModal: crud.closeModal,
    handleCreateSubmit: crud.handleCreateSubmit,
    handleEditSubmit: crud.handleEditSubmit,
    formValue: crud.formValue,
    handleFormChange: crud.handleFormChange,
    isPending: crud.isPending,
    serverError: crud.serverError,
  });

  const companyModalController = useContactCompanyModalController({
    isOpen: isCompanyModalOpen,
    onClose: closeCompanyModal,
    onSubmit: handleCompanySubmit,
    formValue: companyFormValue,
    onChange: handleCompanyFormChange,
    isSubmitting: isCompanySubmitting,
    serverError: companyServerError,
  });

  const toolbarSearchController = useContactsToolbarSearchController({
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    filteredCount,
    totalCount,
  });

  const notesModalController = useContactsNotesModalController({
    isOpen: notesModal.isOpen,
    title: notesModal.title,
    notes: notesModal.notes,
    onChangeNotes: notesModal.onChangeNotes,
    onClose: notesModal.onClose,
    onSave: notesModal.onSave,
    loading: notesModal.loading,
  });

  return (
    <EntityCrudPageTemplate
      header={
        <SimplePageHeader
          title="Contacts"
          description="Manage people and customers connected to your projects."
        />
      }
      toolbar={
        <TableToolbar
          search={toolbarSearchController}
          onCreate={crud.openCreate}
          createLabel="New contact"
          createIcon={<Icon name="mdi:account-plus-outline" size={18} />}
        />
      }
      isLoading={showSkeleton}
      loadingContent={<ContactsTableSkeleton />}
      tableContent={
        <ContactsTable
          tableLogic={table}
          companies={companies}
          isLoading={showSkeleton}
        />
      }
      modals={
        <>
          <ContactModal
            controller={contactModalController}
            companies={companies ?? []}
            onCreateNewCompany={openCompanyModal}
          />

          <CompanyModal
            controller={companyModalController}
            services={services ?? []}
            contacts={[]}
          />

          <DeleteFeedbackModal
            isOpen={table.deleteModalProps.isOpen}
            title="Delete Contact"
            description={
              <>
                Are you sure you want to delete contact{" "}
                <span className="font-semibold text-theme-light">
                  {table.deleteModalProps.itemToDelete?.name}
                </span>
                ?
                <br />
                This action cannot be undone.
              </>
            }
            error={table.deleteModalProps.error}
            loading={table.deleteModalProps.isDeleting}
            onClose={table.deleteModalProps.onClose}
            onConfirm={table.deleteModalProps.onConfirm}
          />

          <NotesEditorModal controller={notesModalController} />

          <CompanyDetailsModal
            isOpen={companyDetailsModal.isOpen}
            company={companyDetailsModal.company}
            onClose={companyDetailsModal.close}
          />
        </>
      }
    />
  );
}
