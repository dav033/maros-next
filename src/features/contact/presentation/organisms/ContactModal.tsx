"use client";

import { Modal, BasicModalFooter } from "@dav033/dav-components";
import { ContactForm } from "../molecules/ContactForm";
import type { ContactFormValue } from "../../domain/mappers";
import type { Company } from "@/company";

type ContactModalController = {
  isOpen: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSubmit: () => void;
  formValue: ContactFormValue;
  onFormChange: (value: ContactFormValue) => void;
  isLoading: boolean;
  error: string | null;
  canSubmit: boolean;
};

interface ContactModalProps {
  controller: ContactModalController;
  companies: Company[];
  onCreateNewCompany?: () => void;
}

export function ContactModal({
  controller,
  companies,
  onCreateNewCompany,
}: ContactModalProps) {
  const { isOpen, mode, onClose, onSubmit, formValue, onFormChange, isLoading, error, canSubmit } = controller;
  const title = mode === "create" ? "New contact" : "Edit contact";
  const footerMode = mode === "create" ? "create" as const : "update" as const;

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
          mode={footerMode}
        />
      }
    >
      <ContactForm
        value={formValue}
        onChange={onFormChange}
        disabled={isLoading}
        companies={companies}
        onCreateNewCompany={onCreateNewCompany}
      />
      {error && (
        <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </Modal>
  );
}

