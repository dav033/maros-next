"use client";

import { useState } from "react";
import type { Project } from "@/project/domain";
import { useToast } from "@dav033/dav-components";
import { useCreateProjectController } from "../controllers/useCreateProjectController";

export interface UseProjectCreateModalOptions {
  onCreated?: () => Promise<void>;
}

export interface UseProjectCreateModalResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  createController: ReturnType<typeof useCreateProjectController>;
}

export function useProjectCreateModal({
  onCreated,
}: UseProjectCreateModalOptions): UseProjectCreateModalResult {
  const [isOpen, setIsOpen] = useState(false);
  const toast = useToast();

  const createController = useCreateProjectController({
    onCreated: async (project: Project) => {
      setIsOpen(false);
      toast.showSuccess("Project created successfully!");
      await onCreated?.();
    },
  });

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



