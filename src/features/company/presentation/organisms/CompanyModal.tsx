import { Button, Modal } from "@/shared/ui";
import { CompanyForm } from "../molecules/CompanyForm";
import { ErrorAlert } from "../molecules/ErrorAlert";
import type { CompanyFormValue } from "../molecules/CompanyForm";
import type { Contact } from "@/features/contact/domain/models";
import type { CompanyService } from "../../domain/models";

interface CompanyModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  formValue: CompanyFormValue;
  onChange: (value: CompanyFormValue) => void;
  isSubmitting: boolean;
  serverError: string | null;
  services: CompanyService[];
  contacts: Contact[];
  submitLabel?: string;
  onCreateNewContact?: () => void;
}

export function CompanyModal({
  isOpen,
  title,
  onClose,
  onSubmit,
  formValue,
  onChange,
  isSubmitting,
  serverError,
  services,
  contacts,
  submitLabel = "Save",
  onCreateNewContact,
}: CompanyModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            loading={isSubmitting}
            disabled={!formValue.name.trim()}
          >
            {submitLabel}
          </Button>
        </>
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
