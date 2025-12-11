"use client";

import { useState } from "react";
import type { CompanyFormValue } from "../../molecules/CompanyForm";

export interface UseCompanyContactModalOptions {
  setCreateFormValue: (value: CompanyFormValue | ((prev: CompanyFormValue) => CompanyFormValue)) => void;
  setEditFormValue: (value: CompanyFormValue | ((prev: CompanyFormValue) => CompanyFormValue)) => void;
}

export interface UseCompanyContactModalResult {
  isOpen: boolean;
  open: (mode: 'create' | 'edit') => void;
  close: () => void;
  onContactCreated: (contactId: number) => void;
  mode: 'create' | 'edit' | null;
}


export function useCompanyContactModal({
  setCreateFormValue,
  setEditFormValue,
}: UseCompanyContactModalOptions): UseCompanyContactModalResult {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit' | null>(null);

  const open = (modalMode: 'create' | 'edit') => {
    setMode(modalMode);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setMode(null);
  };

  const onContactCreated = (contactId: number) => {
    if (mode === 'create') {
      setCreateFormValue((prev) => ({
        ...prev,
        contactIds: [...prev.contactIds, contactId],
      }));
    } else if (mode === 'edit') {
      setEditFormValue((prev) => ({
        ...prev,
        contactIds: [...prev.contactIds, contactId],
      }));
    }
    close();
  };

  return {
    isOpen,
    open,
    close,
    onContactCreated,
    mode,
  };
}
