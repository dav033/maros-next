"use client";

import * as React from "react";
import { useMemo } from "react";
import type { Contact, ContactDraft, ContactPatch } from "@/contact/domain";
import {
  contactsKeys,
  createContact,
  patchContact,
} from "@/contact/application";
import {
  toContactDraft,
  toContactPatch,
  toContactFormValue,
} from "../../domain/mappers";
import { useContactsApp } from "@/di";
import { useTableWithSearch } from "@/shared/hooks";
import { useCrudPage } from "@/shared/ui";
import type { ContactFormValue } from "../../domain/mappers";
import { useInstantContacts } from "./useInstantContacts";
import { contactsSearchConfig } from "../search/contactsSearchConfig";
import { useInstantCompanies } from "@/features/company/presentation/hooks/useInstantCompanies";
import { useCompanyServices } from "@/features/company/presentation/hooks/useCompanyServices";
import { initialCompanyFormValue, toDraft as toCompanyDraft } from "@/features/company/presentation/helpers/companyFormHelpers";
import type { CompanyFormValue } from "@/features/company/presentation/molecules/CompanyForm";
import { useCompanyMutations } from "@/features/company/presentation/hooks/useCompanyMutations";

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

export interface UseContactsPageLogicReturn {
  // Contact CRUD
  crud: ReturnType<typeof useCrudPage<Contact, ContactFormValue, ContactDraft, ContactPatch>>;
  
  // Data
  contacts: Contact[] | undefined;
  filteredContacts: Contact[];
  companies: ReturnType<typeof useInstantCompanies>["companies"];
  services: ReturnType<typeof useCompanyServices>["services"];
  
  // Search
  searchQuery: string;
  searchField: string;
  setSearchQuery: (query: string) => void;
  setSearchField: (field: string) => void;
  totalCount: number;
  filteredCount: number;
  
  // Loading
  showSkeleton: boolean;
  
  // Nested company modal
  isCompanyModalOpen: boolean;
  companyFormValue: CompanyFormValue;
  companyServerError: string | null;
  isCompanySubmitting: boolean;
  openCompanyModal: () => void;
  closeCompanyModal: () => void;
  handleCompanyFormChange: (value: CompanyFormValue) => void;
  handleCompanySubmit: () => Promise<void>;
}

/**
 * Custom hook that encapsulates all business logic for ContactsPage.
 * 
 * Separates concerns:
 * - Contact CRUD operations
 * - Search and filtering
 * - Nested company creation modal
 * - Data fetching and state management
 * 
 * This allows the page component to be a pure presentational component.
 */
export function useContactsPageLogic(): UseContactsPageLogicReturn {
  const app = useContactsApp();
  const { companies } = useInstantCompanies();
  const { services } = useCompanyServices();
  const { createMutation: createCompanyMutation } = useCompanyMutations();

  // Company modal state
  const [isCompanyModalOpen, setIsCompanyModalOpen] = React.useState(false);
  const [companyFormValue, setCompanyFormValue] = React.useState<CompanyFormValue>(initialCompanyFormValue);
  const [companyServerError, setCompanyServerError] = React.useState<string | null>(null);

  // Contacts data
  const { contacts, showSkeleton } = useInstantContacts();

  // Search and filtering with useTableWithSearch
  const {
    filteredData: filteredContacts,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
  } = useTableWithSearch<Contact>({
    data: contacts ?? [],
    searchableFields: contactsSearchConfig.fields.map(f => f.key),
    defaultSearchField: contactsSearchConfig.defaultField,
    normalize: contactsSearchConfig.normalize,
  });

  // Contact CRUD operations
  const crud = useCrudPage<Contact, ContactFormValue, ContactDraft, ContactPatch>({
    queryKey: [contactsKeys.list, ["customers"]],
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

  // Company modal handlers
  const openCompanyModal = React.useCallback(() => {
    setCompanyFormValue(initialCompanyFormValue);
    setCompanyServerError(null);
    setIsCompanyModalOpen(true);
  }, []);

  const closeCompanyModal = React.useCallback(() => {
    if (createCompanyMutation.isPending) return;
    setIsCompanyModalOpen(false);
    setCompanyServerError(null);
    setCompanyFormValue(initialCompanyFormValue);
  }, [createCompanyMutation.isPending]);

  const handleCompanyFormChange = React.useCallback((value: CompanyFormValue) => {
    setCompanyFormValue(value);
  }, []);

  const handleCompanySubmit = React.useCallback(async () => {
    const draft = toCompanyDraft(companyFormValue);
    
    if (!draft.name) {
      setCompanyServerError("Name is required");
      return;
    }
    
    try {
      const created = await createCompanyMutation.mutateAsync({ draft });
      
      // Auto-assign the newly created company to the contact form
      crud.handleFormChange({ 
        ...crud.formValue, 
        companyId: (created as any).id 
      });
      
      setIsCompanyModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create company";
      setCompanyServerError(message);
    }
  }, [companyFormValue, createCompanyMutation, crud]);

  return {
    // Contact CRUD
    crud,
    
    // Data
    contacts,
    filteredContacts,
    companies,
    services,
    
    // Search
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
    
    // Loading
    showSkeleton,
    
    // Nested company modal
    isCompanyModalOpen,
    companyFormValue,
    companyServerError,
    isCompanySubmitting: createCompanyMutation.isPending,
    openCompanyModal,
    closeCompanyModal,
    handleCompanyFormChange,
    handleCompanySubmit,
  };
}
