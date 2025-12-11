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
import { TableToolbar, useTableWithSearch, DeleteFeedbackModal } from "@dav033/dav-components";
import { customerContactsSearchConfig, customerContactsSearchPlaceholder } from "../search";
import { useState } from "react";

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
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const contactsApp = useContactsApp();

  const safeContacts = contacts ?? [];
  const safeCompanies = companies ?? [];

 
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

  const { modal, handlers } = useCustomerCrudSection<Contact & { id: number }, typeof initialContactFormValue, ReturnType<typeof toContactPatch>>({
    initialFormValue: initialContactFormValue,
    toPatch: toContactPatch,
    toFormValue: mapContactToFormValue,
    updateFn: async (id, patch) => {
      const res = await patchContact(contactsApp, id, patch);
      if (typeof res.id !== "number") throw new Error("Updated contact has no id");
      return res as Contact & { id: number };
    },
    deleteFn: (id) => deleteContact(contactsApp, id),
    invalidateKeys: [customersKeys.all, contactsKeys.list],
    messages: {
      successUpdate: "Contact updated successfully!",
      errorUpdate: "Could not update contact",
      successDelete: "Contact deleted successfully!",
      errorDelete: "Could not delete contact",
    },
  });

  const searchFields = customerContactsSearchConfig.fields.map(f => ({
    value: f.key as string,
    label: f.label,
  }));

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-theme-light">Contact Customers</h2>
          <span />
        </div>

        <TableToolbar
          search={{
            searchTerm: searchQuery,
            onSearchChange: setSearchQuery,
            selectedField: searchField,
            onFieldChange: setSearchField,
            searchFields: searchFields,
            placeholder: customerContactsSearchPlaceholder,
            resultCount: filteredCount,
            totalCount: totalCount,
          }}
        />

        {isLoading ? (
          <ContactsTableSkeleton />
        ) : (
          <ContactsTable
            contacts={filteredContacts}
            companies={safeCompanies}
            isLoading={false}
            onEdit={(contact) => {
              if (typeof contact.id === "number") handlers.handleEdit(contact as Contact & { id: number });
            }}
            onDelete={(contact) => {
              if (typeof contact.id === "number") {
                setDeleteTarget(contact);
              }
            }}
          />
        )}
      </section>
      <DeleteFeedbackModal
        isOpen={!!deleteTarget}
        title="Delete Contact"
        description={
          <>
            Are you sure you want to delete contact{" "}
            <span className="font-semibold text-theme-light">{deleteTarget?.name}</span>?
            <br />
            This action cannot be undone.
          </>
        }
        loading={isDeleting}
        onClose={() => {
          if (isDeleting) return;
          setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget?.id) return;
          setIsDeleting(true);
          await handlers.handleDelete(deleteTarget.id);
          setIsDeleting(false);
          setDeleteTarget(null);
        }}
      />
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
