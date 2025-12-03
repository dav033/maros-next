"use client";

import { useState } from "react";
import { useInstantCompanies } from "./useInstantCompanies";
import { useCompanyServices } from "./useCompanyServices";
import { useInstantContacts } from "@/features/contact/presentation/hooks/useInstantContacts";
import { useCompanyCreateModal } from "./useCompanyCreateModal";
import { useCompanyEditModal } from "./useCompanyEditModal";
import { useManageServicesModal } from "./useManageServicesModal";
import { useCompanyContactModal } from "./useCompanyContactModal";
import { useCompanyMutations } from "./useCompanyMutations";
import type { ContactFormValue } from "@/features/contact/domain/mappers";
import { useContactsApp } from "@/di";
import { createContact, toContactDraft, contactsKeys } from "@/contact";
import { useQueryClient } from "@tanstack/react-query";

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

export interface UseCompaniesPageLogicReturn {
  // Data
  companies: ReturnType<typeof useInstantCompanies>["companies"];
  contacts: ReturnType<typeof useInstantContacts>["contacts"];
  services: ReturnType<typeof useCompanyServices>["services"];
  showSkeleton: boolean;
  
  // Company modals
  createModal: ReturnType<typeof useCompanyCreateModal>;
  editModal: ReturnType<typeof useCompanyEditModal>;
  servicesModal: ReturnType<typeof useManageServicesModal>;
  contactModal: ReturnType<typeof useCompanyContactModal>;
  
  // Contact creation within company modal
  contactFormValue: ContactFormValue;
  isContactSubmitting: boolean;
  contactError: string | null;
  handleContactFormChange: (value: ContactFormValue) => void;
  handleContactSubmit: () => Promise<void>;
  handleContactModalClose: () => void;
  
  // Actions
  handleDelete: () => void;
}

/**
 * Custom hook that encapsulates all business logic for CompaniesPage.
 * 
 * Manages:
 * - Company CRUD operations via specialized hooks
 * - Nested contact creation modal
 * - Services management
 * - Data fetching and coordination
 * 
 * This allows the page component to be a pure presentational component.
 */
export function useCompaniesPageLogic(): UseCompaniesPageLogicReturn {
  const { companies, showSkeleton } = useInstantCompanies();
  const { services } = useCompanyServices();
  const { contacts } = useInstantContacts();
  const contactsApp = useContactsApp();
  const queryClient = useQueryClient();
  const { invalidateQueries } = useCompanyMutations();

  // Specialized modal hooks
  const createModal = useCompanyCreateModal();
  const editModal = useCompanyEditModal({ contacts: contacts ?? [] });
  const servicesModal = useManageServicesModal();
  const contactModal = useCompanyContactModal({
    setCreateFormValue: createModal.setFormValue,
    setEditFormValue: editModal.setFormValue,
  });

  // Contact creation form state
  const [contactFormValue, setContactFormValue] = useState<ContactFormValue>(initialContactFormValue);
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleContactFormChange = (value: ContactFormValue) => {
    setContactFormValue(value);
  };

  const handleContactSubmit = async () => {
    if (!contactFormValue.name.trim()) {
      setContactError("Contact name is required");
      return;
    }

    setIsContactSubmitting(true);
    setContactError(null);

    try {
      const draft = toContactDraft(contactFormValue);
      const newContact = await createContact(contactsApp, draft);
      
      await queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      
      contactModal.onContactCreated(newContact.id);
      setContactFormValue(initialContactFormValue);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create contact";
      setContactError(message);
    } finally {
      setIsContactSubmitting(false);
    }
  };

  const handleContactModalClose = () => {
    setContactFormValue(initialContactFormValue);
    setContactError(null);
    contactModal.close();
  };

  const handleDelete = () => {
    invalidateQueries();
  };

  return {
    // Data
    companies,
    contacts,
    services,
    showSkeleton,
    
    // Company modals
    createModal,
    editModal,
    servicesModal,
    contactModal,
    
    // Contact creation
    contactFormValue,
    isContactSubmitting,
    contactError,
    handleContactFormChange,
    handleContactSubmit,
    handleContactModalClose,
    
    // Actions
    handleDelete,
  };
}
