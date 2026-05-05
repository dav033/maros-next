"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus, Save, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ContactModeSelector, ContactMode, LeadForm } from "@/leads/presentation";
import { LeadEditForm } from "@/leads/presentation";
import type { ProjectType } from "@/projectType/domain";
import type { Contact } from "@/contact/domain";
import type { Lead } from "@/leads/domain";
import { ContactCompanySelector } from "@/features/contact/presentation/molecules/ContactCompanySelector";
import { CompanyModal } from "@/features/company/presentation/organisms/CompanyModal";
import {
  useCompanyMutations,
  useCompanyServices,
  useInstantCompanies,
} from "@/features/company/presentation/hooks";
import {
  initialCompanyFormValue,
  toDraft as toCompanyDraft,
} from "@/features/company/presentation/helpers/companyFormHelpers";
import type { CompanyFormValue } from "@/features/company/presentation/molecules/CompanyForm";

type ContactForSelect = { id: number; name: string; phone?: string; email?: string };

type CreateLeadController = {
  form: {
    leadNumber: string;
    leadName: string;
    leadType: import("@/leads/domain").LeadType;
    projectTypeId?: number;
    contactId?: number;
    companyId?: number | null;
    location: string;
    addressLink?: string | null;
    note?: string;
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
  const { companies = [] } = useInstantCompanies();
  const { services = [] } = useCompanyServices();
  const { createMutation: createCompanyMutation } = useCompanyMutations();
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyFormValue, setCompanyFormValue] =
    useState<CompanyFormValue>(initialCompanyFormValue);
  const [companyServerError, setCompanyServerError] = useState<string | null>(
    null,
  );

  const { isOpen, mode, onClose, createController, updateController, lead } = controller;
  const title = mode === "create" ? "Create Lead" : "Edit Lead";

  const isCreateMode = mode === "create";
  const currentController = isCreateMode ? createController : updateController;

  const isLoading = currentController?.isLoading ?? false;
  const error = currentController?.error ?? null;
  const canSubmit = currentController?.canSubmit ?? false;
  const onSubmit = currentController?.submit ?? (() => {});

  const openCompanyModal = useCallback(() => {
    setCompanyFormValue(initialCompanyFormValue);
    setCompanyServerError(null);
    setIsCompanyModalOpen(true);
  }, []);

  const closeCompanyModal = useCallback(() => {
    if (createCompanyMutation.isPending) return;
    setIsCompanyModalOpen(false);
    setCompanyServerError(null);
    setCompanyFormValue(initialCompanyFormValue);
  }, [createCompanyMutation.isPending]);

  const handleCompanySubmit = useCallback(async () => {
    const draft = toCompanyDraft(companyFormValue);

    if (!draft.name) {
      setCompanyServerError("Name is required");
      return;
    }

    try {
      const created = await createCompanyMutation.mutateAsync({ draft });
      const createdCompanyId = (created as { id?: unknown }).id;

      if (
        createController &&
        typeof createdCompanyId === "number" &&
        createdCompanyId > 0
      ) {
        createController.setField("companyId", createdCompanyId);
      }

      setIsCompanyModalOpen(false);
      setCompanyServerError(null);
      setCompanyFormValue(initialCompanyFormValue);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not create company";
      setCompanyServerError(message);
    }
  }, [companyFormValue, createCompanyMutation, createController]);

  const companyModalController = useMemo(
    () => ({
      isOpen: isCompanyModalOpen,
      mode: "create" as const,
      onClose: closeCompanyModal,
      onSubmit: handleCompanySubmit,
      formValue: companyFormValue,
      onChange: setCompanyFormValue,
      isSubmitting: createCompanyMutation.isPending,
      serverError: companyServerError,
    }),
    [
      isCompanyModalOpen,
      closeCompanyModal,
      handleCompanySubmit,
      companyFormValue,
      createCompanyMutation.isPending,
      companyServerError,
    ],
  );

  if (mode === "edit" && !lead) return null;
  if (!currentController) return null;

  const contactForSelect: ContactForSelect[] = contacts.map((c) => ({
    id: typeof c.id === "number" ? c.id : (c as any).id,
    name: c.name,
    phone: c.phone,
    email: c.email,
  }));

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[96vw] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-left">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 w-full">
          {isCreateMode && createController && (
            <>
              <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Contact
                </p>
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
                  contacts={contactForSelect}
                  selectedContactId={createController.form.contactId}
                  onContactSelect={(contactId) => createController.setField("contactId", contactId)}
                />
                {createController.contactMode === ContactMode.NEW_CONTACT && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Company (optional)</p>
                    <ContactCompanySelector
                      selectedCompanyId={createController.form.companyId ?? null}
                      companies={companies}
                      disabled={isLoading}
                      onCompanyChange={(companyId) =>
                        createController.setField("companyId", companyId)
                      }
                      onCreateNewCompany={openCompanyModal}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-lg border border-border/70 bg-muted/35 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Lead details
                </p>
                <LeadForm
                  form={createController.form}
                  onChange={createController.setField}
                  projectTypes={projectTypes}
                  contacts={contactForSelect}
                  showContactSelect={createController.contactMode === ContactMode.EXISTING_CONTACT}
                  disabled={isLoading}
                />
                </div>
              
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
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={onSubmit}
            disabled={!canSubmit || isLoading}
            className="bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90"
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

      <CompanyModal
        controller={companyModalController}
        services={services}
        contacts={[]}
      />
    </>
  );
}

