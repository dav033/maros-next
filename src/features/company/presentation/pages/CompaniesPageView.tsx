"use client";

import { CompaniesTable } from "../organisms/CompaniesTable";
import { CompaniesToolbar } from "../molecules/CompaniesToolbar";
import { CompaniesTableSkeleton } from "../organisms/CompaniesTableSkeleton";
import { EmptyCompaniesState } from "../molecules/EmptyCompaniesState";
import { CompanyModal } from "../organisms/CompanyModal";
import { ManageServicesModal } from "../organisms/ManageServicesModal";
import { Modal, Button, EntityCrudPageTemplate } from "@/shared/ui";
import { ContactForm } from "@/features/contact/presentation/molecules/ContactForm";
import type { UseCompaniesPageLogicReturn } from "../hooks/useCompaniesPageLogic";

export interface CompaniesPageViewProps {
  logic: UseCompaniesPageLogicReturn;
}

/**
 * Pure presentational component for the Companies page.
 * Manages three modals: Company CRUD, Services management, and nested Contact creation.
 */
export function CompaniesPageView({ logic }: CompaniesPageViewProps) {
  const {
    companies,
    contacts,
    services,
    showSkeleton,
    createModal,
    editModal,
    servicesModal,
    contactModal,
    contactFormValue,
    isContactSubmitting,
    contactError,
    handleContactFormChange,
    handleContactSubmit,
    handleContactModalClose,
    handleDelete,
    filteredCompanies,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
  } = logic;

  return (
    <EntityCrudPageTemplate
      header={
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-theme-light sm:text-2xl">
            Companies
          </h1>
          <p className="text-xs text-gray-400 sm:text-sm">
            Manage companies and contractors in your network.
          </p>
        </header>
      }
      toolbar={
        <CompaniesToolbar
          searchQuery={searchQuery}
          searchField={searchField}
          onSearchQueryChange={setSearchQuery}
          onSearchFieldChange={setSearchField}
          totalCount={totalCount}
          filteredCount={filteredCount}
          onManageServices={servicesModal.open}
          onNewCompany={createModal.open}
        />
      }
      isLoading={showSkeleton}
      loadingContent={<CompaniesTableSkeleton />}
      isEmpty={false}
      emptyContent={null}
      tableContent={
        <CompaniesTable
          companies={filteredCompanies}
          isLoading={showSkeleton}
          onEdit={editModal.open}
          onDelete={handleDelete}
          services={services}
        />
      }
      modals={
        <>
          {/* Create Company Modal */}
          <CompanyModal
            isOpen={createModal.isOpen}
            title="New company"
            onClose={createModal.close}
            onSubmit={createModal.submit}
            formValue={createModal.formValue}
            onChange={createModal.setFormValue}
            isSubmitting={createModal.isSubmitting}
            serverError={createModal.serverError}
            services={services ?? []}
            contacts={contacts ?? []}
            submitLabel="Create"
            onCreateNewContact={() => contactModal.open('create')}
          />

          {/* Edit Company Modal */}
          <CompanyModal
            isOpen={editModal.isOpen}
            title="Edit company"
            onClose={editModal.close}
            onSubmit={editModal.submit}
            formValue={editModal.formValue}
            onChange={editModal.setFormValue}
            isSubmitting={editModal.isSubmitting}
            serverError={editModal.serverError}
            services={services ?? []}
            contacts={contacts ?? []}
            submitLabel="Save changes"
            onCreateNewContact={() => contactModal.open('edit')}
          />

          {/* Manage Services Modal */}
          <ManageServicesModal
            isOpen={servicesModal.isOpen}
            onClose={servicesModal.close}
            services={services ?? []}
          />

          {/* Nested Contact Creation Modal */}
          <Modal
            isOpen={contactModal.isOpen}
            title="Create New Contact"
            onClose={handleContactModalClose}
            footer={
              <>
                <Button 
                  variant="secondary" 
                  onClick={handleContactModalClose} 
                  disabled={isContactSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleContactSubmit}
                  loading={isContactSubmitting}
                  disabled={!contactFormValue.name.trim()}
                >
                  Create Contact
                </Button>
              </>
            }
          >
            <ContactForm
              value={contactFormValue}
              onChange={handleContactFormChange}
              disabled={isContactSubmitting}
              companies={companies ?? []}
            />
            {contactError && (
              <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {contactError}
              </div>
            )}
          </Modal>
        </>
      }
    />
  );
}
