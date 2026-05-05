import { ContextMenuOption } from "@/types/components";
import { useContextMenu } from "@/common/hooks";
import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompanyService } from "../../../domain/models";
import { companyServiceCrudUseCases } from "../../../application/usecases/companyServiceCrud";
import { useCompanyApp } from "@/di";
import { toast } from "sonner";

type UseCompanyServiceContextMenuProps = {
  onEdit?: (service: CompanyService) => void;
  onDeleteSuccess?: () => void;
};

export function useCompanyServiceContextMenu({
  onEdit,
  onDeleteSuccess,
}: UseCompanyServiceContextMenuProps = {}) {
  const app = useCompanyApp();
  const queryClient = useQueryClient();
  const contextMenu = useContextMenu();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<CompanyService | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => companyServiceCrudUseCases.delete(app)(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyServices"] });
      toast.success("Service deleted successfully");
      onDeleteSuccess?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Could not delete service";
      toast.error(message);
    },
  });

  const handleDelete = (service: CompanyService) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteMutation.mutateAsync(serviceToDelete.id);
      setDeleteModalOpen(false);
      setServiceToDelete(null);
      setDeleteError(null);
    } catch {
      setDeleteError("Failed to delete service. Please try again.");
    }
  };

  const closeDeleteModal = () => {
    if (!deleteMutation.isPending) {
      setDeleteModalOpen(false);
      setServiceToDelete(null);
      setDeleteError(null);
    }
  };

  const getServiceContextOptions = (service: CompanyService): ContextMenuOption[] => [
    {
      id: "edit",
      label: "Edit Service",
      icon: "lucide:edit",
      action: () => {
        onEdit?.(service);
        contextMenu.hide();
      },
    },
    {
      id: "delete",
      label: "Delete Service",
      icon: "lucide:trash-2",
      action: () => {
        handleDelete(service);
        contextMenu.hide();
      },
      danger: true,
    },
  ];

  return {
    contextMenu,
    getServiceContextOptions,
    deleteModalProps: {
      isOpen: deleteModalOpen,
      serviceToDelete,
      error: deleteError,
      loading: deleteMutation.isPending,
      onClose: closeDeleteModal,
      onConfirm: confirmDelete,
    },
  };
}
