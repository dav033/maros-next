"use client";

import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompanyService, CompanyServiceDraft } from "../../domain/models";
import { companyServiceCrudUseCases } from "../../application/usecases/companyServiceCrud";
import { useCompanyApp } from "@/di";
import { useToast } from "@/shared/ui";

type Mode = "list" | "create" | "edit";

type ServiceFormValue = {
  name: string;
  color: string;
};

export function useManageServices() {
  const app = useCompanyApp();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [mode, setMode] = useState<Mode>("list");
  const [currentService, setCurrentService] = useState<CompanyService | null>(null);
  const [formValue, setFormValue] = useState<ServiceFormValue>({ name: "", color: "#000000" });
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<CompanyService | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  const resetForm = useCallback(() => {
    setMode("list");
    setFormValue({ name: "", color: "#000000" });
    setCurrentService(null);
    setServerError(null);
  }, []);

  const openCreate = useCallback(() => {
    setFormValue({ name: "", color: "#000000" });
    setCurrentService(null);
    setServerError(null);
    setMode("create");
  }, []);

  const openEdit = useCallback((service: CompanyService) => {
    setCurrentService(service);
    setFormValue({ name: service.name, color: service.color || "#000000" });
    setServerError(null);
    setMode("edit");
  }, []);

  const handleFormChange = useCallback((value: ServiceFormValue) => {
    setFormValue(value);
  }, []);

  const handleCreateSubmit = useCallback(() => {
    const trimmedName = formValue.name.trim();
    if (!trimmedName) {
      setServerError("Service name is required");
      return;
    }
    createMutation.mutate({ name: trimmedName, color: formValue.color });
  }, [formValue, createMutation]);

  const handleEditSubmit = useCallback(() => {
    if (!currentService) return;
    const trimmedName = formValue.name.trim();
    if (!trimmedName) {
      setServerError("Service name is required");
      return;
    }
    if (
      trimmedName === currentService.name &&
      formValue.color === (currentService.color || "#000000")
    ) {
      setMode("list");
      return;
    }
    updateMutation.mutate({ id: currentService.id, patch: { name: trimmedName, color: formValue.color } });
  }, [currentService, formValue, updateMutation]);

  const handleDelete = useCallback((service: CompanyService) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
    setDeleteError(null);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!serviceToDelete) return;
    try {
      await deleteMutation.mutateAsync(serviceToDelete.id);
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    } catch (error: unknown) {
      setDeleteError("Failed to delete service. Please try again.");
    }
  }, [serviceToDelete, deleteMutation]);

  const closeDeleteModal = useCallback(() => {
    if (!deleteMutation.isPending) {
      setDeleteModalOpen(false);
      setServiceToDelete(null);
      setDeleteError(null);
    }
  }, [deleteMutation.isPending]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  return {
    mode,
    currentService,
    formValue,
    serverError,
    deleteModalOpen,
    serviceToDelete,
    deleteError,
    isPending,
    isDeleting: deleteMutation.isPending,
    resetForm,
    openCreate,
    openEdit,
    handleFormChange,
    handleCreateSubmit,
    handleEditSubmit,
    handleDelete,
    confirmDelete,
    closeDeleteModal,
  };
}
