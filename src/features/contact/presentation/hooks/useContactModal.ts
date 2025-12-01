import { useState } from "react";
import type { Contact } from "../../domain/models";
import type { ContactFormValue } from "../../domain/mappers";
import { initialContactFormValue } from "./useContactMutations";

export function useContactModal() {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [currentContact, setCurrentContact] = useState<Contact | null>(null);
  const [contactFormValue, setContactFormValue] = useState<ContactFormValue>(initialContactFormValue);
  const [contactServerError, setContactServerError] = useState<string | null>(null);

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
      companyId: contact.companyId ?? null,
    });
    setContactServerError(null);
    setContactModalOpen(true);
  };

  const handleCloseContactModal = (isPending: boolean) => {
    if (isPending) {
      return;
    }
    setContactModalOpen(false);
    setCurrentContact(null);
    setContactServerError(null);
    setContactFormValue(initialContactFormValue);
  };

  const resetContactModal = () => {
    setContactModalOpen(false);
    setCurrentContact(null);
    setContactServerError(null);
    setContactFormValue(initialContactFormValue);
  };

  return {
    contactModalOpen,
    currentContact,
    contactFormValue,
    contactServerError,
    setContactFormValue,
    setContactServerError,
    handleEditContact,
    handleCloseContactModal,
    resetContactModal,
  };
}
