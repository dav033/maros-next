"use client";

import {
  useProjectCreateModal,
  useProjectEditModal,
  useProjectsData,
  useProjectsMutations,
  useProjectsTableLogic,
  useProjectsNotesLogic,
  type UseProjectsDataReturn,
  type UseProjectsTableLogicReturn,
} from "../hooks";
import type { Project } from "@/project/domain";
import { LeadType } from "@/leads/domain";

export interface UseProjectsPageLogicReturn {
  leadType: LeadType;
  data: UseProjectsDataReturn;
  crud: {
    isCreateModalOpen: boolean;
    openCreateModal: () => void;
    closeCreateModal: () => void;
    createController: ReturnType<typeof useProjectCreateModal>["createController"];
    isEditModalOpen: boolean;
    selectedProject: Project | null;
    openEditModal: (project: Project) => void;
    closeEditModal: () => void;
    updateController: ReturnType<typeof useProjectEditModal>["updateController"];
  };
  table: UseProjectsTableLogicReturn;
  notesModal: {
    isOpen: boolean;
    title: string;
    notes: string[];
    onChangeNotes: (notes: string[]) => void;
    onClose: () => void;
    onSave: () => Promise<void>;
    loading: boolean;
  };
  openNotesModal: (project: Project) => void;
}

import type { ProjectsPageData } from "../data/loadProjectsData";

export function useProjectsPageLogic({
  initialData,
  leadType,
}: {
  initialData?: ProjectsPageData;
  leadType: LeadType;
}): UseProjectsPageLogicReturn {
  // 1) Datos
  const data = useProjectsData({ initialData, leadType });

  // 2) Modales CRUD
  const createModal = useProjectCreateModal({
    onCreated: async () => {
      await data.refetch();
    },
  });
  const editModal = useProjectEditModal({
    onUpdated: async () => {
      await data.refetch();
    },
  });

  // 3) Notes modal
  const notesLogic = useProjectsNotesLogic({
    refetch: data.refetch,
  });

  // 4) Negocio
  const { deleteMutation } = useProjectsMutations();

  // 5) Tabla (búsqueda, filtrado e interacciones)
  const table = useProjectsTableLogic({
    projects: data.projects,
    onEdit: editModal.open,
    onDelete: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
    onOpenNotesModal: notesLogic.openFromProject,
  });

  return {
    leadType,
    data,
    crud: {
      isCreateModalOpen: createModal.isOpen,
      openCreateModal: createModal.open,
      closeCreateModal: createModal.close,
      createController: createModal.createController,
      isEditModalOpen: editModal.isOpen,
      selectedProject: editModal.selectedProject,
      openEditModal: editModal.open,
      closeEditModal: editModal.close,
      updateController: editModal.updateController,
    },
    table,
    notesModal: notesLogic.modalProps,
    openNotesModal: notesLogic.openFromProject,
  };
}

