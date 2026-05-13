"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useContactsApp } from "@/di";
import { createContact, contactsKeys } from "@/contact/application";
import { toContactDraft, type ContactFormValue } from "@/contact/domain";
import { initialContactFormValue } from "@/features/contact/presentation/hooks/mutations/useContactMutations";
import { CompanyContactsSelector } from "../../molecules/form/CompanyContactsSelector";
import { ContactModal } from "@/features/contact/presentation/organisms/ContactModal";
import { useContactModalController } from "@/features/contact/presentation/hooks/controllers/useContactModalController";
import { useQueryClient } from "@tanstack/react-query";
import type { Contact } from "@/contact/domain";
import type { Company } from "../../../domain/models";

interface CompanyContact {
  id: number;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  addressLink?: string;
  isCustomer: boolean;
  isClient: boolean;
  notes: string[];
}

export interface CompanyContactsSectionProps {
  companyId: number;
  contacts: CompanyContact[];
  allContacts: Contact[];
  allCompanies: Company[];
  currentContactIds: number[];
  onUpdateCompany: (params: {
    id: number;
    patch: Record<string, unknown>;
    contactIds: number[];
  }) => Promise<void>;
}

export function CompanyContactsSection({
  companyId,
  contacts,
  allContacts,
  allCompanies,
  currentContactIds,
  onUpdateCompany,
}: CompanyContactsSectionProps) {
  const router = useRouter();
  const contactsApp = useContactsApp();
  const queryClient = useQueryClient();

  // Add contacts: selector + create new
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactIdsToAdd, setContactIdsToAdd] = useState<number[]>([]);
  const [isAddingContactsSaving, setIsAddingContactsSaving] = useState(false);
  const [isCreateContactOpen, setIsCreateContactOpen] = useState(false);
  const [createContactFormValue, setCreateContactFormValue] =
    useState<ContactFormValue>(initialContactFormValue);
  const [createContactError, setCreateContactError] = useState<string | null>(
    null,
  );
  const [isCreateContactPending, setIsCreateContactPending] = useState(false);

  const contactsNotInCompany = allContacts.filter(
    (c): c is typeof c & { id: number } =>
      typeof c.id === "number" && !currentContactIds.includes(c.id),
  );

  const handleToggleContactToAdd = useCallback((contactId: number) => {
    setContactIdsToAdd((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId],
    );
  }, []);

  const handleAddSelectedContacts = useCallback(async () => {
    if (contactIdsToAdd.length === 0) return;
    setIsAddingContactsSaving(true);
    try {
      await onUpdateCompany({
        id: companyId,
        patch: {},
        contactIds: [...currentContactIds, ...contactIdsToAdd],
      });
      setContactIdsToAdd([]);
      setIsAddingContact(false);
      toast.success("Contacts added successfully.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not add contacts.",
      );
    } finally {
      setIsAddingContactsSaving(false);
    }
  }, [companyId, contactIdsToAdd, currentContactIds, onUpdateCompany, router]);

  const handleOpenCreateContact = useCallback(() => {
    setCreateContactFormValue({
      ...initialContactFormValue,
      companyId,
    });
    setCreateContactError(null);
    setIsCreateContactOpen(true);
  }, [companyId]);

  const handleCloseCreateContact = useCallback(() => {
    if (!isCreateContactPending) {
      setIsCreateContactOpen(false);
      setCreateContactError(null);
      setCreateContactFormValue(initialContactFormValue);
    }
  }, [isCreateContactPending]);

  const handleCreateContactSubmit = useCallback(async () => {
    setIsCreateContactPending(true);
    setCreateContactError(null);
    try {
      const draft = toContactDraft({
        ...createContactFormValue,
        companyId,
      });
      const newContact = await createContact(contactsApp, draft);
      if (typeof newContact.id !== "number") {
        throw new Error("Created contact has no id");
      }
      await queryClient.invalidateQueries({ queryKey: contactsKeys.list });
      await onUpdateCompany({
        id: companyId,
        patch: {},
        contactIds: [...currentContactIds, newContact.id],
      });
      setIsCreateContactOpen(false);
      setCreateContactFormValue(initialContactFormValue);
      toast.success("Contact created and added to company.");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not create contact.";
      setCreateContactError(msg);
      toast.error(msg);
    } finally {
      setIsCreateContactPending(false);
    }
  }, [
    companyId,
    createContactFormValue,
    contactsApp,
    queryClient,
    onUpdateCompany,
    currentContactIds,
    router,
  ]);

  const addContactModalController = useContactModalController({
    mode: isCreateContactOpen ? "create" : "list",
    closeModal: handleCloseCreateContact,
    handleCreateSubmit: handleCreateContactSubmit,
    handleEditSubmit: () => {},
    formValue: createContactFormValue,
    handleFormChange: setCreateContactFormValue,
    isPending: isCreateContactPending,
    serverError: createContactError,
  });

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Contacts
            </CardTitle>
            <CardDescription>
              {contacts && contacts.length > 0
                ? `${contacts.length} contact(s) associated`
                : "This company has no associated contacts"}
            </CardDescription>
          </div>
          {!isAddingContact ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingContact(true)}
              className="shrink-0"
            >
              <Plus className="size-4 mr-2" />
              Add contact
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          {isAddingContact ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select existing contacts to add, or create a new contact.
              </p>
              <CompanyContactsSelector
                selectedContactIds={contactIdsToAdd}
                contacts={contactsNotInCompany}
                onContactToggle={handleToggleContactToAdd}
                onCreateNewContact={handleOpenCreateContact}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleAddSelectedContacts}
                  disabled={
                    contactIdsToAdd.length === 0 || isAddingContactsSaving
                  }
                >
                  {isAddingContactsSaving ? "Saving..." : "Add selected"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingContact(false);
                    setContactIdsToAdd([]);
                  }}
                  disabled={isAddingContactsSaving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : !contacts || contacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                No contacts associated with this company
              </p>
              <Button
                variant="outline"
                onClick={() => setIsAddingContact(true)}
              >
                <Plus className="size-4 mr-2" />
                Add contact
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <Card
                  key={contact.id}
                  className="border-l-4 border-l-primary cursor-pointer hover:bg-accent/30 transition-colors"
                  onClick={() => router.push(`/contact/${contact.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {contact.name || "No name"}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        {contact.isCustomer && (
                          <Badge variant="outline">Customer</Badge>
                        )}
                        {contact.isClient && (
                          <Badge variant="outline">Client</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {contact.phone && (
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="text-foreground">{contact.phone}</p>
                        </div>
                      )}
                      {contact.email && (
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-foreground hover:underline"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                    </div>
                    {contact.address && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-muted-foreground text-sm mb-1">
                            Address
                          </p>
                          <p className="text-sm text-foreground">
                            {contact.address}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create contact modal (add to company) */}
      <ContactModal
        controller={addContactModalController}
        companies={allCompanies ?? []}
      />
    </>
  );
}
