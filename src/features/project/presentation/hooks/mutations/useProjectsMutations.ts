"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ProjectPatch } from "@/project/domain";
import { projectsKeys } from "@/project/application";
import { toast } from "sonner";
import { updateProjectAction, deleteProjectAction } from "../../../actions/projectActions";

export function useProjectsMutations() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (input: { id: number; patch: ProjectPatch }) => {
      const result = await updateProjectAction(input.id, input.patch);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      toast.success("Project updated successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not update project";
      toast.error(message);
      throw error;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const result = await deleteProjectAction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      toast.success("Project deleted successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not delete project";
      toast.error(message);
      throw error;
    },
  });

  return {
    updateMutation,
    deleteMutation,
  };
}

