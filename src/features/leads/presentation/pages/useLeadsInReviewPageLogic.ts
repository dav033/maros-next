"use client";

import { useState, useEffect } from "react";
import {
  useLeadCreateModal,
  useLeadEditModal,
  useLeadViewContactModal,
  useLeadsInReviewData,
  useLeadsMutations,
  useLeadsTableLogic,
  useLeadsInReviewNotesLogic,
  type UseLeadsInReviewDataReturn,
  type UseLeadsTableLogicReturn,
} from "../hooks";
import type { Lead } from "@/leads/domain";
import { LeadType, getLeadTypeFromNumber } from "@/leads/domain";
import { getLeadRejectionInfoAction, type LeadRejectionInfo } from "../../actions/leadActions";

export interface UseLeadsInReviewPageLogicReturn {
  config: {
    title: string;
    description: string;
    emptyIconName: string;
    emptyTitle: string;
    emptySubtitle: string;
    createModalTitle: string;
  };
  data: UseLeadsInReviewDataReturn;
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
  reviewActions: {
    onAccept: (lead: Lead) => void;
    onRejectClick: (lead: Lead) => void;
    isAccepting: number | null;
    isRejecting: number | null;
  };
  rejectConfirmModal: {
    isOpen: boolean;
    leadToReject: Lead | null;
    rejectionInfo: LeadRejectionInfo | null;
    isLoadingInfo: boolean;
    deleteContact: boolean;
    deleteCompany: boolean;
    setDeleteContact: (value: boolean) => void;
    setDeleteCompany: (value: boolean) => void;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
  };
}

export function useLeadsInReviewPageLogic(): UseLeadsInReviewPageLogicReturn {
  const config = {
    title: "Leads in Review",
    description: "Leads marked for review.",
    emptyIconName: "mdi:clipboard-check-outline",
    emptyTitle: "No leads in review.",
    emptySubtitle: "No leads marked for review.",
    createModalTitle: "Create Lead",
  };

  // 1) Datos
  const data = useLeadsInReviewData();

  // Estado para trackear el leadType del lead seleccionado
  const [selectedLeadType, setSelectedLeadType] = useState<LeadType>(LeadType.CONSTRUCTION);
  
  // Estado para trackear qué lead se está aceptando/rechazando
  const [isAccepting, setIsAccepting] = useState<number | null>(null);
  const [isRejecting, setIsRejecting] = useState<number | null>(null);
  
  // Estado para el modal de confirmación de rechazo
  const [leadToReject, setLeadToReject] = useState<Lead | null>(null);
  const [rejectionInfo, setRejectionInfo] = useState<LeadRejectionInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(false);
  const [deleteContact, setDeleteContact] = useState(false);
  const [deleteCompany, setDeleteCompany] = useState(false);

  // Fetch rejection info when modal opens
  useEffect(() => {
    if (leadToReject && typeof leadToReject.id === "number") {
      setIsLoadingInfo(true);
      setRejectionInfo(null);
      setDeleteContact(false);
      setDeleteCompany(false);
      
      getLeadRejectionInfoAction(leadToReject.id)
        .then((result) => {
          if (result.success) {
            setRejectionInfo(result.data);
          }
        })
        .finally(() => {
          setIsLoadingInfo(false);
        });
    } else {
      setRejectionInfo(null);
      setDeleteContact(false);
      setDeleteCompany(false);
    }
  }, [leadToReject]);

  // 2) Modales CRUD - Usamos CONSTRUCTION como default para crear, y el leadType del lead seleccionado para editar
  // Los leads creados desde esta página deben marcarse como inReview = true
  const createModal = useLeadCreateModal({
    leadType: LeadType.CONSTRUCTION,
    inReview: true,
    onCreated: async () => {
      await data.refetch();
    },
  });
  
  const editModal = useLeadEditModal({
    leadType: selectedLeadType,
    onUpdated: async () => {
      await data.refetch();
    },
  });

  // Wrapper para openEditModal que determina el leadType del lead
  const openEditModal = (lead: Lead) => {
    const leadType = getLeadTypeFromNumber(lead.leadNumber) || LeadType.CONSTRUCTION;
    setSelectedLeadType(leadType);
    editModal.open(lead);
  };

  // 3) Negocio
  const { deleteMutation, acceptMutation } = useLeadsMutations();
  const notesLogic = useLeadsInReviewNotesLogic();
  const viewContactModal = useLeadViewContactModal();

  // 4) Tabla (búsqueda, filtrado e interacciones)
  const table = useLeadsTableLogic({
    leads: data.leads,
    onEdit: openEditModal,
    onDelete: async (id) => {
      await deleteMutation.mutateAsync(id);
      await data.refetch();
    },
    onViewContact: viewContactModal.open,
    onOpenNotesModal: notesLogic.openFromLead,
  });

  // 5) Accept/Reject actions
  const onAccept = async (lead: Lead) => {
    if (typeof lead.id !== "number") return;
    setIsAccepting(lead.id);
    try {
      await acceptMutation.mutateAsync(lead.id);
      await data.refetch();
    } finally {
      setIsAccepting(null);
    }
  };

  // Opens the confirmation modal
  const onRejectClick = (lead: Lead) => {
    setLeadToReject(lead);
  };

  // Closes the confirmation modal
  const onCloseRejectModal = () => {
    setLeadToReject(null);
  };

  // Confirms and executes the rejection
  const onConfirmReject = async () => {
    if (!leadToReject || typeof leadToReject.id !== "number") return;
    setIsRejecting(leadToReject.id);
    try {
      await deleteMutation.mutateAsync({
        id: leadToReject.id,
        deleteContact: deleteContact && rejectionInfo?.contact?.canDelete,
        deleteCompany: deleteCompany && rejectionInfo?.company?.canDelete,
      });
      await data.refetch();
      setLeadToReject(null);
    } finally {
      setIsRejecting(null);
    }
  };

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
      openEditModal,
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
    reviewActions: {
      onAccept,
      onRejectClick,
      isAccepting,
      isRejecting,
    },
    rejectConfirmModal: {
      isOpen: leadToReject !== null,
      leadToReject,
      rejectionInfo,
      isLoadingInfo,
      deleteContact,
      deleteCompany,
      setDeleteContact,
      setDeleteCompany,
      onClose: onCloseRejectModal,
      onConfirm: onConfirmReject,
      isLoading: isRejecting !== null,
    },
  };
}
