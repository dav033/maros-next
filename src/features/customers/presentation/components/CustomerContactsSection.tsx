"use client";

import type { Contact } from "@/contact/domain";
import type { Company } from "@/company/domain";
import { ContactsTable, ContactsTableSkeleton } from "@/features/contact/presentation/organisms";
import { ContactForm } from "@/features/contact/presentation/molecules";
import { useContactsApp } from "@/di";
import { contactsKeys, deleteContact, patchContact } from "@/contact/application";
import { CustomerCrudModal } from "./CustomerCrudModal";
import { customersKeys } from "../../infra/keys";
import { initialContactFormValue, toContactPatch, mapContactToFormValue } from "../helpers/contactHelpers";
import { useCustomerCrudSection } from "../../application/hooks/useCustomerCrudSection";
import { useTableWithSearch } from "@/shared/hooks";
import { TableToolbar } from "@/shared/ui";
import { customerContactsSearchConfig, customerContactsSearchPlaceholder } from "../search";

export interface CustomerContactsSectionProps {
  contacts: Contact[];
  companies: Company[];
  isLoading: boolean;
}

export function CustomerContactsSection({
  contacts,
  companies,
  isLoading,
}: CustomerContactsSectionProps) {
  const contactsApp = useContactsApp();

  const safeContacts = contacts ?? [];
  const safeCompanies = companies ?? [];

  // Search and filtering with useTableWithSearch
  const {
    filteredData: filteredContacts,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
  } = useTableWithSearch<Contact>({
    data: safeContacts,
    searchableFields: customerContactsSearchConfig.fields.map(f => f.key),
    defaultSearchField: customerContactsSearchConfig.defaultField,
    normalize: customerContactsSearchConfig.normalize,
  });

  const { modal, handlers } = useCustomerCrudSection({
    initialFormValue: initialContactFormValue,
    toPatch: toContactPatch,
    toFormValue: mapContactToFormValue,
    updateFn: (id, patch) => patchContact(contactsApp, id, patch),
    deleteFn: (id) => deleteContact(contactsApp, id),
    invalidateKeys: [customersKeys.all, contactsKeys.list],
    messages: {
      successUpdate: "Contact updated successfully!",
      errorUpdate: "Could not update contact",
      successDelete: "Contact deleted successfully!",
      errorDelete: "Could not delete contact",
    },
  });

  const hasActiveSearch = searchQuery.trim().length > 0;

  const searchFields = customerContactsSearchConfig.fields.map(f => ({
    value: f.key as string,
    label: f.label,
  }));

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-theme-light">Contact Customers</h2>
          <span className="text-sm text-gray-400">
            {totalCount} {totalCount === 1 ? "contact" : "contacts"}
          </span>
        </div>

        <TableToolbar
          searchTerm={searchQuery}
          onSearchChange={setSearchQuery}
          selectedField={searchField}
          onFieldChange={setSearchField}
          searchFields={searchFields}
          placeholder={customerContactsSearchPlaceholder}
          hasActiveSearch={hasActiveSearch}
          onClearSearch={() => setSearchQuery("")}
          resultCount={filteredCount}
          totalCount={totalCount}
        />

        {isLoading ? (
          <ContactsTableSkeleton />
        ) : (
          <ContactsTable
            contacts={filteredContacts}
            companies={safeCompanies}
            isLoading={false}
            onEdit={handlers.handleEdit}
            onDelete={handlers.handleDelete}
          />
        )}
      </section>
      <CustomerCrudModal
        isOpen={modal.isOpen}
        title="Edit Contact"
        onClose={modal.closeModal}
        onSubmit={handlers.handleSubmit}
        isSubmitting={modal.isSubmitting}
        serverError={modal.serverError}
      >
        <ContactForm
          value={modal.formValue}
          onChange={modal.setFormValue}
          disabled={modal.isSubmitting}
          companies={safeCompanies}
        />
      </CustomerCrudModal>
    </>
  );
}
