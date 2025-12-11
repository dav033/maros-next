"use client";

import { CompaniesTable } from "../organisms/CompaniesTable";
import { CompaniesTableSkeleton } from "../organisms/CompaniesTableSkeleton";
import { CompanyModal } from "../organisms/CompanyModal";
import { ManageServicesModal } from "../organisms/ManageServicesModal";
import { EntityCrudPageTemplate } from "@dav033/dav-components";
import {
  TableToolbar,
  SimplePageHeader,
  DeleteFeedbackModal,
  NotesEditorModal,
  Icon,
} from "@dav033/dav-components";
import { ContactModal } from "@/features/contact/presentation/organisms/ContactModal";
import type { UseCompaniesPageLogicReturn } from "../hooks";
import {
  useCompaniesToolbarSearchController,
  useCompanyContactModalController,
  useCompanyModalController,
  useCompanyNotesModalController,
} from "../hooks";

export interface CompaniesPageViewProps {
  logic: UseCompaniesPageLogicReturn;
}

export function CompaniesPageView({ logic }: CompaniesPageViewProps) {
  // 1) Estructura modular del hook
  const { data, modals, table, quickContact, notes } = logic;

  // 2) Datos
  const { companies, contacts, services, showSkeleton } = data;

  // 3) Modales
  const {
    create: createModal,
    edit: editModal,
    services: servicesModal,
    contact: contactModal,
  } = modals;

  // 4) Tabla
  const {
    rows,
    totalCount,
    filteredCount,
    deleteModalProps,
    getContextMenuItems,
    // 🔴 OJO: aquí usamos searchState, NO search
    searchState,
  } = table;

  const {
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
  } = searchState;

  // 5) Quick contact
  const {
    formValue: contactFormValue,
    isSubmitting: isContactSubmitting,
    error: contactError,
    handleChange: handleContactFormChange,
    handleSubmit: handleContactSubmit,
    handleClose: handleContactModalClose,
  } = quickContact;

  // 6) Notas
  const { modalProps: notesModalProps } = notes;

  // === Controladores de UI ===
  const companyModalController = useCompanyModalController({
    createModal,
    editModal,
  });

  const contactModalController = useCompanyContactModalController({
    isOpen: contactModal.isOpen,
    onClose: handleContactModalClose,
    onSubmit: handleContactSubmit,
    formValue: contactFormValue,
    onFormChange: handleContactFormChange,
    isLoading: isContactSubmitting,
    error: contactError,
  });

  const toolbarSearchController = useCompaniesToolbarSearchController({
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    filteredCount,
    totalCount,
  });

  const notesModalController = useCompanyNotesModalController({
    isOpen: notesModalProps.isOpen,
    title: notesModalProps.title || "",
    notes: notesModalProps.notes,
    onChangeNotes: notesModalProps.onChangeNotes,
    onClose: notesModalProps.onClose,
    onSave: notesModalProps.onSave,
    loading: notesModalProps.loading,
  });

  return (
    <EntityCrudPageTemplate
      header={
        <SimplePageHeader
          title="Companies"
          description="Manage companies and services."
        />
      }
      toolbar={
        <TableToolbar
          search={toolbarSearchController}
          onCreate={createModal.open}
          createLabel="New company"
          createIcon={<Icon name="mdi:office-building-plus-outline" size={18} />}
        />
      }
      isLoading={showSkeleton}
      loadingContent={<CompaniesTableSkeleton />}
      tableContent={
        <CompaniesTable
          companies={rows}
          services={services ?? []}
          getContextMenuItems={getContextMenuItems}
          onOpenNotesModal={table.onOpenNotesModal}
        />
      }
      modals={
        <>
          <CompanyModal
            controller={companyModalController}
            services={services ?? []}
            contacts={contacts ?? []}
            onCreateNewContact={() => contactModal.open(companyModalController.mode === 'create' ? 'create' : 'edit')}
          />

          <ContactModal
            controller={contactModalController}
            companies={companies ?? []}
            onCreateNewCompany={createModal.open}
          />

          <ManageServicesModal
            isOpen={servicesModal.isOpen}
            onClose={servicesModal.close}
            services={services ?? []}
          />

          <DeleteFeedbackModal
            isOpen={deleteModalProps.isOpen}
            title="Delete Company"
            description={
              <>
                Are you sure you want to delete company{" "}
                <span className="font-semibold text-theme-light">
                  {deleteModalProps.itemToDelete?.name}
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
        </>
      }
    />
  );
}
