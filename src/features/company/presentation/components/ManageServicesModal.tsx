"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompanyService, CompanyServiceDraft } from "../../domain/models";
import { companyServiceCrudUseCases } from "../../application/usecases/companyServiceCrud";
import { useCompanyApp } from "@/di";
import { Button, Icon, Modal, useToast, Input, ColorPicker } from "@/shared/ui";
import { DeleteFeedbackModal } from "@/shared/ui/molecules/DeleteFeedbackModal";

type ManageServicesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  services: CompanyService[];
};

type Mode = "list" | "create" | "edit";

type ServiceFormValue = {
  name: string;
  color: string;
};

export function ManageServicesModal({ isOpen, onClose, services }: ManageServicesModalProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<CompanyService | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    function handleDelete(service: CompanyService) {
      setServiceToDelete(service);
      setDeleteModalOpen(true);
      setDeleteError(null);
    }

    async function confirmDelete() {
      if (!serviceToDelete) return;
      try {
        await deleteMutation.mutateAsync(serviceToDelete.id);
        setDeleteModalOpen(false);
        setServiceToDelete(null);
      } catch (error: unknown) {
        setDeleteError("Failed to delete service. Please try again.");
      }
    }
  const app = useCompanyApp();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [mode, setMode] = useState<Mode>("list");
  const [currentService, setCurrentService] = useState<CompanyService | null>(null);
  const [formValue, setFormValue] = useState<ServiceFormValue>({ name: "", color: "#000000" });
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (draft: CompanyServiceDraft) => companyServiceCrudUseCases.create(app)(draft),
    onSuccess: () => {
      setMode("list");
      setFormValue({ name: "", color: "#000000" });
      setServerError(null);
      queryClient.invalidateQueries({ queryKey: ["companyServices"] });
      toast.showSuccess("Service created successfully!");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Could not create service";
      setServerError(message);
      toast.showError(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: { name: string; color?: string | null } }) =>
      companyServiceCrudUseCases.update(app)(id, patch),
    onSuccess: () => {
      setMode("list");
      setFormValue({ name: "", color: "#000000" });
      setCurrentService(null);
      setServerError(null);
      queryClient.invalidateQueries({ queryKey: ["companyServices"] });
      toast.showSuccess("Service updated successfully!");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Could not update service";
      setServerError(message);
      toast.showError(message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => companyServiceCrudUseCases.delete(app)(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companyServices"] });
      toast.showSuccess("Service deleted successfully");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Could not delete service";
      toast.showError(message);
    },
  });

  function handleClose() {
    if (createMutation.isPending || updateMutation.isPending || deleteMutation.isPending) {
      return;
    }
    setMode("list");
    setFormValue({ name: "", color: "#000000" });
    setCurrentService(null);
    setServerError(null);
    onClose();
  }

  function openCreate() {
    setFormValue({ name: "", color: "#000000" });
    setCurrentService(null);
    setServerError(null);
    setMode("create");
  }

  function openEdit(service: CompanyService) {
    setCurrentService(service);
    setFormValue({ name: service.name, color: service.color || "#000000" });
    setServerError(null);
    setMode("edit");
  }

  function handleDelete(service: CompanyService) {
    const confirmed =
      typeof window !== "undefined" &&
      window.confirm(
        `Are you sure you want to delete "${service.name}"?\n\nThis action cannot be undone.`
      );
    if (!confirmed) return;

    deleteMutation.mutate(service.id);
  }

  function handleFormChange(value: ServiceFormValue) {
    setFormValue(value);
  }

  function handleCreateSubmit() {
    const trimmedName = formValue.name.trim();
    if (!trimmedName) {
      setServerError("Service name is required");
      return;
    }
    createMutation.mutate({ name: trimmedName, color: formValue.color });
  }

  function handleEditSubmit() {
    if (!currentService) return;

    const trimmedName = formValue.name.trim();
    if (!trimmedName) {
      setServerError("Service name is required");
      return;
    }
    if (trimmedName === currentService.name && formValue.color === (currentService.color || "#000000")) {
      setMode("list");
      return;
    }
    updateMutation.mutate({ id: currentService.id, patch: { name: trimmedName, color: formValue.color } });
  }

  function backToList() {
    setMode("list");
    setFormValue({ name: "", color: "#000000" });
    setCurrentService(null);
    setServerError(null);
  }

  const isFormMode = mode === "create" || mode === "edit";
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      title={
        mode === "list" ? (
          "Manage Services"
        ) : mode === "create" ? (
          "New Service"
        ) : (
          <div className="flex items-center gap-2">
            <div 
              className="h-4 w-4 rounded-full shrink-0"
              style={{ backgroundColor: currentService?.color || "#000000" }}
            />
            <span>Edit Service</span>
          </div>
        )
      }
      onClose={handleClose}
      footer={
        isFormMode ? (
          <>
            <Button variant="secondary" onClick={backToList} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={mode === "create" ? handleCreateSubmit : handleEditSubmit}
              loading={isPending}
              disabled={!formValue.name.trim()}
            >
              {mode === "create" ? "Create" : "Save changes"}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        )
      }
    >
      {mode === "list" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {services.length === 0
                ? "No services yet."
                : `${services.length} service${services.length !== 1 ? "s" : ""}`}
            </p>
            <Button variant="primary" size="sm" onClick={openCreate}>
              <Icon name="lucide:plus" className="mr-1.5" size={14} />
              New Service
            </Button>
          </div>

          {services.length === 0 ? (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-theme-gray-subtle bg-theme-dark/50 p-8">
              <div className="text-center">
                <Icon name="lucide:wrench" size={40} className="mx-auto mb-3 text-gray-500" />
                <p className="text-sm text-gray-400">
                  Create your first service to get started.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-lg border border-theme-gray-subtle bg-theme-dark/50 px-2.5 py-2 transition-colors hover:bg-theme-dark/70"
                >
                  <div className="flex items-center gap-2">
                    {service.color ? (
                      <div 
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: service.color }}
                      />
                    ) : (
                      <div className="h-3 w-3 rounded-full shrink-0 border border-gray-500" />
                    )}
                    <span className="text-sm text-theme-light">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={() => openEdit(service)}
                      className="rounded p-1 text-gray-400 transition-colors hover:bg-theme-gray-subtle hover:text-theme-light cursor-pointer"
                      title="Edit service"
                      disabled={deleteMutation.isPending}
                    >
                      <Icon name="lucide:edit" size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(service)}
                      className="rounded p-1 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 cursor-pointer"
                      title="Delete service"
                      disabled={deleteMutation.isPending}
                    >
                      <Icon name="lucide:trash-2" size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4 rounded-2xl bg-theme-dark/80 p-3 shadow-md">
            <Input
              value={formValue.name}
              onChange={(e) => handleFormChange({ ...formValue, name: e.target.value })}
              placeholder="Service name"
              disabled={isPending}
              required
              leftAddon={<Icon name="lucide:wrench" size={16} />}
            />
            <ColorPicker
              value={formValue.color}
              onChange={(color) => handleFormChange({ ...formValue, color })}
              disabled={isPending}
              label="Color"
            />
          </div>
          {serverError && (
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <Icon name="lucide:alert-circle" size={16} className="text-red-400 mt-0.5" />
              <p className="text-sm text-red-400">{serverError}</p>
            </div>
          )}
        </>
      )}
      <DeleteFeedbackModal
        isOpen={deleteModalOpen}
        title="Delete Service"
        description={
          <>
            Are you sure you want to delete service <span className="font-semibold text-theme-light">{serviceToDelete?.name}</span>?<br />This action cannot be undone.
          </>
        }
        error={deleteError}
        loading={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteModalOpen(false);
            setServiceToDelete(null);
            setDeleteError(null);
          }
        }}
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </Modal>
  );
}
