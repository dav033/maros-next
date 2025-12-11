"use client";

import { useState, useCallback } from "react";
import { useLeadsApp } from "@/di";
import { leadsKeys, createLead } from "@/leads/application";
import type { Lead, LeadType } from "@/leads/domain";
import { contactsKeys } from "@/contact/application";
import { useFormController } from "@dav033/dav-components";

enum ContactMode {
  NEW_CONTACT = "NEW_CONTACT",
  EXISTING_CONTACT = "EXISTING_CONTACT",
}

type LeadFormData = {
  leadNumber: string;
  leadName: string;
  leadType: LeadType;
  projectTypeId?: number;
  contactId?: number;
  location: string;
  addressLink?: string | null;
  status?: string;
  note?: string;
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
      leadType,
      location: "",
      addressLink: null,
      projectTypeId: undefined,
      contactId: undefined,
      status: "NOT_EXECUTED",
      note: "",
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
            addressLink: form.addressLink || null,
            projectTypeId: form.projectTypeId!,
            leadType: form.leadType,
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
            addressLink: form.addressLink || null,
            projectTypeId: form.projectTypeId!,
            leadType: form.leadType,
            contactId: form.contactId!,
          };

      return await createLead(ctx, input, {
        checkNumberAvailability: true,
        policies: {},
      });
    },
    invalidateKeys: [contactsKeys.list, leadsKeys.all],
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
