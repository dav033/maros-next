"use client";

import { Modal, BasicModalFooter } from "@dav033/dav-components";
import { ContactModeSelector, ContactMode, LeadForm } from "@/leads/presentation";
import { LeadEditForm } from "@/leads/presentation";
import type { ProjectType } from "@/projectType/domain";
import type { Contact } from "@/contact/domain";
import type { Lead } from "@/leads/domain";

type ContactForSelect = { id: number; name: string; phone?: string; email?: string };

type CreateLeadController = {
  form: {
    leadNumber: string;
    leadName: string;
    leadType: import("@/leads/domain").LeadType;
    projectTypeId?: number;
    contactId?: number;
    location: string;
    addressLink?: string | null;
    status?: string;
    note?: string;
    customerName?: string;
    contactName?: string;
    phone?: string;
    email?: string;
  };
  setField: (key: any, value: any) => void;
  contactMode: ContactMode;
  setContactMode: (mode: ContactMode) => void;
  isLoading: boolean;
  error: string | null;
  canSubmit: boolean;
  submit: () => void;
};

type UpdateLeadController = {
  form: {
    leadName: string;
    projectTypeId?: number;
    contactId?: number;
    location: string;
    addressLink?: string | null;
    leadNumber?: string;
    status?: string;
  };
  setField: (key: any, value: any) => void;
  setFields?: (fields: any) => void;
  isLoading: boolean;
  error: string | null;
  canSubmit: boolean;
  submit: () => void;
};

type LeadModalController = {
  isOpen: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  createController?: CreateLeadController;
  updateController?: UpdateLeadController;
  lead?: Lead | null;
};

interface LeadModalProps {
  controller: LeadModalController;
  contacts: Contact[] | ContactForSelect[];
  projectTypes: ProjectType[];
}

export function LeadModal({
  controller,
  contacts,
  projectTypes,
}: LeadModalProps) {
  const { isOpen, mode, onClose, createController, updateController, lead } = controller;
  const title = mode === "create" ? "Create Lead" : "Edit Lead";

  if (mode === "edit" && !lead) return null;

  const isCreateMode = mode === "create";
  const currentController = isCreateMode ? createController : updateController;

  if (!currentController) return null;

  const isLoading = currentController.isLoading;
  const error = currentController.error;
  const canSubmit = currentController.canSubmit;
  const onSubmit = currentController.submit;

  const contactForSelect: ContactForSelect[] = contacts.map((c) => ({
    id: typeof c.id === "number" ? c.id : (c as any).id,
    name: c.name,
    phone: c.phone,
    email: c.email,
  }));

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
        {isCreateMode && createController && (
          <>
            <ContactModeSelector
              contactMode={createController.contactMode}
              onContactModeChange={createController.setContactMode}
              form={{
                contactName: createController.form.contactName ?? "",
                phone: createController.form.phone ?? "",
                email: createController.form.email ?? "",
              }}
              onChange={(key, value) => createController.setField(key as any, value)}
              disabled={isLoading}
            />
            <LeadForm
              form={createController.form}
              onChange={createController.setField}
              projectTypes={projectTypes}
              contacts={contactForSelect}
              showContactSelect={createController.contactMode === ContactMode.EXISTING_CONTACT}
              disabled={isLoading}
            />
          </>
        )}

        {!isCreateMode && updateController && (
          <LeadEditForm
            form={updateController.form}
            onChange={updateController.setField}
            projectTypes={projectTypes}
            contacts={contacts as Contact[]}
            disabled={isLoading}
          />
        )}

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

