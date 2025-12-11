"use client";

import { Modal, BasicModalFooter } from "@dav033/dav-components";
import { ProjectForm } from "@/project/presentation";
import type { Lead } from "@/leads/domain";
import type { Project } from "@/project/domain";

type CreateProjectController = {
  form: {
    invoiceAmount?: number;
    payments?: number[];
    projectProgressStatus?: string;
    invoiceStatus?: string;
    quickbooks?: boolean;
    overview?: string;
    leadId?: number;
  };
  setField: (key: any, value: any) => void;
  isLoading: boolean;
  error: string | null;
  canSubmit: boolean;
  submit: () => void;
};

type UpdateProjectController = {
  form: {
    invoiceAmount?: number;
    payments?: number[];
    projectProgressStatus?: string;
    invoiceStatus?: string;
    quickbooks?: boolean;
    overview?: string;
    leadId?: number;
  };
  setField: (key: any, value: any) => void;
  isLoading: boolean;
  error: string | null;
  canSubmit: boolean;
  submit: () => void;
};

type ProjectModalController = {
  isOpen: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  createController?: CreateProjectController;
  updateController?: UpdateProjectController;
  project?: Project | null;
};

interface ProjectModalProps {
  controller: ProjectModalController;
  leads: Lead[];
}

export function ProjectModal({
  controller,
  leads,
}: ProjectModalProps) {
  const { isOpen, mode, onClose, createController, updateController, project } = controller;
  const title = mode === "create" ? "Create Project" : "Edit Project";

  if (mode === "edit" && !project) return null;

  const isCreateMode = mode === "create";
  const currentController = isCreateMode ? createController : updateController;

  if (!currentController) return null;

  const isLoading = currentController.isLoading;
  const error = currentController.error;
  const canSubmit = currentController.canSubmit;
  const onSubmit = currentController.submit;

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={
        <BasicModalFooter
          onCancel={onClose}
          onSubmit={onSubmit}
          isLoading={isLoading}
          canSubmit={canSubmit}
          mode={mode === "create" ? "create" : "update"}
        />
      }
    >
      <div className="space-y-4">
        <ProjectForm
          form={currentController.form}
          onChange={currentController.setField}
          leads={leads}
          disabled={isLoading}
        />

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <span className="mt-0.5 text-red-400">!</span>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}

