"use client";

import { useEffect } from "react";
import { useLeadsApp } from "@/di";
import { leadsKeys, patchLead } from "@/leads";
import type { Lead, LeadPatch } from "@/leads";
import { useFormController } from "@/shared/ui";

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

  const controller = useFormController<LeadEditFormData, Lead>({
    initialForm: {
      leadName: lead?.name ?? "",
      location: lead?.location ?? "",
      projectTypeId: lead?.projectType?.id,
      contactId: lead?.contact?.id,
      leadNumber: lead?.leadNumber ?? "",
    },
    validate: (form) => {
      const nameOk = form.leadName.trim().length > 0;
      const projectOk = !!form.projectTypeId;
      const contactOk = !!form.contactId;
      return nameOk && projectOk && contactOk;
    },
    transformBeforeSubmit: (form) => {
      if (!lead) return null;
      
      const patch: LeadPatch = {
        name: form.leadName.trim() !== lead.name ? form.leadName.trim() : undefined,
        location: form.location.trim() !== lead.location ? form.location.trim() : undefined,
        projectTypeId: form.projectTypeId !== lead.projectType?.id ? form.projectTypeId : undefined,
        contactId: form.contactId !== lead.contact?.id ? form.contactId : undefined,
        leadNumber: form.leadNumber?.trim() !== lead.leadNumber 
          ? (form.leadNumber?.trim() || null) 
          : undefined,
      };

      const cleanPatch = Object.fromEntries(
        Object.entries(patch).filter(([_, v]) => v !== undefined)
      ) as LeadPatch;

      return Object.keys(cleanPatch).length === 0 ? null : (cleanPatch as any);
    },
    onSubmit: async (patch) => {
      if (!lead) throw new Error("No lead to update");
      return await patchLead(ctx, lead.id, patch as LeadPatch, {});
    },
    invalidateKeys: [leadsKeys.all],
    onSuccess: onUpdated,
  });

  useEffect(() => {
    if (lead) {
      controller.setForm({
        leadName: lead.name,
        location: lead.location ?? "",
        projectTypeId: lead.projectType?.id,
        contactId: lead.contact?.id,
        leadNumber: lead.leadNumber ?? "",
      });
    }
  }, [lead]);

  return controller;
}
