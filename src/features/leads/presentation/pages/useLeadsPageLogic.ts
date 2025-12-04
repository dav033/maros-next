"use client";

import { useState } from "react";
import type { Lead, LeadType } from "@/leads/domain";
import { useCreateLeadController } from "../hooks/useCreateLeadController";
import { useUpdateLeadController } from "../hooks/useUpdateLeadController";
import { LEAD_TYPE_CONFIGS } from "../../config/leadTypeConfigs";
import { useToast } from "@/shared/ui/context/ToastContext";
import { useLeadsPageByType } from "./useLeadsPageByType";

export interface UseLeadsPageLogicOptions {
  leadType: LeadType;
}

export interface UseLeadsPageLogicReturn {
  // Configuration
  config: typeof LEAD_TYPE_CONFIGS[LeadType];
  
  // Data
  leads: ReturnType<typeof useLeadsPageByType>["leads"];
  filteredLeads: ReturnType<typeof useLeadsPageByType>["filteredLeads"];
  contacts: ReturnType<typeof useLeadsPageByType>["contacts"];
  projectTypes: ReturnType<typeof useLeadsPageByType>["projectTypes"];
  
  // Search
  searchQuery: string;
  searchField: string;
  setSearchQuery: (query: string) => void;
  setSearchField: (field: string) => void;
  totalCount: number;
  filteredCount: number;
  
  // Loading
  showSkeleton: boolean;
  
  // Create modal
  isCreateModalOpen: boolean;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  createController: ReturnType<typeof useCreateLeadController>;
  
  // Edit modal
  isEditModalOpen: boolean;
  selectedLead: Lead | null;
  openEditModal: (lead: Lead) => void;
  closeEditModal: () => void;
  updateController: ReturnType<typeof useUpdateLeadController>;
}

/**
 * Custom hook that encapsulates all business logic for LeadsPageByType.
 * 
 * Manages:
 * - Lead type configuration
 * - Search and filtering
 * - Create/Edit lead controllers
 * - Modal state management
 * - Data fetching and refetching
 * 
 * This allows the page component to be a pure presentational component.
 */
export function useLeadsPageLogic({ leadType }: UseLeadsPageLogicOptions): UseLeadsPageLogicReturn {
  const config = LEAD_TYPE_CONFIGS[leadType];
  const toast = useToast();

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Data and search
  const {
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
    leads,
    showSkeleton,
    refetch,
    contacts,
    projectTypes,
    filteredLeads,
  } = useLeadsPageByType(leadType);

  // Create controller
  const createController = useCreateLeadController({
    leadType,
    onCreated: async () => {
      setIsCreateModalOpen(false);
      toast.showSuccess("Lead created successfully!");
      await refetch();
    },
  });

  // Update controller
  const updateController = useUpdateLeadController({
    lead: selectedLead,
    onUpdated: async () => {
      setIsEditModalOpen(false);
      setSelectedLead(null);
      toast.showSuccess("Lead updated successfully!");
      await refetch();
    },
  });

  // Modal handlers
  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const openEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedLead(null);
  };

  return {
    // Configuration
    config,
    
    // Data
    leads,
    filteredLeads,
    contacts,
    projectTypes,
    
    // Search
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
    
    // Loading
    showSkeleton,
    
    // Create modal
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    createController,
    
    // Edit modal
    isEditModalOpen,
    selectedLead,
    openEditModal,
    closeEditModal,
    updateController,
  };
}
