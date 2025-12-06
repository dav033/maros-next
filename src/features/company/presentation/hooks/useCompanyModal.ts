"use client";

import { useState } from "react";
import type { Company } from "../../domain/models";
import type { CompanyFormValue } from "../molecules/CompanyForm";
import type { Contact } from "@/contact";
import { initialCompanyFormValue } from "../helpers/companyFormHelpers";

export function useCompanyModal() {
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [companyFormValue, setCompanyFormValue] = useState<CompanyFormValue>(initialCompanyFormValue);
  const [companyServerError, setCompanyServerError] = useState<string | null>(null);

  const handleEditCompany = (company: Company, contacts: Contact[]) => {
    setCurrentCompany(company);
    const companyContactIds = (contacts ?? [])
      .filter((contact) => contact.companyId === company.id)
      .map((contact) => contact.id)
      .filter((id): id is number => typeof id === "number");
    
    setCompanyFormValue({
      name: company.name,
      address: company.address ?? "",
      type: company.type,
      serviceId: company.serviceId ?? null,
      isCustomer: company.isCustomer,
      isClient: company.isClient,
      contactIds: companyContactIds,
      notes: company.notes ?? [],
    });
    setCompanyServerError(null);
    setCompanyModalOpen(true);
  };

  const handleCloseCompanyModal = (isPending: boolean) => {
    if (isPending) {
      return;
    }
    setCompanyModalOpen(false);
    setCurrentCompany(null);
    setCompanyServerError(null);
    setCompanyFormValue(initialCompanyFormValue);
  };

  const resetCompanyModal = () => {
    setCompanyModalOpen(false);
    setCurrentCompany(null);
    setCompanyServerError(null);
    setCompanyFormValue(initialCompanyFormValue);
  };

  return {
    companyModalOpen,
    currentCompany,
    companyFormValue,
    companyServerError,
    setCompanyFormValue,
    setCompanyServerError,
    handleEditCompany,
    handleCloseCompanyModal,
    resetCompanyModal,
  };
}
