"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { ArrowLeft, FolderTree, User, Phone, Mail, MapPin, Building, TrendingUp, Receipt, StickyNote, DollarSign, Edit, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ProjectModal } from "../organisms/ProjectModal";
import { useProjectEditModal } from "../hooks/modals/useProjectEditModal";
import { useProjectsNotesLogic } from "../hooks/notes/useProjectsNotesLogic";
import { useProjectsNotesModalController } from "../hooks/modals/useProjectsNotesModalController";
import { NotesEditorModal } from "@/components/shared";
import { useInstantLeadsByType } from "@/leads/presentation";
import { LeadType } from "@/leads/domain";
import { ProjectForm } from "../molecules/ProjectForm";
import { useProjectsApp } from "@/di";
import { updateProject } from "@/project/application";
import type { ProjectPatch } from "@/project/domain";
import { toast } from "sonner";

interface ProjectDetails {
  id: number;
  invoiceAmount?: number;
  payments?: number[];
  projectProgressStatus?: string;
  invoiceStatus?: string;
  quickbooks?: boolean;
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
  invoiceAmount?: number;
  payments?: number[];
  projectProgressStatus?: string;
  invoiceStatus?: string;
  quickbooks?: boolean;
  overview?: string;
  notes?: string[];
  leadId?: number;
};

export function ProjectDetailsPage({ projectId, initialData }: ProjectDetailsPageProps) {
  const router = useRouter();
  const { projectDetails, error } = initialData;
  const app = useProjectsApp();

  // Estado para edición inline del proyecto
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectFormData>({});
  const [isSavingProject, setIsSavingProject] = useState(false);

  // Data for modals
  const constructionLeads = useInstantLeadsByType(LeadType.CONSTRUCTION);
  const plumbingLeads = useInstantLeadsByType(LeadType.PLUMBING);
  const roofingLeads = useInstantLeadsByType(LeadType.ROOFING);
  const leads = [
    ...(constructionLeads.leads ?? []),
    ...(plumbingLeads.leads ?? []),
    ...(roofingLeads.leads ?? []),
  ];

  // Edit modal (mantenido por si se usa desde otro flujo)
  const editModal = useProjectEditModal({
    onUpdated: async () => {
      router.refresh();
    },
  });

  // Notes logic
  const notesLogic = useProjectsNotesLogic();

  const handleStartEditingProject = useCallback(() => {
    if (projectDetails) {
      setEditingProject({
        invoiceAmount: projectDetails.invoiceAmount,
        payments: projectDetails.payments,
        projectProgressStatus: projectDetails.projectProgressStatus,
        invoiceStatus: projectDetails.invoiceStatus,
        quickbooks: projectDetails.quickbooks,
        overview: projectDetails.overview ?? "",
        notes: projectDetails.notes,
        leadId: projectDetails.lead?.id,
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
        invoiceAmount: editingProject.invoiceAmount,
        payments: editingProject.payments,
        projectProgressStatus: editingProject.projectProgressStatus as ProjectPatch["projectProgressStatus"],
        invoiceStatus: editingProject.invoiceStatus as ProjectPatch["invoiceStatus"],
        quickbooks: editingProject.quickbooks,
        overview: editingProject.overview?.trim() || undefined,
        notes: editingProject.notes,
        leadId: editingProject.leadId ?? projectDetails.lead?.id,
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

  const handleEditProject = useCallback(() => {
    handleStartEditingProject();
  }, [handleStartEditingProject]);

  const handleOpenNotesModal = useCallback(() => {
    if (projectDetails && projectDetails.lead) {
      // Create a project object with lead for the notes modal
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
  
  const projectModalController = {
    isOpen: editModal.isOpen,
    mode: "edit" as const,
    onClose: editModal.close,
    createController: undefined,
    updateController: editModal.updateController,
    project: editModal.selectedProject,
  };
  
  const notesModalController = useProjectsNotesModalController({
    isOpen: notesLogic.modalProps.isOpen,
    title: notesLogic.modalProps.title,
    notes: notesLogic.modalProps.notes,
    onChangeNotes: notesLogic.modalProps.onChangeNotes,
    onClose: notesLogic.modalProps.onClose,
    onSave: notesLogic.modalProps.onSave,
    loading: notesLogic.modalProps.loading,
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
            {lead?.name && (
              <p className="text-muted-foreground mt-1">{lead.name}</p>
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
                  onClick={handleEditProject}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit className="size-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingProject ? (
                <ProjectForm
                  form={editingProject}
                  onChange={(key, value) => setEditingProject((prev) => ({ ...prev, [key]: value }))}
                  leads={leads}
                  disabled={isSavingProject}
                  isEditMode
                />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {projectDetails.invoiceAmount ? (
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Receipt className="size-3" />
                          Invoice Amount
                        </p>
                        <p className="text-foreground font-semibold text-lg">
                          ${projectDetails.invoiceAmount.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                        <div className="flex items-center gap-3">
                          <Receipt className="size-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Invoice Amount</p>
                            <p className="text-xs text-muted-foreground">Not available</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEditProject}
                        >
                          <Plus className="size-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    )}
                    {projectDetails.quickbooks !== undefined ? (
                      <div>
                        <p className="text-sm text-muted-foreground">In QuickBooks</p>
                        <Badge variant={projectDetails.quickbooks ? "default" : "outline"}>
                          {projectDetails.quickbooks ? "Yes" : "No"}
                        </Badge>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                        <div>
                          <p className="text-sm text-muted-foreground">In QuickBooks</p>
                          <p className="text-xs text-muted-foreground">Not available</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEditProject}
                        >
                          <Plus className="size-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    )}
                    {projectDetails.payments && projectDetails.payments.length > 0 ? (
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                          <DollarSign className="size-3" />
                          Payments
                        </p>
                        <div className="space-y-1">
                          {projectDetails.payments.map((payment, index) => (
                            <p key={index} className="text-foreground">
                              ${payment.toLocaleString()}
                            </p>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="col-span-2 flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                        <div className="flex items-center gap-3">
                          <DollarSign className="size-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Payments</p>
                            <p className="text-xs text-muted-foreground">No payments recorded</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEditProject}
                        >
                          <Plus className="size-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    )}
                  </div>

                  {projectDetails.overview ? (
                    <>
                      <Separator />
                      <div>
                        <p className="text-muted-foreground text-sm mb-1">Project Overview</p>
                        <p className="text-foreground">{projectDetails.overview}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                        <div>
                          <p className="text-sm text-muted-foreground">Project Overview</p>
                          <p className="text-xs text-muted-foreground">Not available</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEditProject}
                        >
                          <Plus className="size-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </>
                  )}

                  {projectDetails.notes && projectDetails.notes.length > 0 ? (
                    <>
                      <Separator />
                      <div>
                        <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                          <StickyNote className="size-3" />
                          Notes
                        </p>
                        <ul className="space-y-1">
                          {projectDetails.notes.map((note, index) => (
                            <li key={index} className="text-sm text-foreground">
                              • {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                        <div className="flex items-center gap-3">
                          <StickyNote className="size-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Notes</p>
                            <p className="text-xs text-muted-foreground">No notes</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleOpenNotesModal}
                        >
                          <Plus className="size-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    </>
                  )}
                </>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-6">
          {lead?.contact ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  Contacto
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/contact/${lead.contact!.id}`)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit className="size-4 mr-2" />
                  Editar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Link
                    href={`/contact/${lead.contact.id}`}
                    className="text-lg font-semibold text-foreground hover:underline"
                  >
                    {lead.contact.name}
                  </Link>
                  {lead.contact.occupation && (
                    <p className="text-sm text-muted-foreground mt-1">{lead.contact.occupation}</p>
                  )}
                </div>
                {lead.contact.phone ? (
                  <div className="flex items-start gap-3">
                    <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="text-foreground">{lead.contact.phone}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                    <div className="flex items-center gap-3">
                      <Phone className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-xs text-muted-foreground">Not available</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/contact/${lead.contact!.id}`)}
                    >
                      <Plus className="size-3 mr-1" />
                      Add
                    </Button>
                  </div>
                )}
                {lead.contact.email ? (
                  <div className="flex items-start gap-3">
                    <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a href={`mailto:${lead.contact.email}`} className="text-foreground hover:underline">
                        {lead.contact.email}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                    <div className="flex items-center gap-3">
                      <Mail className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="text-xs text-muted-foreground">Not available</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/contact/${lead.contact!.id}`)}
                    >
                      <Plus className="size-3 mr-1" />
                      Add
                    </Button>
                  </div>
                )}
                {lead.contact.address ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-foreground">{lead.contact.address}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                    <div className="flex items-center gap-3">
                      <MapPin className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="text-xs text-muted-foreground">Not available</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/contact/${lead.contact!.id}`)}
                    >
                      <Plus className="size-3 mr-1" />
                      Add
                    </Button>
                  </div>
                )}
                {lead.contact.company ? (
                  <div className="flex items-start gap-3">
                    <Building className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <Link
                        href={`/company`}
                        className="text-foreground hover:underline"
                      >
                        {lead.contact.company.name}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                    <div className="flex items-center gap-3">
                      <Building className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="text-xs text-muted-foreground">Not available</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/contact/${lead.contact!.id}`)}
                    >
                      <Plus className="size-3 mr-1" />
                      Add
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2">
                  {lead.contact.isCustomer && (
                    <Badge variant="secondary">Customer</Badge>
                  )}
                  {lead.contact.isClient && (
                    <Badge variant="secondary">Client</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
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
      
      {/* Modals */}
      <ProjectModal
        controller={projectModalController}
        leads={leads}
      />
      
      <NotesEditorModal controller={notesModalController} />
    </div>
  );
}
