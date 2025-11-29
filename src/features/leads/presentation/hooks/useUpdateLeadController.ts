"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useLeadsApp } from "@/di";
import { leadsKeys, patchLead } from "@/leads";
import type { Lead, LeadPatch } from "@/leads";

type LeadEditFormData = {
  leadName: string;
  projectTypeId?: number;
  contactId?: number;
  location: string;
  leadNumber?: string;
};

type UseUpdateLeadControllerOptions = {
  lead: Lead | null;
  onUpdated?: (lead: Lead) => void;
};

export function useUpdateLeadController({ lead, onUpdated }: UseUpdateLeadControllerOptions) {
  const ctx = useLeadsApp();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<LeadEditFormData>({
    leadName: lead?.name ?? "",
    location: lead?.location ?? "",
    projectTypeId: lead?.projectType?.id,
    contactId: lead?.contact?.id,
    leadNumber: lead?.leadNumber ?? "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setForm({
        leadName: lead.name,
        location: lead.location ?? "",
        projectTypeId: lead.projectType?.id,
        contactId: lead.contact?.id,
        leadNumber: lead.leadNumber ?? "",
      });
    }
  }, [lead]);

  const canSubmit = useMemo(() => {
    const nameOk = form.leadName.trim().length > 0;
    const projectOk = !!form.projectTypeId;
    const contactOk = !!form.contactId;
    return nameOk && projectOk && contactOk;
  }, [form]);

  const setField = useCallback(<K extends keyof LeadEditFormData>(key: K, value: LeadEditFormData[K]) => {
    setError(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    if (!canSubmit || isLoading || !lead) return false;
    setIsLoading(true);
    setError(null);

    try {
      const patch: LeadPatch = {
        name: form.leadName.trim() !== lead.name ? form.leadName.trim() : undefined,
        location: form.location.trim() !== lead.location ? form.location.trim() : undefined,
        projectTypeId: form.projectTypeId !== lead.projectType?.id ? form.projectTypeId : undefined,
        contactId: form.contactId !== lead.contact?.id ? form.contactId : undefined,
        leadNumber: form.leadNumber?.trim() !== lead.leadNumber 
          ? (form.leadNumber?.trim() || null) 
          : undefined,
      };

      // Remove undefined values
      const cleanPatch = Object.fromEntries(
        Object.entries(patch).filter(([_, v]) => v !== undefined)
      ) as LeadPatch;

      if (Object.keys(cleanPatch).length === 0) {
        setError("No changes detected");
        setIsLoading(false);
        return false;
      }

      const updated = await patchLead(ctx, lead.id, cleanPatch, {});

      queryClient.invalidateQueries({ queryKey: leadsKeys.all });

      onUpdated?.(updated);
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [canSubmit, isLoading, form, lead, ctx, queryClient, onUpdated]);

  return {
    form,
    setField,
    isLoading,
    error,
    setError,
    canSubmit,
    submit,
  };
}
