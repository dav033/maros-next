"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { ArrowLeft, FolderTree, User, Phone, Mail, MapPin, Building, Receipt, StickyNote, DollarSign, Edit, Plus, Save, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useProjectsNotesLogic } from "../hooks/notes/useProjectsNotesLogic";
import { useProjectsNotesModalController } from "../hooks/modals/useProjectsNotesModalController";
import { NotesEditorModal, DetailField } from "@/components/shared";
import { ProjectForm } from "../molecules/ProjectForm";
import { useProjectsApp } from "@/di";
import { updateProject } from "@/project/application";
import type { ProjectPatch } from "@/project/domain";
import { updateLeadNameAction } from "@/features/leads/actions/leadActions";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils";
import { ContactModal } from "@/features/contact/presentation/organisms/ContactModal";
import { useContactModalController } from "@/features/contact/presentation/hooks/controllers/useContactModalController";
import { useContactMutations, initialContactFormValue } from "@/features/contact/presentation/hooks/mutations/useContactMutations";
import { useInstantCompanies } from "@/features/company/presentation/hooks";
import type { ContactFormValue } from "@/contact/domain";
import { toContactPatch } from "@/contact/domain";
import type { Contact as DomainContact } from "@/contact/domain";
import { EntityAttachmentsSection } from "@/features/attachments/presentation/EntityAttachmentsSection";

interface ProjectDetails {
  id: number;
  projectProgressStatus?: string;
  invoiceStatus?: string;
  attachments?: string[];
  financial?: {
    estimatedAmount?: number;
    paidAmount?: number;
    outstandingAmount?: number;
    payments?: Array<{
      id?: string;
      date?: string;
      amount: number;
      method?: string;
      reference?: string;
      linkedInvoice?: string;
    }>;
  } | null;
  overview?: string;
  notes?: string[];
  lead?: {
    id: number;
    leadNumber?: string;
    name?: string;
    startDate?: string;
    location?: string;
    addressLink?: string;
    status?: string;
    notes?: string[];
    inReview: boolean;
    contact?: {
      id: number;
      name: string;
      phone?: string;
      email?: string;
      occupation?: string;
      address?: string;
      addressLink?: string;
      isCustomer: boolean;
      isClient: boolean;
      company?: {
        id: number;
        name: string;
        address?: string;
        type: any;
        serviceId?: number;
        isCustomer: boolean;
        isClient: boolean;
      } | null;
    } | null;
    projectType?: {
      id: number;
      name: string;
    } | null;
  } | null;
}

interface ProjectDetailsPageProps {
  projectId: number;
  initialData: {
    projectDetails: ProjectDetails | null;
    error?: string;
  };
}

type ProjectFormData = {
  projectProgressStatus?: string;
  overview?: string;
  notes?: string[];
  leadId?: number;
  leadName?: string;
  leadNumber?: string;
};

type Payment = NonNullable<NonNullable<ProjectDetails["financial"]>["payments"]>[number];
type Contact = NonNullable<NonNullable<ProjectDetails["lead"]>["contact"]>;

function ProjectEditFormWithLeads({
  form,
  onChange,
  disabled,
}: {
  form: ProjectFormData;
  onChange: (key: string, value: any) => void;
  disabled: boolean;
}) {
  return (
    <ProjectForm
      form={form}
      onChange={onChange}
      leads={[]}
      disabled={disabled}
      isEditMode
    />
  );
}

function PaymentsTable({ payments }: { payments: Payment[] }) {
  if (!payments.length) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-md border border-dashed border-muted-foreground/30">
        <DollarSign className="size-4 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">Payments List</p>
          <p className="text-xs text-muted-foreground">No payment rows received from QuickBooks</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border">
      <div className="max-h-64 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Date</th>
              <th className="px-3 py-2 text-left font-medium">Method</th>
              <th className="px-3 py-2 text-left font-medium">Reference</th>
              <th className="px-3 py-2 text-left font-medium">Invoice</th>
              <th className="px-3 py-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={payment.id ?? `${index}-${payment.amount}`} className="border-t">
                <td className="px-3 py-2">{payment.date || "-"}</td>
                <td className="px-3 py-2">{payment.method || "-"}</td>
                <td className="px-3 py-2">{payment.reference || "-"}</td>
                <td className="px-3 py-2">{payment.linkedInvoice || "-"}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(payment.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProjectContactCard({ contact, onEdit }: { contact: Contact; onEdit: () => void }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="size-5" />
          Contact
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="text-muted-foreground hover:text-foreground"
        >
          <Edit className="size-4 mr-2" />
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Link
            href={`/contact/${contact.id}`}
            className="text-lg font-semibold text-foreground hover:underline"
          >
            {contact.name}
          </Link>
          {contact.occupation && (
            <p className="text-sm text-muted-foreground mt-1">{contact.occupation}</p>
          )}
        </div>
        <DetailField
          icon={Phone}
          label="Phone"
          value={contact.phone}
          onAdd={onEdit}
        />
        <DetailField
          icon={Mail}
          label="Email"
          value={contact.email}
          isEmail
          onAdd={onEdit}
        />
        <DetailField
          icon={MapPin}
          label="Address"
          value={contact.address}
          onAdd={onEdit}
        />
        <DetailField
          icon={Building}
          label="Company"
          value={contact.company?.name}
          onAdd={onEdit}
        >
          {contact.company && (
            <Link
              href={`/company/${contact.company.id}`}
              className="text-foreground hover:underline"
            >
              {contact.company.name}
            </Link>
          )}
        </DetailField>
        <div className="flex items-center gap-2 pt-2">
          {contact.isCustomer && <Badge variant="secondary">Customer</Badge>}
          {contact.isClient && <Badge variant="secondary">Client</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}

export function ProjectDetailsPage({ projectId, initialData }: ProjectDetailsPageProps) {
  const router = useRouter();
  const { projectDetails, error } = initialData;
  const app = useProjectsApp();
  const { companies } = useInstantCompanies();
  const { updateContactMutation } = useContactMutations();

  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectFormData>({});
  const [isSavingProject, setIsSavingProject] = useState(false);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactFormValue, setContactFormValue] = useState<ContactFormValue>(initialContactFormValue);
  const [contactFormError, setContactFormError] = useState<string | null>(null);

  const handleStartEditingName = useCallback(() => {
    setEditingName(projectDetails?.lead?.name ?? "");
    setIsEditingName(true);
  }, [projectDetails]);

  const handleSaveName = useCallback(async () => {
    const leadId = projectDetails?.lead?.id;
    if (!leadId || !editingName.trim()) return;
    setIsSavingName(true);
    try {
      const result = await updateLeadNameAction(leadId, editingName);
      if (!result.success) throw new Error(result.error);
      setIsEditingName(false);
      toast.success("Project name updated!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update name");
    } finally {
      setIsSavingName(false);
    }
  }, [projectDetails, editingName, router]);

  const notesLogic = useProjectsNotesLogic({
    refetch: async () => {
      router.refresh();
    },
  });

  const handleStartEditingProject = useCallback(() => {
    if (projectDetails) {
      setEditingProject({
        projectProgressStatus: projectDetails.projectProgressStatus,
        overview: projectDetails.overview ?? "",
        notes: projectDetails.notes,
        leadId: projectDetails.lead?.id,
        leadName: projectDetails.lead?.name,
        leadNumber: projectDetails.lead?.leadNumber,
      });
      setIsEditingProject(true);
    }
  }, [projectDetails]);

  const handleCancelEditingProject = useCallback(() => {
    setIsEditingProject(false);
    setEditingProject({});
  }, []);

  const handleSaveProjectInline = useCallback(async () => {
    if (!projectDetails || typeof projectDetails.id !== "number") return;

    setIsSavingProject(true);
    try {
      const patch: ProjectPatch = {
        projectProgressStatus: editingProject.projectProgressStatus as ProjectPatch["projectProgressStatus"],
        overview: editingProject.overview?.trim() || undefined,
        notes: editingProject.notes,
        leadId: editingProject.leadId ?? projectDetails.lead?.id,
        leadName: editingProject.leadName?.trim() || undefined,
        leadNumber: editingProject.leadNumber?.trim() || undefined,
      };

      await updateProject(app, projectDetails.id, patch);
      setIsEditingProject(false);
      setEditingProject({});
      toast.success("Project updated successfully!");
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update project";
      toast.error(message);
    } finally {
      setIsSavingProject(false);
    }
  }, [projectDetails, editingProject, app, router]);

  const handleOpenNotesModal = useCallback(() => {
    if (projectDetails && projectDetails.lead) {
      const projectWithLead = {
        ...projectDetails,
        lead: {
          ...projectDetails.lead,
          name: projectDetails.lead.name || "Project",
        },
      };
      notesLogic.openFromProject(projectWithLead as any);
    }
  }, [projectDetails, notesLogic]);

  const notesModalController = useProjectsNotesModalController({
    isOpen: notesLogic.modalProps.isOpen,
    title: notesLogic.modalProps.title,
    notes: notesLogic.modalProps.notes,
    onChangeNotes: notesLogic.modalProps.onChangeNotes,
    onClose: notesLogic.modalProps.onClose,
    onSave: notesLogic.modalProps.onSave,
    loading: notesLogic.modalProps.loading,
  });

  const handleOpenEditContact = useCallback(() => {
    const contact = projectDetails?.lead?.contact;
    if (!contact) return;
    setContactFormValue({
      name: contact.name ?? "",
      phone: contact.phone ?? "",
      email: contact.email ?? "",
      occupation: contact.occupation ?? "",
      role: undefined,
      addressLink: contact.addressLink ?? "",
      address: contact.address ?? "",
      isCustomer: contact.isCustomer,
      isClient: contact.isClient,
      companyId: contact.company?.id ?? null,
      note: "",
    });
    setContactFormError(null);
    setIsEditingContact(true);
  }, [projectDetails]);

  const handleCloseEditContact = useCallback(() => {
    if (updateContactMutation.isPending) return;
    setIsEditingContact(false);
    setContactFormError(null);
  }, [updateContactMutation.isPending]);

  const handleSubmitEditContact = useCallback(async () => {
    const contact = projectDetails?.lead?.contact;
    if (!contact) return;
    setContactFormError(null);
    try {
      const currentForPatch = {
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        occupation: contact.occupation,
        address: contact.address,
        addressLink: contact.addressLink,
        isCustomer: contact.isCustomer,
        isClient: contact.isClient,
        companyId: contact.company?.id ?? null,
      } as unknown as DomainContact;
      const patch = toContactPatch(currentForPatch, contactFormValue);
      await updateContactMutation.mutateAsync({ id: contact.id, patch });
      setIsEditingContact(false);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update contact";
      setContactFormError(message);
    }
  }, [projectDetails, contactFormValue, updateContactMutation, router]);

  const contactModalController = useContactModalController({
    mode: isEditingContact ? "edit" : "list",
    closeModal: handleCloseEditContact,
    handleCreateSubmit: () => {},
    handleEditSubmit: handleSubmitEditContact,
    formValue: contactFormValue,
    handleFormChange: setContactFormValue,
    isPending: updateContactMutation.isPending,
    serverError: contactFormError,
  });

  if (error || !projectDetails) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error loading project</CardTitle>
            <CardDescription>
              {error || "Could not load project information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Project with ID {projectId} does not exist or could not be found.
              Please verify that the ID is correct.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lead = projectDetails.lead;
  const paymentRows = projectDetails.financial?.payments ?? [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Project {lead?.leadNumber && `#${lead.leadNumber}`}
            </h1>
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveName();
                    if (e.key === "Escape") setIsEditingName(false);
                  }}
                  className="h-7 text-sm w-64"
                  disabled={isSavingName}
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={handleSaveName} disabled={isSavingName || !editingName.trim()}>
                  <Save className="size-3.5" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditingName(false)} disabled={isSavingName}>
                  <X className="size-3.5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-1 group">
                <p className="text-muted-foreground">{lead?.name ?? "Unnamed project"}</p>
                {lead?.id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleStartEditingName}
                  >
                    <Edit className="size-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {projectDetails.projectProgressStatus && (
            <Badge variant="outline">{projectDetails.projectProgressStatus}</Badge>
          )}
          {projectDetails.invoiceStatus && (
            <Badge variant="outline">{projectDetails.invoiceStatus}</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="size-5" />
                Project Information
              </CardTitle>
              {isEditingProject ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEditingProject}
                    disabled={isSavingProject}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveProjectInline}
                    disabled={isSavingProject}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Save className="size-4 mr-2" />
                    {isSavingProject ? "Saving..." : "Save"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEditingProject}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit className="size-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingProject ? (
                <ProjectEditFormWithLeads
                  form={editingProject}
                  onChange={(key, value) => setEditingProject((prev) => ({ ...prev, [key]: value }))}
                  disabled={isSavingProject}
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField
                      icon={Receipt}
                      label="Estimate Amount"
                      value={projectDetails.financial?.estimatedAmount}
                    >
                      {typeof projectDetails.financial?.estimatedAmount === "number" ? (
                        <p className="font-semibold text-lg">
                          {formatCurrency(projectDetails.financial.estimatedAmount)}
                        </p>
                      ) : null}
                    </DetailField>

                    <DetailField
                      icon={DollarSign}
                      label="Payments"
                      value={projectDetails.financial?.paidAmount}
                    >
                      {typeof projectDetails.financial?.paidAmount === "number" ? (
                        <p className="font-semibold text-lg">
                          {formatCurrency(projectDetails.financial.paidAmount)}
                        </p>
                      ) : null}
                    </DetailField>
                  </div>

                  <Separator />
                  <div>
                    <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                      <DollarSign className="size-3" />
                      Payments List (QuickBooks)
                    </p>
                    <PaymentsTable payments={paymentRows} />
                  </div>

                  <Separator />
                  <DetailField
                    icon={FileText}
                    label="Project Overview"
                    value={projectDetails.overview}
                    onAdd={handleStartEditingProject}
                  />

                  <Separator />
                  <DetailField
                    icon={StickyNote}
                    label="Notes"
                    value={projectDetails.notes && projectDetails.notes.length > 0 ? "has-notes" : undefined}
                    onAdd={handleOpenNotesModal}
                  >
                    {projectDetails.notes && projectDetails.notes.length > 0 ? (
                      <ul className="space-y-1 mt-1">
                        {projectDetails.notes.map((note, index) => (
                          <li key={index} className="text-sm text-foreground">
                            • {note}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </DetailField>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          {lead?.contact ? (
            <ProjectContactCard
              contact={lead.contact}
              onEdit={handleOpenEditContact}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  Contact
                </CardTitle>
                <CardDescription>
                  This project has no associated contact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/contacts?create`)}
                  className="w-full"
                >
                  <Plus className="size-4 mr-2" />
                  Create Contact
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <EntityAttachmentsSection
        entityKind="project"
        entityId={projectDetails.id}
        attachments={projectDetails.attachments ?? []}
        onAttachmentsChange={async (newAttachments) => {
          await updateProject(app, projectDetails.id, { attachments: newAttachments });
          router.refresh();
        }}
      />

      <NotesEditorModal controller={notesModalController} />

      <ContactModal
        controller={contactModalController}
        companies={companies ?? []}
      />
    </div>
  );
}
