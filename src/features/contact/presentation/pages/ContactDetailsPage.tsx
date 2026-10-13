"use client";

import { useCallback, useState } from "react";
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyModal } from "@/features/company/presentation/organisms/CompanyModal";
import { useContactCompanyModalController } from "../hooks/controllers/useContactCompanyModalController";
import { useCompanyMutations } from "@/features/company/presentation/hooks";
import { useContactMutations } from "../hooks/mutations/useContactMutations";
import { useContactCacheInvalidation } from "../hooks/mutations/useContactCacheInvalidation";
import { initialCompanyFormValue, toDraft as toCompanyDraft } from "@/features/company/presentation/helpers/companyFormHelpers";
import type { CompanyFormValue } from "@/features/company/presentation/molecules/CompanyForm";
import { useContactsNotesLogic } from "../hooks/notes/useContactsNotesLogic";
import { useContactsNotesModalController } from "../hooks/notes/useContactsNotesModalController";
import { NotesEditorModal, EntityDetailHeader, EntityErrorPage } from "@/components/shared";
import { useContactsData } from "@/features/company/presentation/hooks";
import { useContactsApp } from "@/di";
import { patchContact } from "@/contact/application";
import { LeadModal } from "@/features/leads/presentation/organisms/LeadModal";
import { useLeadModalController } from "@/features/leads/presentation/hooks/modals/useLeadModalController";
import { useLeadCreateModal } from "@/features/leads/presentation/hooks/modals/useLeadCreateModal";
import { useProjectTypes } from "@/projectType/presentation";
import { LeadType } from "@/leads/domain";
import type { ContactDetails } from "@/contact/domain";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useInlineEdit } from "@/common/hooks";
import { ContactInfoSection } from "./sections/ContactInfoSection";
import { ContactNotesSection } from "./sections/ContactNotesSection";
import { ContactLeadsSection } from "./sections/ContactLeadsSection";
import { EntityAttachmentsSection } from "@/features/attachments/presentation/EntityAttachmentsSection";
import { EntityNotesSection } from "@/features/notes/presentation/organisms/EntityNotesSection";
import { EntityTasksSection } from "@/features/tasks/presentation/organisms/EntityTasksSection";


export type ContactDetailsView = Omit<ContactDetails, "leads" | "stats"> & Partial<Pick<ContactDetails, "leads" | "stats">>;

interface ContactDetailsPageProps {
  contactId: number;
  initialData: {
    contactDetails: ContactDetailsView | null;
    error?: string;
  };
  relationsError?: string;
  onRetry?: () => void;
}

function ContactStatCard({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  return (
    <Card>
      <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
        <CardDescription className="text-xs sm:text-sm">{label}</CardDescription>
        <CardTitle className="font-mono text-xl tabular-nums sm:text-2xl">{value ?? <Skeleton className="h-8 w-12" />}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function ContactDetailsPage({ contactId, initialData, relationsError, onRetry }: ContactDetailsPageProps) {
  const refreshContact = useContactCacheInvalidation();
  const { contactDetails, error } = initialData;
  
  // Data hooks
  const data = useContactsData();
  const { companies, services } = data;
  const {
    projectTypes = [],
    isLoading: projectTypesLoading,
    isFetching: projectTypesFetching,
    error: projectTypesError,
    refetch: refetchProjectTypes,
  } = useProjectTypes();
  const { contacts = [] } = data;
  
  // Notes logic
  const notesLogic = useContactsNotesLogic({
    onSuccess: refreshContact,
  });
  const app = useContactsApp();
  
  // Lead creation modal
  const leadCreateModal = useLeadCreateModal({
    leadType: LeadType.CONSTRUCTION,
    onCreated: async () => {
      // Invalidation handled by mutations
    },
  });
  
  const { controller: leadModalController, contactsForModal } = useLeadModalController({
    isCreateModalOpen: leadCreateModal.isOpen,
    isEditModalOpen: false,
    closeCreateModal: leadCreateModal.close,
    closeEditModal: () => {},
    createController: leadCreateModal.createController,
    updateController: undefined,
    selectedLead: null,
    contacts: contacts,
  });

  const inlineEdit = useInlineEdit({
    initialData: {
      name: contactDetails?.name ?? "",
      phone: contactDetails?.phone ?? "",
      email: contactDetails?.email ?? "",
      address: contactDetails?.address ?? "",
      addressLink: contactDetails?.addressLink ?? "",
      role: contactDetails?.role ?? "",
      companyId: contactDetails?.company?.id ?? null,
      isCustomer: contactDetails?.isCustomer ?? false,
      isClient: contactDetails?.isClient ?? false,
    },
    onSave: async (patch) => {
      if (contactDetails && typeof contactDetails.id === "number") {
        await patchContact(app, contactDetails.id, patch);
      }
    },
    successMessage: "Contact updated successfully!",
    onSuccess: refreshContact,
  });
  
  // Company modal state
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyFormValue, setCompanyFormValue] = useState<CompanyFormValue>(initialCompanyFormValue);
  const [companyServerError, setCompanyServerError] = useState<string | null>(null);
  
  // Hooks
  const { createMutation: createCompanyMutation } = useCompanyMutations();
  const { updateContactMutation } = useContactMutations();
  
  const openCompanyModal = useCallback(() => {
    setCompanyFormValue(initialCompanyFormValue);
    setCompanyServerError(null);
    setIsCompanyModalOpen(true);
  }, []);
  
  const closeCompanyModal = useCallback(() => {
    if (createCompanyMutation.isPending || updateContactMutation.isPending) return;
    setIsCompanyModalOpen(false);
    setCompanyServerError(null);
    setCompanyFormValue(initialCompanyFormValue);
  }, [createCompanyMutation.isPending, updateContactMutation.isPending]);
  
  const handleCompanySubmit = useCallback(async () => {
    const draft = toCompanyDraft(companyFormValue);
    
    if (!draft.name) {
      setCompanyServerError("Name is required");
      return;
    }
    
    try {
      await createCompanyMutation.mutateAsync({ 
        draft,
        contactIds: [contactId]
      });
      setIsCompanyModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create company";
      setCompanyServerError(message);
    }
  }, [companyFormValue, createCompanyMutation, contactId]);
  
  const handleOpenNotesModal = useCallback(() => {
    if (contactDetails) {
      notesLogic.openFromContact(contactDetails);
    }
  }, [contactDetails, notesLogic]);
  
  const companyModalController = useContactCompanyModalController({
    isOpen: isCompanyModalOpen,
    onClose: closeCompanyModal,
    onSubmit: handleCompanySubmit,
    formValue: companyFormValue,
    onChange: setCompanyFormValue,
    isSubmitting: createCompanyMutation.isPending || updateContactMutation.isPending,
    serverError: companyServerError,
  });
  
  const notesModalController = useContactsNotesModalController({
    isOpen: notesLogic.modalProps.isOpen,
    title: notesLogic.modalProps.title,
    notes: notesLogic.modalProps.notes,
    onChangeNotes: notesLogic.modalProps.onChangeNotes,
    onClose: notesLogic.modalProps.onClose,
    onSave: notesLogic.modalProps.onSave,
    loading: notesLogic.modalProps.loading,
  });

  if (error || !contactDetails) {
    return <EntityErrorPage entityType="contact" entityId={contactId} error={error} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <EntityDetailHeader
        title={contactDetails.name}
        sharedNameLayoutId={`maros-contact-name-${contactDetails.id}`}
        actions={
          <>
            {contactDetails.isCustomer && (
              <Badge variant="secondary">Customer</Badge>
            )}
            {contactDetails.isClient && (
              <Badge variant="secondary">Supplier</Badge>
            )}
          </>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <ContactStatCard label="Total Leads" value={contactDetails.stats?.totalLeads} />
        <ContactStatCard label="Total Projects" value={contactDetails.stats?.totalProjects} />
        <ContactStatCard label="Active Projects" value={contactDetails.stats?.activeProjects} />
        <ContactStatCard label="Completed Projects" value={contactDetails.stats?.completedProjects} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Information and Notes */}
        <div className="space-y-6">
          <ContactInfoSection
            contact={contactDetails}
            companies={companies || []}
            inlineEdit={inlineEdit}
            onOpenCompanyModal={openCompanyModal}
          />

          <ContactNotesSection
            notes={contactDetails.notes}
            onOpenNotesModal={handleOpenNotesModal}
          />
        </div>

        {/* Right Column: Leads and Projects */}
        <div className="space-y-6">
          {relationsError ? <div role="alert" className="space-y-2 text-sm text-destructive"><p>{relationsError}</p><Button variant="outline" onClick={onRetry}>Retry</Button></div> : null}
          {contactDetails.leads ? <ContactLeadsSection
            leads={contactDetails.leads}
            onCreateLead={() => {
              if (contactId) {
                leadCreateModal.createController.setField("contactId", contactId);
                leadCreateModal.createController.setContactMode(leadCreateModal.createController.ContactMode.EXISTING_CONTACT);
              }
              leadCreateModal.open();
            }}
          /> : !relationsError ? <Skeleton className="h-48 w-full rounded-xl" /> : null}
        </div>
      </div>
      
      {/* Modals */}
      <CompanyModal
        controller={companyModalController}
        services={services ?? []}
        contacts={[]}
      />
      
      <NotesEditorModal controller={notesModalController} />
      
      <LeadModal
        controller={leadModalController}
        contacts={contactsForModal}
        projectTypes={projectTypes}
        projectTypesLoading={projectTypesLoading}
        projectTypesFetching={projectTypesFetching}
        projectTypesError={projectTypesError}
        onRetryProjectTypes={() => void refetchProjectTypes()}
      />

      <EntityAttachmentsSection
        entityKind="contact"
        entityId={contactDetails.id}
        attachments={contactDetails.attachments ?? []}
        onAttachmentsChange={async (newAttachments) => {
          await patchContact(app, contactDetails.id, { attachments: newAttachments });
          refreshContact();
        }}
      />

      <EntityNotesSection
        entityKind="contact"
        entityId={contactDetails.id}
        defaultTitle={contactDetails.name || undefined}
      />

      <EntityTasksSection
        entityKind="contact"
        entityId={contactDetails.id}
        partyKind="contact"
        partyId={contactDetails.id}
        entityLabel={contactDetails.name}
      />
    </div>
  );
}
