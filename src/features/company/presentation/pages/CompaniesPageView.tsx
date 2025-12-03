"use client";

import { CompaniesPageHeader } from "../molecules/CompaniesPageHeader";
import { CompaniesTable } from "../organisms/CompaniesTable";
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
 * 
 * Receives all logic and state from useCompaniesPageLogic hook.
 * Contains only UI rendering, no business logic.
 * 
 * Manages three modals:
 * - Company create/edit modals
 * - Services management modal
 * - Nested contact creation modal
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
  } = logic;

  return (
    <EntityCrudPageTemplate
      header={<CompaniesPageHeader />}
      isLoading={showSkeleton}
      loadingContent={<CompaniesTableSkeleton />}
      isEmpty={!companies || companies.length === 0}
      emptyContent={<EmptyCompaniesState />}
      tableContent={
        <CompaniesTable
          companies={companies ?? []}
          isLoading={showSkeleton}
          onEdit={editModal.open}
          onDelete={handleDelete}
          services={services}
          onManageServices={servicesModal.open}
          onNewCompany={createModal.open}
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
