"use client";

import { useState, useEffect } from "react";
import type { Lead, LeadType } from "@/leads/domain";
import { toast } from "sonner";
import { useCreateLeadController } from "../controllers/useCreateLeadController";

export interface UseLeadCreateModalOptions {
  leadType: LeadType;
  inReview?: boolean;
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
  inReview,
  onCreated,
}: UseLeadCreateModalOptions): UseLeadCreateModalResult {
  const [isOpen, setIsOpen] = useState(false);
  const createController = useCreateLeadController({
    leadType,
    inReview,
    onCreated: async (lead: Lead) => {
      setIsOpen(false);
      toast.success("Lead created successfully!");
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

