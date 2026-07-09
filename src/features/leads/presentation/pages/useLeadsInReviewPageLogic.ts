"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
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
import { LeadStatus, LeadType, getLeadTypeFromNumber } from "@/leads/domain";
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
  postConversionEstimateModal: {
    projectId: number | null;
    leadName?: string;
    contactEmail?: string;
    onClose: () => void;
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
  const [postConversionEstimate, setPostConversionEstimate] = useState<{
    projectId: number;
    leadName?: string;
    contactEmail?: string;
  } | null>(null);

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
          } else {
            toast.error(result.error ?? "Could not load rejection info");
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
    onUpdated: async (updatedLead) => {
      const projectId = updatedLead.conversion?.converted
        ? updatedLead.conversion.projectId
        : undefined;
      if (projectId) {
        setPostConversionEstimate({
          projectId,
          leadName: updatedLead.name || undefined,
          contactEmail: updatedLead.contact?.email || undefined,
        });
      }
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
  const { deleteMutation, acceptMutation, updateStatusMutation, updateProjectTypeMutation } =
    useLeadsMutations();
  const notesLogic = useLeadsInReviewNotesLogic();
  const viewContactModal = useLeadViewContactModal();

  const handleUpdateStatus = async (lead: Lead, status: LeadStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: lead.id, status });
    } catch {
      // Error ya manejado por useEntityMutation
    }
  };

  const handleUpdateProjectType = async (lead: Lead, projectTypeId: number) => {
    try {
      await updateProjectTypeMutation.mutateAsync({ id: lead.id, projectTypeId });
    } catch {
      // Error ya manejado por useEntityMutation
    }
  };

  // 4) Tabla (búsqueda, filtrado e interacciones)
  const table = useLeadsTableLogic({
    leads: data.leads,
    onEdit: openEditModal,
    onDelete: async (id) => {
      await deleteMutation.mutateAsync(id);
    },
    onViewContact: viewContactModal.open,
    onOpenNotesModal: notesLogic.openFromLead,
    projectTypes: data.projectTypes,
    onUpdateStatus: handleUpdateStatus,
    onUpdateProjectType: handleUpdateProjectType,
    isUpdatingStatus: (lead) =>
      updateStatusMutation.isPending && updateStatusMutation.variables?.id === lead.id,
    isUpdatingProjectType: (lead) =>
      updateProjectTypeMutation.isPending && updateProjectTypeMutation.variables?.id === lead.id,
  });

  // 5) Accept/Reject actions
  const onAccept = async (lead: Lead) => {
    if (typeof lead.id !== "number") return;
    setIsAccepting(lead.id);
    try {
      await acceptMutation.mutateAsync(lead.id);
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
    postConversionEstimateModal: {
      projectId: postConversionEstimate?.projectId ?? null,
      leadName: postConversionEstimate?.leadName,
      contactEmail: postConversionEstimate?.contactEmail,
      onClose: () => setPostConversionEstimate(null),
    },
  };
}
