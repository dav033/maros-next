"use client";

import type { Contact } from "@/contact";
import { EntityCrudPageTemplate, Modal, Button } from "@/shared/ui";
import { ContactsToolbar } from "../molecules/ContactsToolbar";
import { ContactsTable } from "../organisms/ContactsTable";
import { ContactsTableSkeleton } from "../organisms/ContactsTableSkeleton";
import { ContactForm } from "../molecules/ContactForm";
import { CompanyModal } from "@/features/company/presentation/organisms/CompanyModal";
import type { UseContactsPageLogicReturn } from "../hooks/useContactsPageLogic";

export interface ContactsPageViewProps {
  logic: UseContactsPageLogicReturn;
}

/**
 * Pure presentational component for the Contacts page.
 * Receives all logic from useContactsPageLogic hook.
 */
export function ContactsPageView({ logic }: ContactsPageViewProps) {
  const {
    crud,
    filteredContacts,
    companies,
    services,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
    showSkeleton,
    isCompanyModalOpen,
    companyFormValue,
    companyServerError,
    isCompanySubmitting,
    openCompanyModal,
    closeCompanyModal,
    handleCompanyFormChange,
    handleCompanySubmit,
  } = logic;

  const isModalOpen = crud.mode === "create" || crud.mode === "edit";
  const modalTitle = crud.mode === "create" ? "New contact" : "Edit contact";

  return (
    <EntityCrudPageTemplate
      header={
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-theme-light sm:text-2xl">Contacts</h1>
          <p className="text-xs text-gray-400 sm:text-sm">
            Manage people and customers connected to your projects.
          </p>
        </div>
      }
      toolbar={
        <ContactsToolbar<Contact>
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          searchField={searchField}
          onSearchFieldChange={(value) => setSearchField(value as keyof Contact | "all")}
          onCreateContact={crud.openCreate}
          totalCount={totalCount}
          filteredCount={filteredCount}
        />
      }
      isLoading={showSkeleton}
      loadingContent={<ContactsTableSkeleton />}
      isEmpty={false}
      emptyContent={null}
      tableContent={
        <ContactsTable
          contacts={filteredContacts}
          companies={companies}
          isLoading={showSkeleton}
          onEdit={(contact) => {
            if (typeof contact.id === "number") crud.openEdit(contact as Contact & { id: number });
          }}
          onDelete={crud.handleDelete}
        />
      }
      modals={
        <>
          {/* Create/Edit Contact Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={crud.closeModal}
            title={modalTitle}
            footer={
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={crud.closeModal}
                  disabled={crud.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={crud.mode === "create" ? crud.handleCreateSubmit : crud.handleEditSubmit}
                  disabled={!crud.formValue.name.trim() || crud.isPending}
                  loading={crud.isPending}
                >
                  {crud.mode === "create" ? "Create" : "Save changes"}
                </Button>
              </>
            }
          >
            <ContactForm
              value={crud.formValue}
              onChange={crud.handleFormChange}
              disabled={crud.isPending}
              companies={companies ?? []}
              onCreateNewCompany={openCompanyModal}
            />
            {crud.serverError && (
              <p className="mt-2 text-sm text-red-500">{crud.serverError}</p>
            )}
          </Modal>

          {/* Nested Company Creation Modal */}
          <CompanyModal
            isOpen={isCompanyModalOpen}
            title="New company"
            onClose={closeCompanyModal}
            onSubmit={handleCompanySubmit}
            formValue={companyFormValue}
            onChange={handleCompanyFormChange}
            isSubmitting={isCompanySubmitting}
            serverError={companyServerError}
            services={services ?? []}
            contacts={[]}
            submitLabel="Create"
          />
        </>
      }
    />
  );
}
