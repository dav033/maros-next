"use client";

import type { Contact } from "@/contact";
import { EmptyState, CrudPage } from "@/shared/ui";
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
 * 
 * Receives all logic and state from useContactsPageLogic hook.
 * Contains only UI rendering, no business logic.
 * 
 * Benefits:
 * - Easy to test (just props)
 * - Easy to maintain (no logic mixed with UI)
 * - Reusable (can be used in different contexts)
 * - Clear separation of concerns
 */
export function ContactsPageView({ logic }: ContactsPageViewProps) {
  const {
    crud,
    filteredContacts,
    companies,
    services,
    searchState,
    setSearchQuery,
    setSearchField,
    contacts,
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

  return (
    <CrudPage
      config={{
        title: "Contacts",
        subtitle: "Manage people and customers connected to your projects.",
        
        showToolbar: true,
        toolbarContent: (
          <ContactsToolbar<Contact>
            searchQuery={searchState.query}
            onSearchQueryChange={setSearchQuery}
            searchField={searchState.field}
            onSearchFieldChange={(value) => setSearchField(value as keyof Contact | "all")}
            onCreateContact={crud.openCreate}
            totalCount={contacts?.length ?? 0}
            filteredCount={filteredContacts.length}
          />
        ),
        
        showCreateButton: false,
        isLoading: showSkeleton,
        isEmpty: filteredContacts.length === 0,
        
        skeletonContent: <ContactsTableSkeleton />,
        
        emptyStateContent: (
          <EmptyState
            iconName="lucide:users"
            title="No contacts found."
            subtitle="Use the button above to create a new contact."
          />
        ),
        
        tableContent: (
          <ContactsTable
            contacts={filteredContacts}
            companies={companies}
            isLoading={showSkeleton}
            onEdit={crud.openEdit}
            onDelete={crud.handleDelete}
          />
        ),
        
        modalOpen: crud.mode === "create" || crud.mode === "edit",
        modalTitle: crud.mode === "create" ? "New contact" : "Edit contact",
        
        modalContent: (
          <>
            <ContactForm
              value={crud.formValue}
              onChange={crud.handleFormChange}
              disabled={crud.isPending}
              companies={companies ?? []}
              onCreateNewCompany={openCompanyModal}
            />
            
            {/* Nested company creation modal */}
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
        ),
        
        onModalClose: crud.closeModal,
        submitDisabled: !crud.formValue.name.trim(),
        submitLoading: crud.isPending,
        onSubmit: crud.mode === "create" ? crud.handleCreateSubmit : crud.handleEditSubmit,
        submitLabel: crud.mode === "create" ? "Create" : "Save changes",
        errorMessage: crud.serverError,
      }}
    />
  );
}
