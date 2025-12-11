"use client";

import { useNotesModal, useToast } from "@dav033/dav-components";
import { useProjectsApp } from "@/di";
import { updateProject, projectsKeys } from "@/project/application";
import type { Project } from "@/project/domain";
import { useQueryClient } from "@tanstack/react-query";
import { useProjectsData } from "../data/useProjectsData";

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

export function useProjectsNotesLogic(): UseProjectsNotesLogicReturn {
  const app = useProjectsApp();
  const queryClient = useQueryClient();
  const toast = useToast();
  const data = useProjectsData();

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
      const updated = await updateProject(app, project.id, { notes: notes ?? [] });

      queryClient.setQueryData<Project[]>(projectsKeys.list(), (oldProjects) => {
        if (!oldProjects) return oldProjects;
        return oldProjects.map((p) => (p.id === project.id ? updated : p));
      });

      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      await data.refetch();
      toast.showSuccess("Notes updated successfully!");
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

