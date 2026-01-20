"use client";

import { useState } from "react";
import type { Project } from "@/project/domain";
import { toast } from "sonner";
import { useUpdateProjectController } from "../controllers/useUpdateProjectController";

export interface UseProjectEditModalOptions {
  onUpdated?: () => Promise<void>;
}

export interface UseProjectEditModalResult {
  isOpen: boolean;
  selectedProject: Project | null;
  open: (project: Project) => void;
  close: () => void;
  updateController: ReturnType<typeof useUpdateProjectController>;
}

export function useProjectEditModal({
  onUpdated,
}: UseProjectEditModalOptions): UseProjectEditModalResult {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const updateController = useUpdateProjectController({
    project: selectedProject,
    onUpdated: async (project: Project) => {
      setIsOpen(false);
      setSelectedProject(null);
      toast.success("Project updated successfully!");
      await onUpdated?.();
    },
  });

  const open = (project: Project) => {
    setSelectedProject(project);
    setIsOpen(true);
  };

  const close = () => {
    if (!updateController.isLoading) {
      setIsOpen(false);
      setSelectedProject(null);
    }
  };

  return {
    isOpen,
    selectedProject,
    open,
    close,
    updateController,
  };
}



