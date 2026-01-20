
import { BasicModalFooter } from "@/components/custom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <CompanyForm
          value={formValue}
          onChange={onChange}
          disabled={isSubmitting}
          services={services}
          contacts={contacts}
          onCreateNewContact={onCreateNewContact}
        />
        {serverError && <ErrorAlert message={serverError} />}
        <DialogFooter>
          <BasicModalFooter
            onCancel={onClose}
            onSubmit={onSubmit}
            isLoading={isSubmitting}
            canSubmit={formValue.name.trim().length > 0}
            mode={mode}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
