import { ContextMenuOption } from "@/types/components";
import { useContextMenu } from "@/common/hooks";

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
    const confirmed =
      typeof window !== "undefined" &&
      window.confirm(
        `Are you sure you want to delete "${service.name}"?\n\nThis action cannot be undone.`
      );
    if (!confirmed) return;

    deleteMutation.mutate(service.id);
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
  };
}
