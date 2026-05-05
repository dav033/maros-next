"use client";

import { useFormController } from "@/common/hooks";
import { useProjectsApp } from "@/di";
import { projectsKeys, createProject } from "@/project/application";
import type { Project, ProjectDraft } from "@/project/domain";


type ProjectFormData = {
  projectProgressStatus?: string;
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
      projectProgressStatus: undefined,
      overview: undefined,
      leadId: undefined,
    },
    validate: (form) => {
      return !!form.leadId;
    },
    onSubmit: async (form) => {
      const draft: ProjectDraft = {
        projectProgressStatus: form.projectProgressStatus as any,
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



