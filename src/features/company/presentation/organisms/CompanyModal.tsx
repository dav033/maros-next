"use client";

import { Plus, Save, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="flex flex-col max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 [scrollbar-gutter:stable]">
          <div className="py-1 px-4">
            <CompanyForm
              value={formValue}
              onChange={onChange}
              disabled={isSubmitting}
              services={services}
              contacts={contacts}
              onCreateNewContact={onCreateNewContact}
            />
            {serverError && <ErrorAlert message={serverError} />}
          </div>
        </div>
        <DialogFooter className="shrink-0 pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onSubmit}
            disabled={formValue.name.trim().length === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader className="size-4 mr-2 animate-spin" />
                {mode === "create" ? "Creating..." : "Saving..."}
              </>
            ) : (
              <>
                {mode === "create" ? (
                  <>
                    <Plus className="size-4 mr-2" />
                    Create
                  </>
                ) : (
                  <>
                    <Save className="size-4 mr-2" />
                    Save
                  </>
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
