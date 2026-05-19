"use client";

import { useState } from "react";
import type { LeadType } from "@/leads/domain";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LEAD_TYPE_CONFIGS } from "../../config/leadTypeConfigs";
import {
  useLeadCreateModal,
  useLeadEditModal,
  useLeadViewContactModal,
  useLeadsData,
  useLeadsMutations,
  useLeadsNotesLogic,
  useLeadsTableLogic,
  type UseLeadsDataReturn,
  type UseLeadsTableLogicReturn,
} from "../hooks";
import type { Lead } from "@/leads/domain";
import { useProjectsApp } from "@/di";
import { createProject } from "@/project/application";

export interface UseLeadsPageLogicOptions {
  leadType: LeadType;
}

export interface UseLeadsPageLogicReturn {
  config: typeof LEAD_TYPE_CONFIGS[LeadType];
  data: UseLeadsDataReturn;
  crud: {
    isCreateModalOpen: boolean;
    openCreateModal: () => void;
    closeCreateModal: () => void;
    createController: ReturnType<typeof useLeadCreateModal>["createController"];
    isEditModalOpen: boolean;
    selectedLead: Lead | null;
    openEditModal: (lead: Lead) => void;
    closeEditModal: () => void;
    updateController: ReturnType<typeof useLeadEditModal>["updateController"];
  };
  table: UseLeadsTableLogicReturn;
  notesModal: {
    isOpen: boolean;
    title: string;
    notes: string[];
    onChangeNotes: (notes: string[]) => void;
    onClose: () => void;
    onSave: () => Promise<void>;
    loading: boolean;
  };
  viewContactModal: {
    isOpen: boolean;
    contact: ReturnType<typeof useLeadViewContactModal>["contact"];
    close: () => void;
  };
  convertProjectModal: {
    isOpen: boolean;
    leadToConvert: Lead | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    loading: boolean;
  };
}

import type { LeadsPageData } from "../data/loadLeadsData";

export interface UseLeadsPageLogicOptions {
  leadType: LeadType;
  initialData?: LeadsPageData;
}

export function useLeadsPageLogic({
  leadType,
  initialData,
}: UseLeadsPageLogicOptions): UseLeadsPageLogicReturn {
  const router = useRouter();
  const projectsApp = useProjectsApp();
  const config = LEAD_TYPE_CONFIGS[leadType];

  // 1) Datos
  const data = useLeadsData(leadType, initialData);

  // 2) Modales CRUD
  const createModal = useLeadCreateModal({
    leadType,
    onCreated: async () => {
      await data.refetch();
    },
  });
  const editModal = useLeadEditModal({
    leadType,
    onUpdated: async () => {
      await data.refetch();
    },
  });

  // 3) Negocio
  const { deleteMutation } = useLeadsMutations();
  const notesLogic = useLeadsNotesLogic({ leadType });
  const viewContactModal = useLeadViewContactModal();
  const [leadToConvert, setLeadToConvert] = useState<Lead | null>(null);
  const [isConvertingProject, setIsConvertingProject] = useState(false);

  const handleConvertToProject = (lead: Lead) => {
    if (lead.project?.id) {
      router.push(`/project/${lead.project.id}`);
      return;
    }

    setLeadToConvert(lead);
  };

  const closeConvertProjectModal = () => {
    if (!isConvertingProject) {
      setLeadToConvert(null);
    }
  };

  const confirmConvertToProject = async () => {
    if (!leadToConvert) return;

    setIsConvertingProject(true);
    try {
      const created = await createProject(projectsApp, { leadId: leadToConvert.id });
      toast.success("Lead converted to project successfully!");
      setLeadToConvert(null);
      router.push(`/project/${created.id}`);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not convert lead to project";
      toast.error(message);
    } finally {
      setIsConvertingProject(false);
    }
  };

  // 4) Tabla (búsqueda, filtrado e interacciones)
  const table = useLeadsTableLogic({
    leads: data.leads,
    onEdit: editModal.open,
    onDelete: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
    onViewContact: viewContactModal.open,
    onOpenNotesModal: notesLogic.openFromLead,
    onConvertToProject: handleConvertToProject,
  });

  return {
    config,
    data,
    crud: {
      isCreateModalOpen: createModal.isOpen,
      openCreateModal: createModal.open,
      closeCreateModal: createModal.close,
      createController: createModal.createController,
      isEditModalOpen: editModal.isOpen,
      selectedLead: editModal.selectedLead,
      openEditModal: editModal.open,
      closeEditModal: editModal.close,
      updateController: editModal.updateController,
    },
    table,
    notesModal: notesLogic.modalProps,
    viewContactModal: {
      isOpen: viewContactModal.isOpen,
      contact: viewContactModal.contact,
      close: viewContactModal.close,
    },
    convertProjectModal: {
      isOpen: !!leadToConvert,
      leadToConvert,
      onClose: closeConvertProjectModal,
      onConfirm: confirmConvertToProject,
      loading: isConvertingProject,
    },
  };
}
