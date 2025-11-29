"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Contact, ContactDraft, ContactPatch } from "@/contact";
import {
  contactsKeys,
  createContact,
  patchContact,
} from "@/contact";
import { useContactsApp } from "@/di";
import { useSearchState, filterBySearch } from "@/shared/search";
import { normalizeEmptyToUndefined, pickDefined } from "@/shared/mappers/dto";
import { Button, Icon, useToast } from "@/shared/ui";
import { Modal } from "@/shared/ui";
import { ContactsToolbar } from "./components/ContactsToolbar";
import { ContactsTableSkeleton } from "./components/ContactsTableSkeleton";
import { ContactsTable } from "./components/ContactsTable";
import { ContactForm, ContactFormValue } from "./components/ContactForm";
import { useInstantContacts } from "./hooks/useInstantContacts";
import { contactsSearchConfig } from "./search/contactsSearchConfig";
import { useInstantCompanies } from "@/features/company/presentation/hooks/useInstantCompanies";

type Mode = "list" | "create" | "edit";

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

function toDraft(value: ContactFormValue): ContactDraft {
  return {
    name: value.name.trim(),
    phone: normalizeEmptyToUndefined(value.phone),
    email: normalizeEmptyToUndefined(value.email),
    occupation: normalizeEmptyToUndefined(value.occupation),
    address: normalizeEmptyToUndefined(value.address),
    isCustomer: value.isCustomer,
    isClient: value.isClient,
    companyId: value.companyId,
  };
}

function toPatch(current: Contact, value: ContactFormValue): ContactPatch {
  const trimmedName = value.name.trim();
  const normalizedPhone = normalizeEmptyToUndefined(value.phone);
  const normalizedEmail = normalizeEmptyToUndefined(value.email);
  const normalizedOccupation = normalizeEmptyToUndefined(value.occupation);
  const normalizedAddress = normalizeEmptyToUndefined(value.address);
  
  const currentPhone = normalizeEmptyToUndefined(current.phone);
  const currentEmail = normalizeEmptyToUndefined(current.email);
  const currentOccupation = normalizeEmptyToUndefined(current.occupation);
  const currentAddress = normalizeEmptyToUndefined(current.address);
  
  const patch: Partial<Contact> = {};

  if (trimmedName !== current.name) {
    patch.name = trimmedName;
  }
  if (normalizedPhone !== currentPhone) {
    patch.phone = normalizedPhone;
  }
  if (normalizedEmail !== currentEmail) {
    patch.email = normalizedEmail;
  }
  if (normalizedOccupation !== currentOccupation) {
    patch.occupation = normalizedOccupation;
  }
  if (normalizedAddress !== currentAddress) {
    patch.address = normalizedAddress;
  }
  if (value.isCustomer !== current.isCustomer) {
    patch.isCustomer = value.isCustomer;
  }
  if (value.isClient !== current.isClient) {
    patch.isClient = value.isClient;
  }
  if (value.companyId !== (current.companyId ?? null)) {
    patch.companyId = value.companyId;
  }

  return patch as ContactPatch;
}

export default function ContactsPage() {
  const app = useContactsApp();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { companies } = useInstantCompanies();

  const {
    state: searchState,
    setQuery,
    setField,
  } = useSearchState<Contact>(contactsSearchConfig);

  const {
    contacts,
    showSkeleton,
  } = useInstantContacts();

  const filteredContacts = useMemo(
    () => filterBySearch(contacts ?? [], contactsSearchConfig, searchState),
    [contacts, searchState]
  );

  const [mode, setMode] = useState<Mode>("list");
  const [current, setCurrent] = useState<Contact | null>(null);
  const [formValue, setFormValue] = useState<ContactFormValue>(initialFormValue);
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (draft: ContactDraft) => createContact(app, draft),
    onSuccess: () => {
      setMode("list");
      setServerError(null);
      setFormValue(initialFormValue);
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.showSuccess("Contact created successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not create contact";
      setServerError(message);
      toast.showError(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; patch: ContactPatch }) =>
      patchContact(app, input.id, input.patch),
    onSuccess: () => {
      setMode("list");
      setCurrent(null);
      setServerError(null);
      setFormValue(initialFormValue);
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.showSuccess("Contact updated successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not update contact";
      setServerError(message);
      toast.showError(message);
    },
  });

  function openCreate() {
    setFormValue(initialFormValue);
    setCurrent(null);
    setServerError(null);
    setMode("create");
  }

  function openEdit(contact: Contact) {
    setCurrent(contact);
    setFormValue({
      name: contact.name,
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      occupation: contact.occupation ?? "",
      address: contact.address ?? "",
      isCustomer: contact.isCustomer,
      isClient: contact.isClient,
      companyId: contact.companyId ?? null,
    });
    setServerError(null);
    setMode("edit");
  }

  function closeModal() {
    if (createMutation.isPending || updateMutation.isPending) {
      return;
    }
    setMode("list");
    setCurrent(null);
    setServerError(null);
    setFormValue(initialFormValue);
  }

  function handleCreateSubmit() {
    const draft = toDraft(formValue);
    if (!draft.name) {
      setServerError("Name is required");
      return;
    }
    createMutation.mutate(draft);
  }

  function handleEditSubmit() {
    if (!current) {
      return;
    }
    const patch = toPatch(current, formValue);
    if (Object.keys(patch).length === 0) {
      closeModal();
      return;
    }
    updateMutation.mutate({ id: current.id, patch });
  }

  function handleFormChange(value: ContactFormValue) {
    setFormValue(value);
  }

  function handleDelete(id: number) {
    queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
  }

  const isModalOpen = mode === "create" || mode === "edit";

  return (
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col gap-3 bg-theme-dark px-3 py-3 pt-16 sm:gap-4 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-theme-light sm:text-2xl">Contacts</h1>
        <p className="text-xs text-gray-400 sm:text-sm">
          Manage people and customers connected to your projects.
        </p>
      </header>

      <ContactsToolbar<Contact>
        searchQuery={searchState.query}
        onSearchQueryChange={setQuery}
        searchField={searchState.field}
        onSearchFieldChange={(value) => setField(value as keyof Contact | "all")}
        onCreateContact={openCreate}
        totalCount={contacts?.length ?? 0}
        filteredCount={filteredContacts.length}
      />

      <section className="mt-2 flex flex-1 flex-col">
        {showSkeleton ? (
          <ContactsTableSkeleton />
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="max-w-md rounded-xl border border-dashed border-theme-gray-subtle bg-theme-dark/80 px-4 py-8 text-center text-sm text-gray-400 sm:rounded-2xl sm:px-6 sm:py-10">
              <Icon name="lucide:users" size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-base font-medium text-gray-300">No contacts found.</p>
              <p className="mt-2 text-xs sm:text-sm">
                Use the button above to create a new contact.
              </p>
            </div>
          </div>
        ) : (
          <ContactsTable
            contacts={filteredContacts}
            companies={companies}
            isLoading={showSkeleton}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </section>

      <Modal
        isOpen={isModalOpen}
        title={mode === "create" ? "New contact" : "Edit contact"}
        onClose={closeModal}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={closeModal}
              disabled={
                createMutation.isPending || updateMutation.isPending
              }
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={mode === "create" ? handleCreateSubmit : handleEditSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={!formValue.name.trim()}
            >
              {mode === "create" ? "Create" : "Save changes"}
            </Button>
          </>
        }
      >
        <ContactForm
          value={formValue}
          onChange={handleFormChange}
          disabled={createMutation.isPending || updateMutation.isPending}
          companies={companies ?? []}
        />
        {serverError && (
          <p className="mt-2 text-sm text-red-400">{serverError}</p>
        )}
      </Modal>
    </main>
  );
}
