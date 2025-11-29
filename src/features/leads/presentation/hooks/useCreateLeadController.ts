"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useLeadsApp } from "@/di";
import { leadsKeys, createLead } from "@/leads";
import type { Lead, LeadType } from "@/leads";
import { contactsKeys } from "@/contact";

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
  const queryClient = useQueryClient();

  const [form, setForm] = useState<LeadFormData>({
    leadNumber: "",
    leadName: "",
    location: "",
    projectTypeId: undefined,
    contactId: undefined,
    customerName: "",
    contactName: "",
    phone: "",
    email: "",
  });

  const [contactMode, setContactMode] = useState<ContactMode>(ContactMode.NEW_CONTACT);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const locationOk = form.location.trim().length > 0;
    const projectOk = !!form.projectTypeId;
    if (contactMode === ContactMode.NEW_CONTACT) {
      const contactNameOk = (form.contactName ?? "").trim().length > 0;
      return locationOk && projectOk && contactNameOk;
    }
    return locationOk && projectOk && !!form.contactId;
  }, [form, contactMode]);

  const setField = useCallback(<K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) => {
    setError(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleContactModeChange = useCallback((mode: ContactMode) => {
    setContactMode(mode);
    setError(null);
  }, []);

  const submit = useCallback(async () => {
    if (!canSubmit || isLoading) return false;
    setIsLoading(true);
    setError(null);

    try {
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

      const created = await createLead(ctx, input, {
        checkNumberAvailability: true,
        policies: {},
      });

      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: leadsKeys.all });

      onCreated?.(created);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [canSubmit, isLoading, form, contactMode, leadType, ctx, queryClient, onCreated]);

  return {
    form,
    setField,
    contactMode,
    setContactMode: handleContactModeChange,
    isLoading,
    error,
    setError,
    canSubmit,
    submit,
    ContactMode,
  };
}
