"use client";

import {
  useProjectCreateModal,
  useProjectEditModal,
  useProjectsData,
  useProjectsMutations,
  useProjectsTableLogic,
  useProjectsNotesLogic,
  usePaymentsModal,
  type UseProjectsDataReturn,
  type UseProjectsTableLogicReturn,
} from "../hooks";
import type { Project } from "@/project/domain";

export interface UseProjectsPageLogicReturn {
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
  paymentsModal: ReturnType<typeof usePaymentsModal>;
}

export function useProjectsPageLogic(): UseProjectsPageLogicReturn {
  // 1) Datos
  const data = useProjectsData();

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

  // 3) Notes y Payments modals
  const notesLogic = useProjectsNotesLogic();
  const paymentsModal = usePaymentsModal({
    onUpdated: async () => {
      await data.refetch();
    },
  });

  // 4) Negocio
  const { deleteMutation } = useProjectsMutations();

  // 5) Tabla (búsqueda, filtrado e interacciones)
  const table = useProjectsTableLogic({
    projects: data.projects,
    onEdit: editModal.open,
    onDelete: async (id) => {
      await deleteMutation.mutateAsync(id);
      await data.refetch();
    },
    onOpenNotesModal: notesLogic.openFromProject,
    onOpenPaymentsModal: paymentsModal.open,
  });

  return {
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
    paymentsModal,
  };
}



