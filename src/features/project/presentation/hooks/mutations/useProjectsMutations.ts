"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project, ProjectPatch } from "@/project/domain";
import { updateProject, deleteProject, projectsKeys } from "@/project/application";
import { useProjectsApp } from "@/di";
import { useToast } from "@dav033/dav-components";

export function useProjectsMutations() {
  const projectsApp = useProjectsApp();
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; patch: ProjectPatch }) =>
      updateProject(projectsApp, input.id, input.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      toast.showSuccess("Project updated successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not update project";
      toast.showError(message);
      throw error;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProject(projectsApp, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      toast.showSuccess("Project deleted successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not delete project";
      toast.showError(message);
      throw error;
    },
  });

  return {
    updateMutation,
    deleteMutation,
  };
}



