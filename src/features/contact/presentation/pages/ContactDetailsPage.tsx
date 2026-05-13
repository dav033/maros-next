"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyModal } from "@/features/company/presentation/organisms/CompanyModal";
import { useContactCompanyModalController } from "../hooks/controllers/useContactCompanyModalController";
import { useCompanyMutations } from "@/features/company/presentation/hooks";
import { useContactMutations } from "../hooks/mutations/useContactMutations";
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
import { useInlineEdit } from "@/common/hooks";
import { ContactInfoSection } from "./sections/ContactInfoSection";
import { ContactNotesSection } from "./sections/ContactNotesSection";
import { ContactLeadsSection } from "./sections/ContactLeadsSection";


interface ContactDetailsPageProps {
  contactId: number;
  initialData: {
    contactDetails: ContactDetails | null;
    error?: string;
  };
}

export function ContactDetailsPage({ contactId, initialData }: ContactDetailsPageProps) {
  const router = useRouter();
  const { contactDetails, error } = initialData;
  
  // Data hooks
  const data = useContactsData();
  const { companies, services } = data;
  const { projectTypes = [] } = useProjectTypes();
  const { contacts = [] } = data;
  
  // Notes logic
  const notesLogic = useContactsNotesLogic();
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
  }, [companyFormValue, createCompanyMutation, contactId, router]);
  
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-2xl">{contactDetails.stats.totalLeads}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Projects</CardDescription>
            <CardTitle className="text-2xl">{contactDetails.stats.totalProjects}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Projects</CardDescription>
            <CardTitle className="text-2xl">{contactDetails.stats.activeProjects}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed Projects</CardDescription>
            <CardTitle className="text-2xl">{contactDetails.stats.completedProjects}</CardTitle>
          </CardHeader>
        </Card>
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
          <ContactLeadsSection
            leads={contactDetails.leads}
            onCreateLead={() => {
              if (contactId) {
                leadCreateModal.createController.setField("contactId", contactId);
                leadCreateModal.createController.setContactMode(leadCreateModal.createController.ContactMode.EXISTING_CONTACT);
              }
              leadCreateModal.open();
            }}
          />
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
      />
    </div>
  );
}
