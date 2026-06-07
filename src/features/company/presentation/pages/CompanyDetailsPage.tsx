"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  EntityDetailHeader,
  EntityErrorPage,
  NotesEditorModal,
} from "@/components/shared";
import { useInlineEdit } from "@/common/hooks";
import { useCompanyMutations, useContactsData } from "../hooks";
import { useCompanyNotesLogic } from "../hooks/notes/useCompanyNotesLogic";
import { useCompanyNotesModalController } from "../hooks/notes/useCompanyNotesModalController";
import { updateCompanyAction } from "@/features/company/actions/companyActions";
import { CompanyInfoSection } from "./sections/CompanyInfoSection";
import { CompanyNotesSection } from "./sections/CompanyNotesSection";
import { CompanyContactsSection } from "./sections/CompanyContactsSection";
import type { CompanyType, Company, CompanyDetails } from "../../domain/models";
import { EntityAttachmentsSection } from "@/features/attachments/presentation/EntityAttachmentsSection";



interface CompanyDetailsPageProps {
  companyId: number;
  initialData: {
    companyDetails: CompanyDetails | null;
    error?: string;
  };
}

export function CompanyDetailsPage({
  companyId,
  initialData,
}: CompanyDetailsPageProps) {
  const router = useRouter();
  const { companyDetails, error } = initialData;

  // Data hooks
  const { updateMutation } = useCompanyMutations();
  const data = useContactsData();
  const { contacts = [], companies = [] } = data;

  // Notes logic
  const notesLogic = useCompanyNotesLogic({
    onSuccess: () => router.refresh(),
  });

  // Inline editing
  const inlineEdit = useInlineEdit({
    initialData: {
      name: companyDetails?.name ?? "",
      phone: companyDetails?.phone ?? "",
      email: companyDetails?.email ?? "",
      address: companyDetails?.address ?? "",
      addressLink: companyDetails?.addressLink ?? "",
      type: (companyDetails?.type ?? null) as CompanyType | null,
      isCustomer: companyDetails?.isCustomer ?? false,
      isClient: companyDetails?.isClient ?? false,
      submiz: companyDetails?.submiz ?? "",
    },
    onSave: async (patch) => {
      if (companyDetails && typeof companyDetails.id === "number") {
        await updateCompanyAction(companyDetails.id, patch);
      }
    },
    successMessage: "Company updated successfully!",
    onSuccess: () => router.refresh(),
  });

  const handleOpenNotesModal = useCallback(() => {
    if (companyDetails) {
      notesLogic.openFromCompany(companyDetails as unknown as Company);
    }
  }, [companyDetails, notesLogic]);

  const notesModalController = useCompanyNotesModalController({
    isOpen: notesLogic.modalProps.isOpen,
    title: notesLogic.modalProps.title,
    notes: notesLogic.modalProps.notes,
    onChangeNotes: notesLogic.modalProps.onChangeNotes,
    onClose: notesLogic.modalProps.onClose,
    onSave: notesLogic.modalProps.onSave,
    loading: notesLogic.modalProps.loading,
  });

  const handleUpdateCompany = useCallback(
    async (params: {
      id: number;
      patch: Record<string, unknown>;
      contactIds: number[];
    }) => {
      await updateMutation.mutateAsync(params);
    },
    [updateMutation],
  );

  // Error state
  if (error || !companyDetails) {
    return (
      <EntityErrorPage
        entityType="company"
        entityId={companyId}
        error={error}
      />
    );
  }

  const currentContactIds = (companyDetails.contacts ?? []).map((c) => c.id);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <EntityDetailHeader
        title={companyDetails.name}
        actions={
          <>
            {companyDetails.isCustomer && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                Customer
              </Badge>
            )}
            {companyDetails.isClient && (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                Client
              </Badge>
            )}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Company Info + Notes */}
        <div className="space-y-6">
          <CompanyInfoSection
            company={companyDetails}
            inlineEdit={inlineEdit}
          />
          <CompanyNotesSection
            notes={Array.isArray(companyDetails.notes) ? companyDetails.notes : []}
            onOpenNotesModal={handleOpenNotesModal}
          />
        </div>

        {/* Right column: Contacts */}
        <div className="space-y-6">
          <CompanyContactsSection
            companyId={companyDetails.id}
            contacts={companyDetails.contacts ?? []}
            allContacts={contacts}
            allCompanies={companies}
            currentContactIds={currentContactIds}
            onUpdateCompany={handleUpdateCompany}
          />
        </div>
      </div>

      <EntityAttachmentsSection
        entityKind="company"
        entityId={companyDetails.id}
        attachments={companyDetails.attachments ?? []}
        onAttachmentsChange={async (newAttachments) => {
          await updateCompanyAction(companyDetails.id, { attachments: newAttachments });
          router.refresh();
        }}
      />

      {/* Notes Modal */}
      <NotesEditorModal controller={notesModalController} />
    </div>
  );
}
