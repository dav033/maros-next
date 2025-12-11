"use client";

import { useState } from "react";
import type { Contact } from "@/contact/domain";

export interface UseLeadViewContactModalReturn {
  isOpen: boolean;
  contact: Contact | null;
  open: (contact: Contact) => void;
  close: () => void;
}

export function useLeadViewContactModal(): UseLeadViewContactModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [contact, setContact] = useState<Contact | null>(null);

  const open = (contact: Contact) => {
    setContact(contact);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setContact(null);
  };

  return {
    isOpen,
    contact,
    open,
    close,
  };
}

