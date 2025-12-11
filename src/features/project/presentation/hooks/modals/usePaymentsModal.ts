"use client";

import { useState, useEffect } from "react";
import type { Project } from "@/project/domain";
import { useProjectsApp } from "@/di";
import { updateProject, projectsKeys } from "@/project/application";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@dav033/dav-components";

export interface UsePaymentsModalOptions {
  onUpdated?: () => Promise<void>;
}

export interface UsePaymentsModalResult {
  isOpen: boolean;
  selectedProject: Project | null;
  payments: number[];
  open: (project: Project) => void;
  close: () => void;
  updatePayment: (index: number, value: number) => void;
  addPayment: () => void;
  removePayment: (index: number) => void;
  save: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function usePaymentsModal({
  onUpdated,
}: UsePaymentsModalOptions): UsePaymentsModalResult {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [payments, setPayments] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const app = useProjectsApp();
  const queryClient = useQueryClient();
  const toast = useToast();

  useEffect(() => {
    if (selectedProject) {
      setPayments(selectedProject.payments ? [...selectedProject.payments] : []);
    }
  }, [selectedProject]);

  const open = (project: Project) => {
    setSelectedProject(project);
    setPayments(project.payments ? [...project.payments] : []);
    setError(null);
    setIsOpen(true);
  };

  const close = () => {
    if (!isLoading) {
      setIsOpen(false);
      setSelectedProject(null);
      setPayments([]);
      setError(null);
    }
  };

  const updatePayment = (index: number, value: number) => {
    const newPayments = [...payments];
    newPayments[index] = value;
    setPayments(newPayments);
    setError(null);
  };

  const addPayment = () => {
    setPayments([...payments, 0]);
    setError(null);
  };

  const removePayment = (index: number) => {
    const newPayments = payments.filter((_, i) => i !== index);
    setPayments(newPayments.length > 0 ? newPayments : []);
    setError(null);
  };

  const save = async () => {
    if (!selectedProject) return;

    setIsLoading(true);
    setError(null);

    try {
      const updated = await updateProject(app, selectedProject.id, {
        payments: payments.length > 0 ? payments : [],
      });

      // Update local state
      queryClient.setQueryData<Project[]>(projectsKeys.list(), (old) => {
        if (!old) return old;
        return old.map((p) => (p.id === updated.id ? updated : p));
      });

      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      toast.showSuccess("Payments updated successfully!");
      setIsOpen(false);
      setSelectedProject(null);
      await onUpdated?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not update payments";
      setError(msg);
      toast.showError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isOpen,
    selectedProject,
    payments,
    open,
    close,
    updatePayment,
    addPayment,
    removePayment,
    save,
    isLoading,
    error,
  };
}

