"use client";

import { useTableWithSearch } from "@/common/hooks";

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
import { DeleteFeedbackModal } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Search } from "lucide-react";
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
          <h2 className="text-lg font-medium text-foreground">Contact Customers</h2>
          <span />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-3">
          <div className="max-w-3xl flex-1">
            <div className="flex items-center gap-2 w-full">
              <div className="w-32 shrink-0">
                <Select value={searchField} onValueChange={setSearchField}>
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {searchFields.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-0 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={customerContactsSearchPlaceholder}
                  className="pl-9 bg-background border-input"
                />
              </div>
              {searchQuery.trim().length > 0 && (
                <Button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {typeof filteredCount === "number" && typeof totalCount === "number" && (
                <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                  Showing {filteredCount} of {totalCount} results
                </span>
              )}
            </div>
          </div>
        </div>

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
            <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
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
