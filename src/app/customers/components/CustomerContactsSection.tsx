"use client";

import * as React from "react";
import type { Contact } from "@/contact";
import type { Company } from "@/company";
import { ContactsTable, ContactsTableSkeleton, ContactForm } from "@/features/contact/presentation/components";
import { useContactsApp } from "@/di";
import { contactsKeys, deleteContact, patchContact } from "@/contact";
import { useToast, Button, Modal } from "@/shared/ui";
import { useEntityForm } from "@/shared";
import { customersKeys } from "../keys";
import { initialContactFormValue, toContactPatch, mapContactToFormValue } from "../helpers/contactHelpers";

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
  const toast = useToast();

  const {
    isOpen,
    openEdit,
    closeModal,
    formValue,
    setFormValue,
    serverError,
    handleSubmit,
    isSubmitting,
  } = useEntityForm({
    initialFormValue: initialContactFormValue,
    toPatch: toContactPatch,
    updateFn: (id, patch) => patchContact(contactsApp, id, patch),
    invalidateKeys: [customersKeys.all, contactsKeys.lists()],
    successMessage: "Contact updated successfully!",
    errorMessage: "Could not update contact",
  });

  const handleDeleteContact = async (contactId: number) => {
    try {
      await deleteContact(contactsApp, contactId);
      toast.showSuccess("Contact deleted successfully!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not delete contact";
      toast.showError(message);
    }
  };

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-theme-light">Contact Customers</h2>
          <span className="text-sm text-gray-400">
            {contacts?.length ?? 0} {contacts?.length === 1 ? "contact" : "contacts"}
          </span>
        </div>
        {isLoading ? (
          <ContactsTableSkeleton />
        ) : (
          <ContactsTable
            contacts={contacts ?? []}
            companies={companies ?? []}
            isLoading={false}
            onEdit={(contact) => openEdit(contact, mapContactToFormValue)}
            onDelete={handleDeleteContact}
          />
        )}
      </section>
      <Modal
        isOpen={isOpen}
        title="Edit Contact"
        onClose={closeModal}
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      >
        {serverError && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {serverError}
          </div>
        )}
        <ContactForm
          value={formValue}
          onChange={setFormValue}
          disabled={isSubmitting}
          companies={companies ?? []}
        />
      </Modal>
    </>
  );
}
