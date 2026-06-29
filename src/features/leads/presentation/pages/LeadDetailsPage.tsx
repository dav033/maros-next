"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { ArrowLeft, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLeadsNotesLogic } from "../hooks/notes/useLeadsNotesLogic";
import { useLeadsNotesModalController } from "../hooks/modals/useLeadsNotesModalController";
import { EntityDetailHeader, EntityErrorPage, NotesEditorModal } from "@/components/shared";
import { getLeadTypeFromNumber, LeadType, LeadStatus, type Lead, type LeadDetails } from "@/leads/domain";
import { useInstantContacts } from "@/features/contact/presentation/hooks";
import { useProjectTypes } from "@/projectType/presentation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { leadsKeys, patchLead } from "@/leads/application";
import { useLeadsData } from "../hooks/data/useLeadsData";
import { useLeadsApp, useContactsApp, useProjectsApp } from "@/di";
import type { LeadPatch } from "@/leads/domain";
import { useContactsData } from "@/features/company/presentation/hooks";
import { patchContact, createContact, contactsKeys } from "@/contact/application";
import { ContactMode } from "@/leads/presentation";
import { toContactDraft } from "@/features/contact/domain/mappers";
import { CompanyModal } from "@/features/company/presentation/organisms/CompanyModal";
import { useContactCompanyModalController } from "@/features/contact/presentation/hooks/controllers/useContactCompanyModalController";
import { useCompanyMutations } from "@/features/company/presentation/hooks";
import { initialCompanyFormValue, toDraft as toCompanyDraft } from "@/features/company/presentation/helpers/companyFormHelpers";
import type { CompanyFormValue } from "@/features/company/presentation/molecules/CompanyForm";
import { createProject, projectsKeys } from "@/project/application";
import { useInlineEdit } from "@/common/hooks";

import { LeadInfoSection } from "./sections/LeadInfoSection";
import { LeadContactSection } from "./sections/LeadContactSection";
import { LeadAttachmentsSection } from "./sections/LeadAttachmentsSection";
import { PostConversionEstimateModal } from "../organisms/PostConversionEstimateModal";


interface LeadDetailsPageProps {
  leadId: number;
  initialData: {
    leadDetails: LeadDetails | null;
    error?: string;
  };
}

export function LeadDetailsPage({ leadId, initialData }: LeadDetailsPageProps) {
  const router = useRouter();
  const { leadDetails: initialLeadDetails, error } = initialData;
  const [leadDetails, setLeadDetails] = useState(initialLeadDetails);

  useEffect(() => {
    setLeadDetails(initialLeadDetails);
  }, [initialLeadDetails]);
  
  const leadType = leadDetails?.leadNumber 
    ? (getLeadTypeFromNumber(leadDetails.leadNumber) || LeadType.CONSTRUCTION)
    : LeadType.CONSTRUCTION;
  
  const { contacts = [] } = useInstantContacts();
  const { projectTypes = [] } = useProjectTypes();
  const queryClient = useQueryClient();
  const data = useLeadsData(leadType);
  const ctx = useLeadsApp();
  const projectsApp = useProjectsApp();
  const contactCtx = useContactsApp();
  const { companies, services } = useContactsData();
  const { createMutation: createCompanyMutation } = useCompanyMutations();

  // Project Conversion
  const [isConvertingToProject, setIsConvertingToProject] = useState(false);
  const [postConversionProjectId, setPostConversionProjectId] = useState<number | null>(null);
  const handleConvertToProject = useCallback(async () => {
    if (!leadDetails || typeof leadDetails.id !== "number") return;
    if (leadDetails.project?.id) {
      router.push(`/project/${leadDetails.project.id}`);
      return;
    }
    setIsConvertingToProject(true);
    try {
      const created = await createProject(projectsApp, { leadId: leadDetails.id });
      queryClient.setQueryData<Lead[]>(leadsKeys.byType(leadType), (oldLeads) => {
        if (!oldLeads) return oldLeads;
        return oldLeads.filter((lead) => lead.id !== leadDetails.id);
      });
      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
      queryClient.invalidateQueries({ queryKey: projectsKeys.all });
      setLeadDetails({
        ...leadDetails,
        status: LeadStatus.WON,
        project: { id: created.id },
      });
      toast.success("Lead converted to project successfully!");
      setPostConversionProjectId(created.id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Could not convert lead to project";
      toast.error(message);
    } finally {
      setIsConvertingToProject(false);
    }
  }, [leadDetails, leadType, projectsApp, queryClient, router]);

  // Lead Inline Edit
  const inlineEditLead = useInlineEdit({
    initialData: {
      name: leadDetails?.name ?? "",
      location: leadDetails?.location ?? "",
      addressLink: leadDetails?.addressLink ?? "",
      startDate: leadDetails?.startDate ?? "",
      status: leadDetails?.status ?? "",
      projectTypeId: leadDetails?.projectType?.id,
      contactId: leadDetails?.contact?.id,
      estimate: leadDetails?.estimate ?? null,
    },
    onSave: async (patch) => {
      if (leadDetails && typeof leadDetails.id === "number") {
        const updated = await patchLead(ctx, leadDetails.id, patch as unknown as LeadPatch, {});
        
        queryClient.setQueryData<Lead[]>(leadsKeys.byType(leadType), (oldLeads) => {
          if (!oldLeads) return oldLeads;
          return oldLeads.map((l) => (l.id === leadDetails.id ? updated : l));
        });
        queryClient.invalidateQueries({ queryKey: leadsKeys.all });
        await data.refetch();
        
        setLeadDetails({
          ...leadDetails,
          name: updated.name,
          location: updated.location,
          addressLink: updated.addressLink,
          startDate: updated.startDate,
          status: updated.status,
          projectType: updated.projectType,
          contact: updated.contact as LeadDetails["contact"],
          project: updated.project ?? leadDetails.project,
          estimate: updated.estimate ?? null,
        });

        const conversionProjectId = updated.conversion?.converted
          ? updated.conversion.projectId
          : undefined;
        const becameWon =
          leadDetails.status !== LeadStatus.WON &&
          updated.status === LeadStatus.WON;
        if (conversionProjectId) {
          setPostConversionProjectId(conversionProjectId);
        } else if (becameWon && updated.project?.id) {
          setPostConversionProjectId(updated.project.id);
        }
      }
    },
    successMessage: "Lead updated successfully!",
  });

  // Contact Inline Edit
  const inlineEditContact = useInlineEdit({
    initialData: {
      name: leadDetails?.contact?.name ?? "",
      phone: leadDetails?.contact?.phone ?? "",
      email: leadDetails?.contact?.email ?? "",
      address: leadDetails?.contact?.address ?? "",
      addressLink: leadDetails?.contact?.addressLink ?? "",
      role: leadDetails?.contact?.role ?? "",
      companyId: leadDetails?.contact?.company?.id ?? null,
      isCustomer: leadDetails?.contact?.isCustomer ?? false,
      isClient: leadDetails?.contact?.isClient ?? false,
    },
    onSave: async (patch) => {
      if (leadDetails?.contact && typeof leadDetails.contact.id === "number") {
        await patchContact(contactCtx, leadDetails.contact.id, patch);
        setLeadDetails({
          ...leadDetails,
          contact: {
            ...leadDetails.contact,
            ...patch,
          },
        });
      }
    },
    successMessage: "Contact updated successfully!",
  });

  // Company Modal (for contact)
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [companyFormValue, setCompanyFormValue] = useState<CompanyFormValue>(initialCompanyFormValue);
  const [companyServerError, setCompanyServerError] = useState<string | null>(null);
  const [companyAssignTarget, setCompanyAssignTarget] = useState<"existingContact" | "editingContact" | "newContactDraft">("newContactDraft");

  const openCompanyModal = useCallback((target: "existingContact" | "editingContact" | "newContactDraft") => {
    setCompanyAssignTarget(target);
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
      if (typeof createdCompanyId === "number" && createdCompanyId > 0) {
        if (companyAssignTarget === "editingContact") {
          inlineEditContact.setField("companyId", createdCompanyId);
        } else if (companyAssignTarget === "existingContact" && leadDetails?.contact?.id) {
          await patchContact(contactCtx, leadDetails.contact.id, { companyId: createdCompanyId });
        }
      }
      setIsCompanyModalOpen(false);
    } catch (error) {
      setCompanyServerError(error instanceof Error ? error.message : "Could not create company");
    }
  }, [companyFormValue, createCompanyMutation, companyAssignTarget, inlineEditContact, leadDetails, contactCtx, router]);

  const companyModalController = useContactCompanyModalController({
    isOpen: isCompanyModalOpen,
    onClose: closeCompanyModal,
    onSubmit: handleCompanySubmit,
    formValue: companyFormValue,
    onChange: setCompanyFormValue,
    isSubmitting: createCompanyMutation.isPending,
    serverError: companyServerError,
  });

  // Notes Modal
  const notesLogic = useLeadsNotesLogic({
    leadType,
    onUpdated: async (updatedLead) => {
      if (updatedLead && leadDetails) {
        setLeadDetails({ ...leadDetails, notes: updatedLead.notes || [] });
      }
    },
  });

  const notesModalController = useLeadsNotesModalController({
    isOpen: notesLogic.modalProps.isOpen,
    title: notesLogic.modalProps.title,
    notes: notesLogic.modalProps.notes,
    onChangeNotes: notesLogic.modalProps.onChangeNotes,
    onClose: notesLogic.modalProps.onClose,
    onSave: notesLogic.modalProps.onSave,
    loading: notesLogic.modalProps.loading,
  });

  // Contact Link / Remove Actions
  const handleRemoveContactFromLead = useCallback(async () => {
    if (!leadDetails || typeof leadDetails.id !== "number") return;
    try {
      const patch: LeadPatch = { contactId: 0 as number };
      const updated = await patchLead(ctx, leadDetails.id, patch, {});
      queryClient.setQueryData<Lead[]>(leadsKeys.byType(leadType), (oldLeads) => {
        if (!oldLeads) return oldLeads;
        return oldLeads.map((l) => (l.id === leadDetails.id ? updated : l));
      });
      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
      await data.refetch();
      setLeadDetails({ ...leadDetails, contact: null, contactId: null });
      toast.success("Contact removed from lead.");
    } catch (error: any) {
      toast.error(error?.message || "Could not remove contact from lead.");
    }
  }, [leadDetails, ctx, queryClient, leadType, data, router]);

  const handleLinkContactToLead = async (mode: ContactMode, contactId?: number, newContact?: any) => {
    if (!leadDetails || typeof leadDetails.id !== "number") return;
    try {
      let finalContactId: number | undefined;
      if (mode === ContactMode.EXISTING_CONTACT && contactId) {
        finalContactId = contactId;
      } else {
        const contactForm = newContact ?? {};
        const formValue = {
          name: contactForm.contactName ?? "",
          phone: contactForm.phone ?? "",
          email: contactForm.email ?? "",
          occupation: "",
          address: contactForm.address ?? leadDetails.location ?? "",
          addressLink: contactForm.addressLink ?? leadDetails.addressLink ?? "",
          isCustomer: false,
          isClient: false,
          companyId: contactForm.companyId,
        };
        const draft = toContactDraft(formValue);
        const createdContact = await createContact(contactCtx, draft);
        if (typeof createdContact.id !== "number") throw new Error("Could not create contact.");
        finalContactId = createdContact.id;
        await queryClient.invalidateQueries({ queryKey: contactsKeys.list });
      }

      const patch: LeadPatch = { contactId: finalContactId };
      const updated = await patchLead(ctx, leadDetails.id, patch, {});
      
      queryClient.setQueryData<Lead[]>(leadsKeys.byType(leadType), (oldLeads) => {
        if (!oldLeads) return oldLeads;
        return oldLeads.map((l) => (l.id === leadDetails.id ? updated : l));
      });
      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
      await data.refetch();
      
      setLeadDetails({ ...leadDetails, contact: updated.contact as LeadDetails["contact"], contactId: updated.contact?.id });
      toast.success("Contact linked successfully.");
    } catch (error: any) {
      toast.error(error?.message || "Could not link contact.");
      throw error;
    }
  };

  if (error || !leadDetails) {
    return <EntityErrorPage entityType="lead" entityId={leadId} error={error} />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <EntityDetailHeader
        title={leadDetails.name || "No name"}
        subtitle={leadDetails.projectType?.name}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleConvertToProject}
              disabled={isConvertingToProject}
            >
              <FolderPlus className="size-4 mr-2" />
              {isConvertingToProject ? "Converting..." : leadDetails.project?.id ? "Go to Project" : "Convert to Project"}
            </Button>
            {leadDetails.status && <Badge variant="outline">{leadDetails.status}</Badge>}
            {leadDetails.inReview && <Badge variant="secondary">In Review</Badge>}
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <LeadInfoSection
            lead={leadDetails}
            projectTypes={projectTypes}
            inlineEdit={inlineEditLead}
            onOpenNotesModal={() => notesLogic.openFromLead(leadDetails as unknown as Lead)}
          />
        </div>

        <div className="space-y-6">
          <LeadContactSection
            contact={leadDetails.contact ?? null}
            companies={companies || []}
            contacts={contacts}
            inlineEdit={inlineEditContact}
            leadLocation={leadDetails.location || undefined}
            leadAddressLink={leadDetails.addressLink || undefined}
            onOpenCompanyModal={openCompanyModal}
            onRemoveContact={handleRemoveContactFromLead}
            onLinkContact={handleLinkContactToLead}
          />
        </div>
      </div>

      <LeadAttachmentsSection
        leadId={leadDetails.id}
        attachments={leadDetails.attachments ?? []}
        onAttachmentsChange={async (newAttachments) => {
          if (leadDetails && typeof leadDetails.id === "number") {
            await patchLead(ctx, leadDetails.id, { attachments: newAttachments }, {});
            setLeadDetails({ ...leadDetails, attachments: newAttachments });
          }
        }}
      />

      <CompanyModal
        controller={companyModalController}
        services={services ?? []}
        contacts={[]}
      />
      
      <NotesEditorModal controller={notesModalController} />

      {postConversionProjectId !== null && (
        <PostConversionEstimateModal
          open
          onClose={() => setPostConversionProjectId(null)}
          projectId={postConversionProjectId}
          leadName={leadDetails.name ?? undefined}
          contactEmail={leadDetails.contact?.email ?? undefined}
        />
      )}
    </div>
  );
}
