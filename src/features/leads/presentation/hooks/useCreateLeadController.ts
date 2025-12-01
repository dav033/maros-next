"use client";

import { useState, useCallback } from "react";
import { useLeadsApp } from "@/di";
import { leadsKeys, createLead } from "@/leads";
import type { Lead, LeadType } from "@/leads";
import { contactsKeys } from "@/contact";
import { useFormController } from "@/shared/ui";

enum ContactMode {
  NEW_CONTACT = "NEW_CONTACT",
  EXISTING_CONTACT = "EXISTING_CONTACT",
}

type LeadFormData = {
  leadNumber: string;
  leadName: string;
  projectTypeId?: number;
  contactId?: number;
  location: string;
  status?: string;
  customerName?: string;
  contactName?: string;
  phone?: string;
  email?: string;
};

type UseCreateLeadControllerOptions = {
  leadType: LeadType;
  onCreated?: (lead: Lead) => void;
};

export function useCreateLeadController({ leadType, onCreated }: UseCreateLeadControllerOptions) {
  const ctx = useLeadsApp();
  const [contactMode, setContactMode] = useState<ContactMode>(ContactMode.NEW_CONTACT);

  const controller = useFormController<LeadFormData, Lead>({
    initialForm: {
      leadNumber: "",
      leadName: "",
      location: "",
      projectTypeId: undefined,
      contactId: undefined,
      status: "NOT_EXECUTED",
      customerName: "",
      contactName: "",
      phone: "",
      email: "",
    },
    validate: (form) => {
      const locationOk = form.location.trim().length > 0;
      const projectOk = !!form.projectTypeId;
      if (contactMode === ContactMode.NEW_CONTACT) {
        const contactNameOk = (form.contactName ?? "").trim().length > 0;
        return locationOk && projectOk && contactNameOk;
      }
      return locationOk && projectOk && !!form.contactId;
    },
    onSubmit: async (form) => {
      const input = contactMode === ContactMode.NEW_CONTACT
        ? {
            leadName: form.leadName.trim() || "",
            leadNumber: form.leadNumber.trim() || null,
            location: form.location.trim(),
            projectTypeId: form.projectTypeId!,
            leadType,
            contact: {
              companyName: (form.customerName ?? "").trim() || "N/A",
              name: (form.contactName ?? "").trim(),
              phone: (form.phone ?? "").trim(),
              email: (form.email ?? "").trim(),
            },
          }
        : {
            leadName: form.leadName.trim() || "",
            leadNumber: form.leadNumber.trim() || null,
            location: form.location.trim(),
            projectTypeId: form.projectTypeId!,
            leadType,
            contactId: form.contactId!,
          };

      return await createLead(ctx, input, {
        checkNumberAvailability: true,
        policies: {},
      });
    },
    invalidateKeys: [contactsKeys.lists(), leadsKeys.all],
    onSuccess: onCreated,
  });

  const handleContactModeChange = useCallback((mode: ContactMode) => {
    setContactMode(mode);
    controller.setError(null);
  }, [controller]);

  return {
    ...controller,
    contactMode,
    setContactMode: handleContactModeChange,
    ContactMode,
  };
}
