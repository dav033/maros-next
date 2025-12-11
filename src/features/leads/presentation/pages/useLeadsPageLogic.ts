"use client";

import type { LeadType } from "@/leads/domain";
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
}

export function useLeadsPageLogic({
  leadType,
}: UseLeadsPageLogicOptions): UseLeadsPageLogicReturn {
  const config = LEAD_TYPE_CONFIGS[leadType];

  // 1) Datos
  const data = useLeadsData(leadType);

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

  // 4) Tabla (búsqueda, filtrado e interacciones)
  const table = useLeadsTableLogic({
    leads: data.leads,
    onEdit: editModal.open,
    onDelete: async (id) => {
      await deleteMutation.mutateAsync(id);
      await data.refetch();
    },
    onViewContact: viewContactModal.open,
    onOpenNotesModal: notesLogic.openFromLead,
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
  };
}
