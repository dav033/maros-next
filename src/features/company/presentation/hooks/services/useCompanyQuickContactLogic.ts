// useCompanyQuickContactLogic.ts
"use client";

import { useState } from "react";
import { useContactsApp } from "@/di";
import { useQueryClient } from "@tanstack/react-query";
import { createContact, contactsKeys } from "@/contact/application";
import {
  toContactDraft,
  type ContactFormValue,
} from "@/features/contact/domain/mappers";


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

interface UseCompanyQuickContactLogicProps {
  contactModal: any;
}

export interface UseCompanyQuickContactLogicReturn {
  formValue: ContactFormValue;
  isSubmitting: boolean;
  error: string | null;
  handleChange: (value: ContactFormValue) => void;
  handleSubmit: () => Promise<void>;
  handleClose: () => void;
}

export function useCompanyQuickContactLogic(
  props: UseCompanyQuickContactLogicProps
): UseCompanyQuickContactLogicReturn {
  const { contactModal } = props;
  const contactsApp = useContactsApp();
  const queryClient = useQueryClient();

  const [formValue, setFormValue] = useState<ContactFormValue>(
    initialContactFormValue
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (value: ContactFormValue) => {
    setFormValue(value);
  };

  const handleSubmit = async () => {
    if (!formValue.name.trim()) {
      setError("Contact name is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const draft = toContactDraft(formValue);
      const newContact = await createContact(contactsApp, draft);

      await queryClient.invalidateQueries({ queryKey: contactsKeys.list });

      if (typeof newContact.id === "number") {
        contactModal.onContactCreated(newContact.id);
      }

      setFormValue(initialContactFormValue);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not create contact";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormValue(initialContactFormValue);
    setError(null);
    contactModal.close();
  };

  return {
    formValue,
    isSubmitting,
    error,
    handleChange,
    handleSubmit,
    handleClose,
  };
}
