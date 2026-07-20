"use client";

import { useRouter } from "next/navigation";
import type { Project, ProjectProgressStatus } from "@/project/domain";
import {
  useProjectsByStatusData,
  useProjectsMutations,
  useProjectsNotesLogic,
  useProjectsTableLogic,
  type UseProjectsByStatusDataReturn,
  type UseProjectsTableLogicReturn,
} from "../hooks";

export interface UseProjectsByStatusPageLogicReturn {
  data: UseProjectsByStatusDataReturn;
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

/** Lógica compartida por las páginas "Projects Completed" y "Projects Lost": mismas
 * tablas/acciones que la lista por tipo, filtradas por un único progressStatus y sin
 * acotar por lead type. */
export function useProjectsByStatusPageLogic(
  status: ProjectProgressStatus,
): UseProjectsByStatusPageLogicReturn {
  const router = useRouter();

  // 1) Datos
  const data = useProjectsByStatusData(status);

  // 2) Negocio
  const { deleteMutation, updateMutation } = useProjectsMutations();
  const notesLogic = useProjectsNotesLogic({ refetch: data.refetch });

  const handleUpdateStatus = async (project: Project, newStatus: ProjectProgressStatus) => {
    try {
      await updateMutation.mutateAsync({ id: project.id, patch: { projectProgressStatus: newStatus } });
    } catch {
      // Error ya manejado por useEntityMutation
    }
  };

  // 3) Tabla (búsqueda e interacciones; sin filtro de progress/invoice, ya viene acotada)
  const table = useProjectsTableLogic({
    projects: data.projects,
    onEdit: (project) => router.push(`/project/${project.id}`),
    onDelete: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
    onOpenNotesModal: notesLogic.openFromProject,
    onUpdateStatus: handleUpdateStatus,
    isUpdatingStatus: (project) =>
      updateMutation.isPending && updateMutation.variables?.id === project.id,
    // Namespace propio: esta página no tiene UI de progressFilter/invoiceFilter, no debe
    // heredar en silencio el filtro que el usuario haya dejado seteado en /projects.
    persistNamespace: "projects-by-status",
  });

  return {
    data,
    table,
    notesModal: notesLogic.modalProps,
    openNotesModal: notesLogic.openFromProject,
  };
}
