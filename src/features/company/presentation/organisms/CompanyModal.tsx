import { Modal, BasicModalFooter } from "@dav033/dav-components";
import { CompanyForm } from "../molecules/CompanyForm";
import { ErrorAlert } from "../molecules/ErrorAlert";
import type { CompanyFormValue } from "../molecules/CompanyForm";
import type { Contact } from "@/features/contact/domain/models";
import type { CompanyService } from "../../domain/models";

type CompanyModalController = {
  isOpen: boolean;
  mode: "create" | "update";
  onClose: () => void;
  onSubmit: () => void;
  formValue: CompanyFormValue;
  onChange: (value: CompanyFormValue) => void;
  isSubmitting: boolean;
  serverError: string | null;
};

interface CompanyModalProps {
  controller: CompanyModalController;
  services: CompanyService[];
  contacts: Contact[];
  onCreateNewContact?: () => void;
}

export function CompanyModal({
  controller,
  services,
  contacts,
  onCreateNewContact,
}: CompanyModalProps) {
  const { isOpen, mode, onClose, onSubmit, formValue, onChange, isSubmitting, serverError } = controller;
  const title = mode === "create" ? "New company" : "Edit company";

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={
        <BasicModalFooter
          onCancel={onClose}
          onSubmit={onSubmit}
          isLoading={isSubmitting}
          canSubmit={formValue.name.trim().length > 0}
          mode={mode}
        />
      }
    >
      <CompanyForm
        value={formValue}
        onChange={onChange}
        disabled={isSubmitting}
        services={services}
        contacts={contacts}
        onCreateNewContact={onCreateNewContact}
      />
      {serverError && <ErrorAlert message={serverError} />}
    </Modal>
  );
}
