"use client";

import { useMemo } from "react";
import type { Contact } from "@/contact";
import type { Company } from "@/company";
import { ContactsTable, ContactsTableSkeleton } from "@/features/contact/presentation/organisms";
import { ContactForm } from "@/features/contact/presentation/molecules";
import { useContactsApp } from "@/di";
import { contactsKeys, deleteContact, patchContact } from "@/contact";
import { CustomerCrudModal } from "./CustomerCrudModal";
import { customersKeys } from "../../infra/keys";
import { initialContactFormValue, toContactPatch, mapContactToFormValue } from "../helpers/contactHelpers";
import { useCustomerCrudSection } from "../../application/hooks/useCustomerCrudSection";
import { useSearchState, filterBySearch } from "@/shared/search";
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

  const {
    state: searchState,
    setQuery,
    setField,
    clearSearch,
  } = useSearchState<Contact>(customerContactsSearchConfig);

  const filteredContacts = useMemo(
    () => filterBySearch(safeContacts, customerContactsSearchConfig, searchState),
    [safeContacts, searchState]
  );

  const { modal, handlers } = useCustomerCrudSection({
    initialFormValue: initialContactFormValue,
    toPatch: toContactPatch,
    toFormValue: mapContactToFormValue,
    updateFn: (id, patch) => patchContact(contactsApp, id, patch),
    deleteFn: (id) => deleteContact(contactsApp, id),
    invalidateKeys: [customersKeys.all, contactsKeys.lists()],
    messages: {
      successUpdate: "Contact updated successfully!",
      errorUpdate: "Could not update contact",
      successDelete: "Contact deleted successfully!",
      errorDelete: "Could not delete contact",
    },
  });

  const hasActiveSearch = searchState.query.trim().length > 0;

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
            {safeContacts.length} {safeContacts.length === 1 ? "contact" : "contacts"}
          </span>
        </div>

        <TableToolbar
          searchTerm={searchState.query}
          onSearchChange={setQuery}
          selectedField={searchState.field}
          onFieldChange={(value) => setField(value as any)}
          searchFields={searchFields}
          placeholder={customerContactsSearchPlaceholder}
          hasActiveSearch={hasActiveSearch}
          onClearSearch={clearSearch}
          resultCount={filteredContacts.length}
          totalCount={safeContacts.length}
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
