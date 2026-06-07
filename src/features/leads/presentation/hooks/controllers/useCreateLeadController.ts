"use client";

import { useFormController } from "@/common/hooks";

import { useState, useCallback } from "react";
import { useLeadsApp } from "@/di";
import { leadsKeys, createLead } from "@/leads/application";
import type { Lead, LeadType } from "@/leads/domain";
import { contactsKeys } from "@/contact/application";

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
  companyId?: number | null;
  location: string;
  addressLink?: string | null;
  note?: string;
  contactName?: string;
  phone?: string;
  email?: string;
};

type UseCreateLeadControllerOptions = {
  leadType: LeadType;
  inReview?: boolean;
  onCreated?: (lead: Lead) => void;
};

export function useCreateLeadController({ leadType, inReview, onCreated }: UseCreateLeadControllerOptions) {
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
      companyId: null,
      note: "",
      contactName: "",
      phone: "",
      email: "",
    },
    validate: (form) => {
      void form;
      return true;
    },
    onSubmit: async (form) => {
      const useExistingContact =
        contactMode === ContactMode.EXISTING_CONTACT && !!form.contactId;
      const input = !useExistingContact
        ? {
            leadName: form.leadName.trim() || "",
            leadNumber: form.leadNumber.trim() || null,
            location: form.location.trim(),
            addressLink: form.addressLink || null,
            projectTypeId: form.projectTypeId,
            leadType: form.leadType,
            contact: {
              name: (form.contactName ?? "").trim(),
              phone: (form.phone ?? "").trim(),
              email: (form.email ?? "").trim(),
              ...(typeof form.companyId === "number" && form.companyId > 0
                ? { companyId: form.companyId }
                : {}),
              ...(form.location.trim() ? { address: form.location.trim() } : {}),
              ...(form.addressLink ? { addressLink: form.addressLink.trim() } : {}),
            },
            ...(inReview !== undefined && { inReview }),
          }
        : {
            leadName: form.leadName.trim() || "",
            leadNumber: form.leadNumber.trim() || null,
            location: form.location.trim(),
            addressLink: form.addressLink || null,
            projectTypeId: form.projectTypeId,
            leadType: form.leadType,
            contactId: form.contactId!,
            ...(inReview !== undefined && { inReview }),
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
    if (mode === ContactMode.NEW_CONTACT) {
      controller.setField("contactId", undefined);
      return;
    }

    controller.setField("contactName", "");
    controller.setField("phone", "");
    controller.setField("email", "");
    controller.setField("companyId", null);
  }, [controller]);

  return {
    ...controller,
    contactMode,
    setContactMode: handleContactModeChange,
    ContactMode,
  };
}
