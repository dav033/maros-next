"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Contact, ContactPatch } from "@/contact";
import type { Company, CompanyPatch } from "@/company";
import { CompanyType } from "@/company";
import { useInstantCustomers } from "./hooks/useInstantCustomers";
import { ContactsTable, ContactsTableSkeleton, ContactForm, ContactFormValue } from "@/features/contact/presentation/components";
import { CompaniesTable } from "@/features/company/presentation/components/CompaniesTable";
import { CompaniesTableSkeleton } from "@/features/company/presentation/components/CompaniesTableSkeleton";
import { CompanyForm, CompanyFormValue } from "@/features/company/presentation/components/CompanyForm";
import { useContactsApp, useCompanyApp } from "@/di";
import { contactsKeys, deleteContact, patchContact } from "@/contact";
import { companyEndpoints } from "@/features/company/infra/http/endpoints";
import { companyKeys, companyCrudUseCases } from "@/company";
import { useToast, Button, Modal } from "@/shared/ui";
import { normalizeEmptyToUndefined, optimizedApiClient } from "@/shared";
import { useCompanyServices } from "@/features/company/presentation/hooks/useCompanyServices";

// Contact helpers
const initialContactFormValue: ContactFormValue = {
  name: "",
  phone: "",
  email: "",
  occupation: "",
  address: "",
  isCustomer: false,
  isClient: false,
  companyId: null,
};

function toContactPatch(current: Contact, value: ContactFormValue): ContactPatch {
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

// Company helpers
const initialCompanyFormValue: CompanyFormValue = {
  name: "",
  address: "",
  type: CompanyType.DESIGN,
  serviceId: null,
  isCustomer: false,
  isClient: false,
  contactIds: [],
};

function toCompanyPatch(current: Company, value: CompanyFormValue): CompanyPatch {
  const trimmedName = value.name.trim();
  const normalizedAddress = normalizeEmptyToUndefined(value.address);
  const currentAddress = normalizeEmptyToUndefined(current.address);

  const patch: Partial<Company> = {};

  if (trimmedName !== current.name) {
    patch.name = trimmedName;
  }
  if (normalizedAddress !== currentAddress) {
    patch.address = normalizedAddress;
  }
  if (value.type !== current.type) {
    patch.type = value.type;
  }
  if (value.serviceId !== current.serviceId) {
    patch.serviceId = value.serviceId;
  }
  if (value.isCustomer !== current.isCustomer) {
    patch.isCustomer = value.isCustomer;
  }
  if (value.isClient !== current.isClient) {
    patch.isClient = value.isClient;
  }

  return patch as CompanyPatch;
}

export default function CustomersPage() {
  const { contacts, companies, showSkeleton } = useInstantCustomers();
  const contactsApp = useContactsApp();
  const companyApp = useCompanyApp();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { services } = useCompanyServices();

  // Contact edit state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [contactFormValue, setContactFormValue] = useState<ContactFormValue>(initialContactFormValue);
  const [contactServerError, setContactServerError] = useState<string | null>(null);

  // Company edit state
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [companyFormValue, setCompanyFormValue] = useState<CompanyFormValue>(initialCompanyFormValue);
  const [companyServerError, setCompanyServerError] = useState<string | null>(null);

  // Contact mutations
  const updateContactMutation = useMutation({
    mutationFn: (input: { id: number; patch: ContactPatch }) =>
      patchContact(contactsApp, input.id, input.patch),
    onSuccess: () => {
      setContactModalOpen(false);
      setCurrentContact(null);
      setContactServerError(null);
      setContactFormValue(initialContactFormValue);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      toast.showSuccess("Contact updated successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not update contact";
      setContactServerError(message);
      toast.showError(message);
    },
  });

  // Company mutations
  const updateCompanyMutation = useMutation({
    mutationFn: (input: { id: number; patch: CompanyPatch }) =>
      companyCrudUseCases.update(companyApp)(input.id, input.patch),
    onSuccess: () => {
      setCompanyModalOpen(false);
      setCurrentCompany(null);
      setCompanyServerError(null);
      setCompanyFormValue(initialCompanyFormValue);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      toast.showSuccess("Company updated successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not update company";
      setCompanyServerError(message);
      toast.showError(message);
    },
  });

  const handleDeleteContact = async (contactId: number) => {
    try {
      await deleteContact(contactsApp, contactId);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      toast.showSuccess("Contact deleted successfully!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not delete contact";
      toast.showError(message);
    }
  };

  const handleDeleteCompany = async (companyId: number) => {
    try {
      await companyCrudUseCases.delete(companyApp)(companyId);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      toast.showSuccess("Company deleted successfully!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not delete company";
      toast.showError(message);
    }
  };

  const handleEditContact = (contact: Contact) => {
    setCurrentContact(contact);
    setContactFormValue({
      name: contact.name,
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      occupation: contact.occupation ?? "",
      address: contact.address ?? "",
      isCustomer: contact.isCustomer,
      isClient: contact.isClient,
    });
    setContactServerError(null);
    setContactModalOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setCurrentCompany(company);
    // Get contact IDs that belong to this company
    const companyContactIds = (contacts ?? [])
      .filter((contact) => contact.companyId === company.id)
      .map((contact) => contact.id);
    
    setCompanyFormValue({
      name: company.name,
      address: company.address ?? "",
      type: company.type,
      serviceId: company.serviceId ?? null,
      isCustomer: company.isCustomer,
      isClient: company.isClient,
      contactIds: companyContactIds,
    });
    setCompanyServerError(null);
    setCompanyModalOpen(true);
  };

  const handleCloseContactModal = () => {
    if (updateContactMutation.isPending) {
      return;
    }
    setContactModalOpen(false);
    setCurrentContact(null);
    setContactServerError(null);
    setContactFormValue(initialContactFormValue);
  };

  const handleCloseCompanyModal = () => {
    if (updateCompanyMutation.isPending) {
      return;
    }
    setCompanyModalOpen(false);
    setCurrentCompany(null);
    setCompanyServerError(null);
    setCompanyFormValue(initialCompanyFormValue);
  };

  const handleContactSubmit = () => {
    if (!currentContact) {
      return;
    }
    const patch = toContactPatch(currentContact, contactFormValue);
    if (Object.keys(patch).length === 0) {
      setContactServerError("No changes detected");
      return;
    }
    updateContactMutation.mutate({ id: currentContact.id, patch });
  };

  const handleCompanySubmit = async () => {
    if (!currentCompany) {
      return;
    }
    const patch = toCompanyPatch(currentCompany, companyFormValue);
    const hasChanges = Object.keys(patch).length > 0;
    const hasContactChanges = companyFormValue.contactIds !== undefined;
    
    if (!hasChanges && !hasContactChanges) {
      setCompanyServerError("No changes detected");
      return;
    }
    
    // Update company if there are changes
    if (hasChanges) {
      await updateCompanyMutation.mutateAsync({ id: currentCompany.id, patch });
    }
    
    // Assign contacts if contactIds changed
    if (hasContactChanges) {
      try {
        await optimizedApiClient.post(
          companyEndpoints.assignContacts(currentCompany.id),
          companyFormValue.contactIds || []
        );
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Could not assign contacts";
        setCompanyServerError(message);
        toast.showError(message);
        return;
      }
    }
  };

  return (
    <>
      <main className="flex min-h-[calc(100vh-80px)] w-full flex-col gap-6 bg-theme-dark px-3 py-3 pt-16 sm:gap-6 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-theme-light sm:text-2xl">Customers</h1>
          <p className="text-xs text-gray-400 sm:text-sm">
            View and manage all customers (contacts and companies).
          </p>
        </header>

        <div className="flex flex-col gap-6">
          {/* Contacts Section */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-theme-light">Contact Customers</h2>
              <span className="text-sm text-gray-400">
                {contacts?.length ?? 0} {contacts?.length === 1 ? "contact" : "contacts"}
              </span>
            </div>
            {showSkeleton ? (
              <ContactsTableSkeleton />
            ) : (
              <ContactsTable
                contacts={contacts ?? []}
                isLoading={false}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
              />
            )}
          </section>

          {/* Companies Section */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-theme-light">Company Customers</h2>
              <span className="text-sm text-gray-400">
                {companies?.length ?? 0} {companies?.length === 1 ? "company" : "companies"}
              </span>
            </div>
            {showSkeleton ? (
              <CompaniesTableSkeleton />
            ) : (
              <CompaniesTable
                companies={companies ?? []}
                isLoading={false}
                onEdit={handleEditCompany}
                onDelete={handleDeleteCompany}
              />
            )}
          </section>
        </div>
      </main>

      {/* Contact Edit Modal */}
      <Modal
        isOpen={contactModalOpen}
        title="Edit Contact"
        onClose={handleCloseContactModal}
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleCloseContactModal}
              disabled={updateContactMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleContactSubmit}
              disabled={updateContactMutation.isPending}
            >
              {updateContactMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      >
        {contactServerError && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {contactServerError}
          </div>
        )}
        <ContactForm
          value={contactFormValue}
          onChange={setContactFormValue}
          disabled={updateContactMutation.isPending}
          companies={companies ?? []}
        />
      </Modal>

      {/* Company Edit Modal */}
      <Modal
        isOpen={companyModalOpen}
        title="Edit Company"
        onClose={handleCloseCompanyModal}
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={handleCloseCompanyModal}
              disabled={updateCompanyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCompanySubmit}
              disabled={updateCompanyMutation.isPending}
            >
              {updateCompanyMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      >
        {companyServerError && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {companyServerError}
          </div>
        )}
        <CompanyForm
          value={companyFormValue}
          onChange={setCompanyFormValue}
          disabled={updateCompanyMutation.isPending}
          services={services}
          contacts={contacts ?? []}
        />
      </Modal>
    </>
  );
}
