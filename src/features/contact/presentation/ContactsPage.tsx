"use client";

import { useMemo } from "react";
import type { Contact } from "@/contact";
import {
  contactsKeys,
  createContact,
  patchContact,
  toContactDraft,
  toContactPatch,
  toContactFormValue,
} from "@/contact";
import { useContactsApp } from "@/di";
import { useSearchState, filterBySearch } from "@/shared/search";
import { useCrudPage, EmptyState, CrudPage, TableSkeleton } from "@/shared/ui";
import { ContactsToolbar } from "./components/ContactsToolbar";
import { ContactsTable } from "./components/ContactsTable";
import { ContactsTableSkeleton } from "./components/ContactsTableSkeleton";
import { ContactForm, ContactFormValue } from "./components/ContactForm";
import { useInstantContacts } from "./hooks/useInstantContacts";
import { contactsSearchConfig } from "./search/contactsSearchConfig";
import { useInstantCompanies } from "@/features/company/presentation/hooks/useInstantCompanies";

const initialFormValue: ContactFormValue = {
  name: "",
  phone: "",
  email: "",
  occupation: "",
  address: "",
  isCustomer: false,
  isClient: false,
  companyId: null,
};

export default function ContactsPage() {
  const app = useContactsApp();
  const { companies } = useInstantCompanies();

  const {
    state: searchState,
    setQuery,
    setField,
  } = useSearchState<Contact>(contactsSearchConfig);

  const { contacts, showSkeleton } = useInstantContacts();

  const filteredContacts = useMemo(
    () => filterBySearch(contacts ?? [], contactsSearchConfig, searchState),
    [contacts, searchState]
  );

  const crud = useCrudPage<Contact, ContactFormValue, Contact, Contact>({
    queryKey: [contactsKeys.lists(), ["customers"]],
    createFn: (draft) => createContact(app, draft),
    updateFn: (id, patch) => patchContact(app, id, patch),
    toDraft: toContactDraft,
    toPatch: toContactPatch,
    initialFormValue,
    toFormValue: toContactFormValue,
    successMessages: {
      create: "Contact created successfully!",
      update: "Contact updated successfully!",
    },
  });

  return (
    <CrudPage
      config={{
        title: "Contacts",
        subtitle: "Manage people and customers connected to your projects.",
        showToolbar: true,
        toolbarContent: (
          <ContactsToolbar<Contact>
            searchQuery={searchState.query}
            onSearchQueryChange={setQuery}
            searchField={searchState.field}
            onSearchFieldChange={(value) => setField(value as keyof Contact | "all")}
            onCreateContact={crud.openCreate}
            totalCount={contacts?.length ?? 0}
            filteredCount={filteredContacts.length}
          />
        ),
        showCreateButton: false, // Handled by toolbar
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
          <ContactForm
            value={crud.formValue}
            onChange={crud.handleFormChange}
            disabled={crud.isPending}
            companies={companies ?? []}
          />
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
