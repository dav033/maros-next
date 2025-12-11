"use client";

import { useState } from "react";
import { useProjectsApp } from "@/di";
import { projectsKeys, createProject } from "@/project/application";
import type { Project, ProjectDraft } from "@/project/domain";
import { useFormController } from "@dav033/dav-components";

type ProjectFormData = {
  invoiceAmount?: number;
  payments?: number[];
  projectProgressStatus?: string;
  invoiceStatus?: string;
  quickbooks?: boolean;
  overview?: string;
  notes?: string[];
  leadId?: number;
};

type UseCreateProjectControllerOptions = {
  onCreated?: (project: Project) => void;
};

export function useCreateProjectController({ onCreated }: UseCreateProjectControllerOptions) {
  const ctx = useProjectsApp();

  const controller = useFormController<ProjectFormData, Project>({
    initialForm: {
      invoiceAmount: undefined,
      payments: undefined,
      projectProgressStatus: undefined,
      invoiceStatus: undefined,
      quickbooks: false,
      overview: undefined,
      leadId: undefined,
    },
    validate: (form) => {
      return !!form.leadId;
    },
    onSubmit: async (form) => {
      const draft: ProjectDraft = {
        invoiceAmount: form.invoiceAmount,
        payments: form.payments,
        projectProgressStatus: form.projectProgressStatus as any,
        invoiceStatus: form.invoiceStatus as any,
        quickbooks: form.quickbooks,
        overview: form.overview,
        notes: form.notes,
        leadId: form.leadId!,
      };

      return await createProject(ctx, draft);
    },
    invalidateKeys: [projectsKeys.all],
    onSuccess: onCreated,
  });

  return controller;
}



