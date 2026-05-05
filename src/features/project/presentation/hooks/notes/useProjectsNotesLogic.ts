"use client";

import { useNotesModal } from "@/common/hooks";

import { toast } from "sonner";
import { projectsKeys } from "@/project/application";
import type { Project } from "@/project/domain";
import { useQueryClient } from "@tanstack/react-query";
import { updateProjectNotesAction } from "../../../actions/notesActions";

export interface UseProjectsNotesLogicReturn {
  openFromProject: (project: Project) => void;
  modalProps: {
    isOpen: boolean;
    title: string;
    notes: string[];
    onChangeNotes: (notes: string[]) => void;
    onClose: () => void;
    onSave: () => Promise<void>;
    loading: boolean;
  };
}

export function useProjectsNotesLogic({
  refetch,
}: {
  refetch: () => Promise<void>;
}): UseProjectsNotesLogicReturn {
  const queryClient = useQueryClient();

  const {
    notesModalState,
    openNotesModal,
    closeNotesModal,
    updateNotes,
    saveNotes: saveNotesBase,
  } = useNotesModal<Project>();

  const openFromProject = (project: Project) => {
    const notes = Array.isArray(project.notes) ? project.notes : [];
    openNotesModal(project, project.lead.name, notes);
  };

  const handleSaveNotes = async () => {
    await saveNotesBase(async (project, notes) => {
      if (typeof project.id !== "number") return;
      
      const result = await updateProjectNotesAction(project.id, notes ?? []);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const updated = result.data;

      queryClient.setQueryData<Project[]>(projectsKeys.list(), (oldProjects) => {
        if (!oldProjects) return oldProjects;
        return oldProjects.map((p) => (p.id === project.id ? updated : p));
      });

      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      await refetch();
      toast.success("Notes updated successfully!");
    });
  };

  return {
    openFromProject,
    modalProps: {
      isOpen: notesModalState.isOpen,
      title: notesModalState.title || "",
      notes: notesModalState.notes,
      onChangeNotes: updateNotes,
      onClose: closeNotesModal,
      onSave: handleSaveNotes,
      loading: notesModalState.isLoading,
    },
  };
}

