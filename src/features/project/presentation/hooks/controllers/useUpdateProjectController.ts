"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useProjectsApp } from "@/di";
import { projectsKeys, updateProject } from "@/project/application";
import type { Project, ProjectPatch } from "@/project/domain";
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

type UseUpdateProjectControllerOptions = {
  project: Project | null;
  onUpdated?: (project: Project) => void;
};

export function useUpdateProjectController({ project, onUpdated }: UseUpdateProjectControllerOptions) {
  const ctx = useProjectsApp();
  const queryClient = useQueryClient();

  const controller = useFormController<ProjectFormData, Project>({
    initialForm: {
      invoiceAmount: project?.invoiceAmount,
      payments: project?.payments,
      projectProgressStatus: project?.projectProgressStatus,
      invoiceStatus: project?.invoiceStatus,
      quickbooks: project?.quickbooks,
      overview: project?.overview,
      notes: project?.notes,
      leadId: project?.leadId,
    },
    validate: (form) => {
      return !!form.leadId && !!project;
    },
    onSubmit: async (form) => {
      if (!project) {
        throw new Error("No project to update");
      }
      
      const patch: ProjectPatch = {
        invoiceAmount: form.invoiceAmount,
        payments: form.payments,
        projectProgressStatus: form.projectProgressStatus as any,
        invoiceStatus: form.invoiceStatus as any,
        quickbooks: form.quickbooks,
        overview: form.overview,
        notes: form.notes,
        leadId: form.leadId,
      };

      const updatedProject = await updateProject(ctx, project.id, patch);
      
      // Update local state optimistically
      queryClient.setQueryData<Project[]>(projectsKeys.list(), (old) => {
        if (!old) return old;
        return old.map((p) => (p.id === updatedProject.id ? updatedProject : p));
      });
      
      return updatedProject;
    },
    invalidateKeys: [projectsKeys.all],
    onSuccess: onUpdated,
  });

  useEffect(() => {
    if (project) {
      controller.setForm({
        invoiceAmount: project.invoiceAmount,
        payments: project.payments,
        projectProgressStatus: project.projectProgressStatus,
        invoiceStatus: project.invoiceStatus,
        quickbooks: project.quickbooks,
        overview: project.overview,
        notes: project.notes,
        leadId: project.leadId,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  return controller;
}



