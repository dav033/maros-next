"use client";

import {
  useProjectCreateModal,
  useProjectEditModal,
  useProjectsBulkActions,
  useProjectsData,
  useProjectsMutations,
  useProjectsTableLogic,
  useProjectsNotesLogic,
  type UseProjectsBulkActionsReturn,
  type UseProjectsDataReturn,
  type UseProjectsTableLogicReturn,
} from "../hooks";
import type { Project, ProjectProgressStatus } from "@/project/domain";
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
  bulkActions: UseProjectsBulkActionsReturn;
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
  const { deleteMutation, updateMutation } = useProjectsMutations();

  const handleUpdateStatus = async (project: Project, status: ProjectProgressStatus) => {
    try {
      await updateMutation.mutateAsync({ id: project.id, patch: { projectProgressStatus: status } });
    } catch {
      // Error ya manejado por useEntityMutation
    }
  };

  // 5) Tabla (búsqueda, filtrado e interacciones)
  const table = useProjectsTableLogic({
    projects: data.projects,
    onEdit: editModal.open,
    onDelete: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
    onOpenNotesModal: notesLogic.openFromProject,
    onUpdateStatus: handleUpdateStatus,
    isUpdatingStatus: (project) =>
      updateMutation.isPending && updateMutation.variables?.id === project.id,
  });

  // 6) Selección múltiple y acciones en lote
  const bulkActions = useProjectsBulkActions({
    projects: table.rows,
    updateMutation,
    deleteMutation,
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
    bulkActions,
    notesModal: notesLogic.modalProps,
    openNotesModal: notesLogic.openFromProject,
  };
}

