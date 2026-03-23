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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onSubmit}
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? (
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

