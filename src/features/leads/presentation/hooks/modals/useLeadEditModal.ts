"use client";

import { useState } from "react";
import type { Lead } from "@/leads/domain";
import type { LeadType } from "@/leads/domain";
import { useToast } from "@dav033/dav-components";
import { useUpdateLeadController } from "../controllers/useUpdateLeadController";

export interface UseLeadEditModalOptions {
  leadType: LeadType;
  onUpdated?: () => Promise<void>;
}

export interface UseLeadEditModalResult {
  isOpen: boolean;
  selectedLead: Lead | null;
  open: (lead: Lead) => void;
  close: () => void;
  updateController: ReturnType<typeof useUpdateLeadController>;
}

export function useLeadEditModal({
  leadType,
  onUpdated,
}: UseLeadEditModalOptions): UseLeadEditModalResult {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const toast = useToast();

  const updateController = useUpdateLeadController({
    lead: selectedLead,
    onUpdated: async (lead: Lead) => {
      setIsOpen(false);
      setSelectedLead(null);
      toast.showSuccess("Lead updated successfully!");
      await onUpdated?.();
    },
  });

  const open = (lead: Lead) => {
    setSelectedLead(lead);
    setIsOpen(true);
  };

  const close = () => {
    if (!updateController.isLoading) {
      setIsOpen(false);
      setSelectedLead(null);
    }
  };

  return {
    isOpen,
    selectedLead,
    open,
    close,
    updateController,
  };
}

