"use client";

import { useEntityCrud } from "@/shared/presentation";
import { projectsKeys } from "@/project/application";
import type { Project, ProjectPatch } from "@/project/domain";
import {
  deleteProjectAction,
  updateProjectAction,
} from "../../../actions/projectActions";

export function useProjectsMutations() {
  const { updateMutation, removeMutation } = useEntityCrud<
    Project,
    never,
    ProjectPatch,
    number
  >({
    entityLabel: "Project",
    keys: projectsKeys,
    optimistic: true,
    actions: {
      update: (id, patch) => updateProjectAction(id, patch),
      remove: (id) => deleteProjectAction(id),
    },
  });

  return {
    updateMutation,
    deleteMutation: removeMutation,
  };
}
