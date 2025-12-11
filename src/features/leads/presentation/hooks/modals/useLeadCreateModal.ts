"use client";

import { useState, useEffect } from "react";
import type { Lead, LeadType } from "@/leads/domain";
import { useToast } from "@dav033/dav-components";
import { useCreateLeadController } from "../controllers/useCreateLeadController";

export interface UseLeadCreateModalOptions {
  leadType: LeadType;
  onCreated?: () => Promise<void>;
}

export interface UseLeadCreateModalResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  createController: ReturnType<typeof useCreateLeadController>;
}

export function useLeadCreateModal({
  leadType,
  onCreated,
}: UseLeadCreateModalOptions): UseLeadCreateModalResult {
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  const createController = useCreateLeadController({
    leadType,
    onCreated: async (lead: Lead) => {
      setIsOpen(false);
      toast.showSuccess("Lead created successfully!");
      await onCreated?.();
    },
  });

  // Actualizar el tipo del formulario cuando se abre el modal o cambia el leadType
  useEffect(() => {
    if (isOpen) {
      createController.setField("leadType", leadType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadType, isOpen]);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    if (!createController.isLoading) {
      setIsOpen(false);
    }
  };

  return {
    isOpen,
    open,
    close,
    createController,
  };
}

