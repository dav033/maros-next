"use client";

import { useMemo } from "react";
import type { Lead } from "@/leads/domain";
import type { Contact } from "@/contact/domain";

export interface UseLeadModalControllerOptions {
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  closeCreateModal: () => void;
  closeEditModal: () => void;
  createController: any;
  updateController: any;
  selectedLead: Lead | null;
  contacts: Contact[] | undefined;
}

export function useLeadModalController({
  isCreateModalOpen,
  isEditModalOpen,
  closeCreateModal,
  closeEditModal,
  createController,
  updateController,
  selectedLead,
  contacts,
}: UseLeadModalControllerOptions) {
  const controller = useMemo(
    () => ({
      isOpen: isCreateModalOpen || isEditModalOpen,
      mode: (isCreateModalOpen ? "create" : "edit") as "create" | "edit",
      onClose: isCreateModalOpen ? closeCreateModal : closeEditModal,
      createController: isCreateModalOpen ? createController : undefined,
      updateController: isEditModalOpen ? updateController : undefined,
      lead: selectedLead,
    }),
    [
      isCreateModalOpen,
      isEditModalOpen,
      closeCreateModal,
      closeEditModal,
      createController,
      updateController,
      selectedLead,
    ]
  );

  const contactsForModal = useMemo(() => {
    return isCreateModalOpen
      ? (contacts ?? [])
          .filter((c): c is Contact & { id: number } => typeof c.id === "number")
          .map((c) => ({
            id: c.id as number,
            name: c.name,
            phone: c.phone,
            email: c.email,
          }))
      : contacts ?? [];
  }, [isCreateModalOpen, contacts]);

  return {
    controller,
    contactsForModal,
  };
}

