"use client";

import { useMemo, useState } from "react";
import { ProjectProgressStatus } from "@/project/domain";
import type { Project } from "@/project/domain";
import type { useProjectsMutations } from "../mutations/useProjectsMutations";

export interface UseProjectsBulkActionsProps {
  projects: Project[];
  updateMutation: ReturnType<typeof useProjectsMutations>["updateMutation"];
  deleteMutation: ReturnType<typeof useProjectsMutations>["deleteMutation"];
}

export interface UseProjectsBulkActionsReturn {
  selectedIds: Set<string | number>;
  onSelectionChange: (ids: Set<string | number>) => void;
  selectedCount: number;
  clearSelection: () => void;
  /** No hay política de transición para projects: siempre se ofrecen todos los estados. */
  availableStatuses: ProjectProgressStatus[];
  changeStatus: (status: ProjectProgressStatus) => Promise<void>;
  isChangingStatus: boolean;
  deleteModal: {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    confirm: () => Promise<void>;
    isDeleting: boolean;
  };
}

export function useProjectsBulkActions({
  projects,
  updateMutation,
  deleteMutation,
}: UseProjectsBulkActionsProps): UseProjectsBulkActionsReturn {
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const selectedProjects = useMemo(
    () => projects.filter((project) => selectedIds.has(project.id)),
    [projects, selectedIds],
  );

  const availableStatuses = useMemo(
    () => (selectedProjects.length === 0 ? [] : Object.values(ProjectProgressStatus)),
    [selectedProjects.length],
  );

  const clearSelection = () => setSelectedIds(new Set());

  const changeStatus = async (status: ProjectProgressStatus) => {
    setIsChangingStatus(true);
    try {
      const targets = selectedProjects.filter((p) => p.projectProgressStatus !== status);
      await Promise.allSettled(
        targets.map((project) =>
          updateMutation.mutateAsync({ id: project.id, patch: { projectProgressStatus: status } }),
        ),
      );
      clearSelection();
    } finally {
      setIsChangingStatus(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await Promise.allSettled(
        selectedProjects.map((project) => deleteMutation.mutateAsync(project.id)),
      );
      clearSelection();
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    selectedIds,
    onSelectionChange: setSelectedIds,
    selectedCount: selectedIds.size,
    clearSelection,
    availableStatuses,
    changeStatus,
    isChangingStatus,
    deleteModal: {
      isOpen: isDeleteModalOpen,
      open: () => setIsDeleteModalOpen(true),
      close: () => setIsDeleteModalOpen(false),
      confirm: confirmDelete,
      isDeleting,
    },
  };
}
