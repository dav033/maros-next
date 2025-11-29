import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompanyService } from "../../domain/models";
import { companyServiceCrudUseCases } from "../../application/usecases/companyServiceCrud";
import { useCompanyApp } from "@/di";
import { useContextMenu } from "@/shared/ui/hooks/useContextMenu";
import type { ContextMenuOption } from "@/types/hooks/context-menu";
import { useToast } from "@/shared/ui";

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
  const toast = useToast();
  const contextMenu = useContextMenu();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => companyServiceCrudUseCases.delete(app)(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyServices"] });
      toast.showSuccess("Service deleted successfully");
      onDeleteSuccess?.();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Could not delete service";
      toast.showError(message);
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
