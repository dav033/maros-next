"use client";

import { useState } from "react";
import type { Company } from "@/company/domain";

export interface UseContactViewCompanyModalReturn {
  isOpen: boolean;
  company: Company | null;
  open: (company: Company) => void;
  close: () => void;
}

export function useContactViewCompanyModal(): UseContactViewCompanyModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  const open = (company: Company) => {
    setCompany(company);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setCompany(null);
  };

  return {
    isOpen,
    company,
    open,
    close,
  };
}

