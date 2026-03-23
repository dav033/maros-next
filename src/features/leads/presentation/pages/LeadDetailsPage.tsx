"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { ArrowLeft, Briefcase, User, Phone, Mail, MapPin, Building, FolderTree, FileText, StickyNote, TrendingUp, Receipt, Calendar, Edit, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { LeadModal } from "../organisms/LeadModal";
import { useLeadEditModal } from "../hooks/modals/useLeadEditModal";
import { useLeadsNotesLogic } from "../hooks/notes/useLeadsNotesLogic";
import { useLeadModalController } from "../hooks/modals/useLeadModalController";
import { useLeadsNotesModalController } from "../hooks/modals/useLeadsNotesModalController";
import { NotesEditorModal } from "@/components/shared";
import { getLeadTypeFromNumber, LeadType, type Lead } from "@/leads/domain";
import { useInstantContacts } from "@/features/contact/presentation/hooks";
import { useProjectTypes } from "@/projectType/presentation";
import { updateLeadNotesAction } from "../../actions/notesActions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { leadsKeys, patchLead } from "@/leads/application";
import { useLeadsData } from "../hooks/data/useLeadsData";
import { useLeadsApp, useContactsApp } from "@/di";
import type { LeadPatch } from "@/leads/domain";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, EMPTY_SELECT_VALUE } from "@/components/ui/select";
import { LocationField } from "@/components/shared";
import { useContactsData } from "@/features/company/presentation/hooks";
import { patchContact, createContact, contactsKeys } from "@/contact/application";
import { ContactCompanySelector } from "@/features/contact/presentation/molecules/ContactCompanySelector";
import { contactRoleOptions } from "@/contact/domain";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ContactModeSelector, ContactMode } from "@/leads/presentation";
import { toContactDraft, type ContactFormValue } from "@/features/contact/domain/mappers";

interface LeadDetails {
  id: number;
  leadNumber?: string;
  name?: string;
  startDate?: string | null;
  location?: string;
  addressLink?: string;
  status?: string;
  projectTypeId?: number | null;
  contactId?: number | null;
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
      addressLink?: string;
      phone?: string;
      email?: string;
      submiz?: string;
      type: any;
      serviceId?: number;
      isCustomer: boolean;
      isClient: boolean;
      notes?: string[];
    } | null;
  } | null;
  projectType?: {
    id: number;
    name: string;
  } | null;
}

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
  
  // Estado local para las notas que se actualiza después de guardar
  const [leadDetails, setLeadDetails] = useState(initialLeadDetails);
  
  // Estado para edición inline del lead
  const [isEditingLead, setIsEditingLead] = useState(false);
  const [editingLead, setEditingLead] = useState<Partial<LeadDetails>>({});
  const [isSavingLead, setIsSavingLead] = useState(false);
  
  
  // Actualizar el estado cuando cambian los datos iniciales (después de router.refresh())
  useEffect(() => {
    setLeadDetails(initialLeadDetails);
  }, [initialLeadDetails]);
  
  // Determine leadType from leadNumber
  const leadType = leadDetails?.leadNumber 
    ? (getLeadTypeFromNumber(leadDetails.leadNumber) || LeadType.CONSTRUCTION)
    : LeadType.CONSTRUCTION;
  
  // Data for modals
  const { contacts = [] } = useInstantContacts();
  const { projectTypes = [] } = useProjectTypes();
  
  // Edit modal
  const editModal = useLeadEditModal({
    leadType,
    onUpdated: async () => {
      router.refresh();
    },
  });
  
  // Notes logic
  const notesLogic = useLeadsNotesLogic({
    leadType,
    onUpdated: async (updatedLead) => {
      // Actualizar el estado local con las notas actualizadas
      if (updatedLead && leadDetails) {
        setLeadDetails({
          ...leadDetails,
          notes: updatedLead.notes || [],
        });
      }
      // Refrescar la página para obtener los datos más recientes del servidor
      router.refresh();
    },
  });
  
  const queryClient = useQueryClient();
  const data = useLeadsData(leadType);
  const ctx = useLeadsApp();
  const contactCtx = useContactsApp();
  const { companies } = useContactsData();

  // Estado para edición inline del contacto
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editingContact, setEditingContact] = useState<Partial<{
    name: string;
    phone: string;
    email: string;
    address: string;
    addressLink: string;
    role: string;
    companyId: number | null;
    isCustomer: boolean;
    isClient: boolean;
  }>>({});
  const [isSavingContact, setIsSavingContact] = useState(false);
  const [isRemovingContact, setIsRemovingContact] = useState(false);

  // Estado para selección/creación rápida de contacto cuando el lead no tiene contacto
  const [contactMode, setContactMode] = useState<ContactMode>(ContactMode.EXISTING_CONTACT);
  const [newContactForm, setNewContactForm] = useState<{
    contactName: string;
    phone: string;
    email: string;
  }>({
    contactName: "",
    phone: "",
    email: "",
  });
  const [selectedContactId, setSelectedContactId] = useState<number | undefined>(undefined);
  const [newContactCompanyId, setNewContactCompanyId] = useState<number | null>(null);
  const [isLinkingContact, setIsLinkingContact] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const handleStartEditingLead = useCallback(() => {
    if (leadDetails) {
      setEditingLead({
        name: leadDetails.name ?? "",
        location: leadDetails.location ?? "",
        addressLink: leadDetails.addressLink ?? "",
        startDate: leadDetails.startDate ?? "",
        status: leadDetails.status ?? "",
        projectTypeId: leadDetails.projectType?.id,
        contactId: leadDetails.contact?.id,
      });
      setIsEditingLead(true);
    }
  }, [leadDetails]);

  const handleCancelEditingLead = useCallback(() => {
    setIsEditingLead(false);
    setEditingLead({});
  }, []);

  const handleSaveLeadInline = useCallback(async () => {
    if (!leadDetails || typeof leadDetails.id !== "number") return;
    
    setIsSavingLead(true);
    try {
      // Crear el patch solo con los campos que cambiaron
      const patch: Record<string, any> = {};
      
      if (editingLead.name !== undefined && editingLead.name !== leadDetails.name) {
        patch.name = editingLead.name.trim();
      }
      if (editingLead.location !== undefined && editingLead.location !== leadDetails.location) {
        patch.location = editingLead.location.trim();
      }
      if (editingLead.addressLink !== undefined && editingLead.addressLink !== (leadDetails.addressLink ?? "")) {
        patch.addressLink = editingLead.addressLink && editingLead.addressLink.trim() !== "" ? editingLead.addressLink.trim() : null;
      }
      if (editingLead.startDate !== undefined && editingLead.startDate !== leadDetails.startDate) {
        patch.startDate = editingLead.startDate as any;
      }
      if (editingLead.status !== undefined && editingLead.status !== leadDetails.status) {
        patch.status = editingLead.status as any;
      }
      if (editingLead.projectTypeId !== undefined && editingLead.projectTypeId !== leadDetails.projectType?.id) {
        patch.projectTypeId = editingLead.projectTypeId;
      }
      if (editingLead.contactId !== undefined && editingLead.contactId !== leadDetails.contact?.id) {
        patch.contactId = editingLead.contactId;
      }

      // Solo actualizar si hay cambios
      if (Object.keys(patch).length > 0) {
        const updated = await patchLead(ctx, leadDetails.id, patch as unknown as LeadPatch, {});
        
        // Actualizar el cache de React Query
        queryClient.setQueryData<Lead[]>(leadsKeys.byType(leadType), (oldLeads) => {
          if (!oldLeads) return oldLeads;
          return oldLeads.map((l) => (l.id === leadDetails.id ? updated : l));
        });

        queryClient.invalidateQueries({ queryKey: leadsKeys.all });
        await data.refetch();
        
        // Actualizar el estado local
        setLeadDetails({
          ...leadDetails,
          name: updated.name,
          location: updated.location,
          addressLink: updated.addressLink,
          startDate: updated.startDate,
          status: updated.status,
          projectType: updated.projectType,
          contact: updated.contact as any,
        });
      }
      
      setIsEditingLead(false);
      toast.success("Lead updated successfully!");
      
      // Refrescar la página para obtener los datos más recientes
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update lead");
    } finally {
      setIsSavingLead(false);
    }
  }, [leadDetails, editingLead, queryClient, leadType, data, router, ctx]);

  const handleEditLead = useCallback(() => {
    if (isEditingLead) {
      handleSaveLeadInline();
    } else {
      handleStartEditingLead();
    }
  }, [isEditingLead, handleStartEditingLead, handleSaveLeadInline]);


  const handleOpenNotesModal = useCallback(() => {
    if (leadDetails) {
      notesLogic.openFromLead(leadDetails as any);
    }
  }, [leadDetails, notesLogic]);

  const handleStartEditingContact = useCallback(() => {
    if (leadDetails?.contact) {
      setEditingContact({
        name: leadDetails.contact.name ?? "",
        phone: leadDetails.contact.phone ?? "",
        email: leadDetails.contact.email ?? "",
        address: leadDetails.contact.address ?? "",
        addressLink: leadDetails.contact.addressLink ?? "",
        role: (leadDetails.contact as any).role ?? "",
        companyId: leadDetails.contact.company?.id ?? null,
        isCustomer: leadDetails.contact.isCustomer ?? false,
        isClient: leadDetails.contact.isClient ?? false,
      });
      setIsEditingContact(true);
    }
  }, [leadDetails]);

  const handleCancelEditingContact = useCallback(() => {
    setIsEditingContact(false);
    setEditingContact({});
  }, []);

  const handleSaveContactInline = useCallback(async () => {
    if (!leadDetails?.contact || typeof leadDetails.contact.id !== "number") return;
    
    setIsSavingContact(true);
    try {
      const patch: any = {};
      
      if (editingContact.name !== undefined && editingContact.name !== leadDetails.contact.name) {
        patch.name = editingContact.name.trim();
      }
      if (editingContact.phone !== undefined && editingContact.phone !== leadDetails.contact.phone) {
        patch.phone = editingContact.phone.trim() || null;
      }
      if (editingContact.email !== undefined && editingContact.email !== leadDetails.contact.email) {
        patch.email = editingContact.email.trim() || null;
      }
      if (editingContact.address !== undefined && editingContact.address !== leadDetails.contact.address) {
        patch.address = editingContact.address.trim() || null;
      }
      if (editingContact.addressLink !== undefined && editingContact.addressLink !== leadDetails.contact.addressLink) {
        patch.addressLink = editingContact.addressLink.trim() || null;
      }
      if (editingContact.role !== undefined && editingContact.role !== ((leadDetails.contact as any).role ?? "")) {
        patch.role = editingContact.role.trim() || null;
      }
      if (editingContact.companyId !== undefined && editingContact.companyId !== (leadDetails.contact.company?.id ?? null)) {
        patch.companyId = editingContact.companyId;
      }
      if (editingContact.isCustomer !== undefined && editingContact.isCustomer !== leadDetails.contact.isCustomer) {
        patch.isCustomer = editingContact.isCustomer;
      }
      if (editingContact.isClient !== undefined && editingContact.isClient !== leadDetails.contact.isClient) {
        patch.isClient = editingContact.isClient;
      }

      if (Object.keys(patch).length > 0) {
        await patchContact(contactCtx, leadDetails.contact.id, patch);
        setLeadDetails({
          ...leadDetails,
          contact: {
            ...leadDetails.contact,
            ...patch,
          },
        });
      }
      setIsEditingContact(false);
      toast.success("Contact updated successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update contact");
    } finally {
      setIsSavingContact(false);
    }
  }, [leadDetails, editingContact, contactCtx, router]);
  
  const handleRemoveContactFromLead = useCallback(async () => {
    if (!leadDetails || typeof leadDetails.id !== "number") return;

    setIsRemovingContact(true);
    try {
      const patch: LeadPatch = { contactId: 0 as number };
      const updated = await patchLead(ctx, leadDetails.id, patch, {});

      // Actualizar cache de React Query para la lista de leads
      queryClient.setQueryData<Lead[]>(leadsKeys.byType(leadType), (oldLeads) => {
        if (!oldLeads) return oldLeads;
        return oldLeads.map((l) => (l.id === leadDetails.id ? updated : l));
      });
      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
      await data.refetch();

      // En la vista de detalle, consideramos que el lead ya no tiene contacto asociado
      setLeadDetails({
        ...leadDetails,
        contact: null as any,
        contactId: null,
      });

      toast.success("Contact removed from lead.");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "No se pudo eliminar el contacto del lead.");
    } finally {
      setIsRemovingContact(false);
    }
  }, [leadDetails, ctx, queryClient, leadType, data, router]);

  const handleLinkContactToLead = async () => {
    if (!leadDetails || typeof leadDetails.id !== "number") return;

    setIsLinkingContact(true);
    setContactError(null);

    try {
      let contactId: number | undefined;

      if (contactMode === ContactMode.EXISTING_CONTACT) {
        if (!selectedContactId) {
          setContactError("Seleccione un contacto existente.");
          return;
        }
        contactId = selectedContactId;
      } else {
        if (!newContactForm.contactName.trim()) {
          setContactError("Contact name is required.");
          return;
        }

        const formValue: ContactFormValue = {
          name: newContactForm.contactName,
          phone: newContactForm.phone,
          email: newContactForm.email,
          occupation: "",
          role: undefined,
          address: "",
          addressLink: undefined,
          isCustomer: false,
          isClient: false,
          companyId: newContactCompanyId,
          note: undefined,
        };

        const draft = toContactDraft(formValue);
        const newContact = await createContact(contactCtx, draft);

        if (typeof newContact.id !== "number") {
          throw new Error("Could not create contact.");
        }

        contactId = newContact.id;

        await queryClient.invalidateQueries({ queryKey: contactsKeys.list });
      }

      const patch: LeadPatch = { contactId };
      const updated = await patchLead(ctx, leadDetails.id, patch, {});

      queryClient.setQueryData<Lead[]>(leadsKeys.byType(leadType), (oldLeads) => {
        if (!oldLeads) return oldLeads;
        return oldLeads.map((l) => (l.id === leadDetails.id ? updated : l));
      });

      queryClient.invalidateQueries({ queryKey: leadsKeys.all });
      await data.refetch();

      setLeadDetails({
        ...leadDetails,
        contact: updated.contact as any,
        contactId: updated.contact?.id,
      });

      toast.success("Contact linked successfully.");
    } catch (error: any) {
      const message = error?.message || "Could not link contact.";
      setContactError(message);
      toast.error(message);
    } finally {
      setIsLinkingContact(false);
    }
  };
  
  const { controller: leadModalController, contactsForModal } = useLeadModalController({
    isCreateModalOpen: false,
    isEditModalOpen: editModal.isOpen,
    closeCreateModal: () => {},
    closeEditModal: editModal.close,
    createController: undefined,
    updateController: editModal.updateController,
    selectedLead: editModal.selectedLead,
    contacts,
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


  if (error || !leadDetails) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error loading lead</CardTitle>
            <CardDescription>
              {error || "Could not load lead information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Lead with ID {leadId} does not exist or could not be found. 
              Please verify that the ID is correct.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex-1">
            {isEditingLead ? (
              <div className="space-y-2">
                <Input
                  value={editingLead.name || ""}
                  onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                  placeholder="Enter lead name"
                  className="text-2xl font-bold"
                />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-foreground">
                  {leadDetails.leadNumber && (
                    <span className="text-muted-foreground mr-2">#{leadDetails.leadNumber}</span>
                  )}
                  {leadDetails.name || "No name"}
                </h1>
                {leadDetails.projectType && (
                  <p className="text-muted-foreground mt-1">{leadDetails.projectType.name}</p>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {leadDetails.status && (
            <Badge variant="outline">{leadDetails.status}</Badge>
          )}
          {leadDetails.inReview && (
            <Badge variant="secondary">In Review</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="size-5" />
                Lead Information
              </CardTitle>
              {isEditingLead ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEditingLead}
                    disabled={isSavingLead}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveLeadInline}
                    disabled={isSavingLead}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Save className="size-4 mr-2" />
                    {isSavingLead ? "Saving..." : "Save"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditLead}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit className="size-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Lead Number - Read only */}
                <div>
                  <p className="text-sm text-muted-foreground">Número de Lead</p>
                  <p className="text-foreground font-mono">{leadDetails.leadNumber || "N/A"}</p>
                </div>
                
                {/* Project Type */}
                {isEditingLead ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Tipo de Proyecto</p>
                    <Select
                      value={editingLead.projectTypeId != null ? String(editingLead.projectTypeId) : EMPTY_SELECT_VALUE}
                      onValueChange={(val) => setEditingLead({ ...editingLead, projectTypeId: val === EMPTY_SELECT_VALUE ? undefined : Number(val) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Project Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EMPTY_SELECT_VALUE}>Select Project Type</SelectItem>
                        {projectTypes.map((pt) => (
                          <SelectItem key={pt.id} value={String(pt.id)}>
                            {pt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : leadDetails.projectType ? (
                  <div className="flex items-start gap-3">
                    <FolderTree className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tipo de Proyecto</p>
                      <p className="text-foreground">{leadDetails.projectType.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                    <div>
                      <p className="text-sm text-muted-foreground">Project Type</p>
                      <p className="text-xs text-muted-foreground">Not available</p>
                    </div>
                  </div>
                )}
                
                {/* Start Date */}
                {isEditingLead ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Start Date</p>
                    <Input
                      type="date"
                      value={editingLead.startDate || ""}
                      onChange={(e) => setEditingLead({ ...editingLead, startDate: e.target.value })}
                    />
                  </div>
                ) : leadDetails.startDate ? (
                  <div className="flex items-start gap-3">
                    <Calendar className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-muted-foreground">Fecha de inicio</p>
                      <p className="text-foreground">{new Date(leadDetails.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p className="text-xs text-muted-foreground">Not available</p>
                    </div>
                  </div>
                )}
                
                {/* Status */}
                {isEditingLead ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                    <Select
                      value={editingLead.status || EMPTY_SELECT_VALUE}
                      onValueChange={(val) => setEditingLead({ ...editingLead, status: val === EMPTY_SELECT_VALUE ? undefined : val })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EMPTY_SELECT_VALUE}>Select Status</SelectItem>
                        <SelectItem value="NOT_EXECUTED">Not Executed</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="LOST">Lost</SelectItem>
                        <SelectItem value="POSTPONED">Postponed</SelectItem>
                        <SelectItem value="PERMITS">Permits</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : leadDetails.status ? (
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge variant="outline">{leadDetails.status}</Badge>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="text-xs text-muted-foreground">Not available</p>
                    </div>
                  </div>
                )}
              </div>

              {isEditingLead ? (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Location</p>
                    <LocationField
                      address={editingLead.location || ""}
                      addressLink={editingLead.addressLink || null}
                      onAddressChange={(value: string) => setEditingLead({ ...editingLead, location: value })}
                      onAddressLinkChange={(value: string) => setEditingLead({ ...editingLead, addressLink: value })}
                      placeholder="Enter location"
                    />
                  </div>
                </>
              ) : leadDetails.location ? (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="text-foreground">{leadDetails.location}</p>
                      {leadDetails.addressLink && (
                        <a
                          href={leadDetails.addressLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-1 inline-block"
                        >
                          Ver en mapa
                        </a>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Separator />
                  <div className="flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                    <div className="flex items-center gap-3">
                      <MapPin className="size-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="text-xs text-muted-foreground">Not available</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {leadDetails.notes && leadDetails.notes.length > 0 ? (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-muted-foreground text-sm flex items-center gap-1">
                        <StickyNote className="size-3" />
                        Notes
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleOpenNotesModal}
                        className="text-muted-foreground hover:text-foreground h-auto py-1"
                      >
                        <Edit className="size-3 mr-1" />
                        Edit Notes
                      </Button>
                    </div>
                    <ul className="space-y-2">
                      {leadDetails.notes.map((note, index) => (
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
            </CardContent>
          </Card>

        </div>

        {/* Contact and Company Information */}
        <div className="space-y-6">
          {/* Contact Information */}
          {leadDetails.contact ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="size-5" />
                    Contact Information
                  </CardTitle>
                  {isEditingContact ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEditingContact}
                        disabled={isSavingContact}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="size-4 mr-2" />
                        Cancel
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSaveContactInline}
                        disabled={isSavingContact}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Save className="size-4 mr-2" />
                        {isSavingContact ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleStartEditingContact}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="size-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveContactFromLead}
                        disabled={isRemovingContact}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="size-4 mr-2" />
                        {isRemovingContact ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingContact ? (
                    <>
                      <div>
                        <Label htmlFor="contact-name-lead" className="text-sm mb-2 block">Name</Label>
                        <Input
                          id="contact-name-lead"
                          value={editingContact.name || ""}
                          onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                          placeholder="Enter name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact-phone-lead" className="text-sm mb-2 block">Phone</Label>
                        <Input
                          id="contact-phone-lead"
                          value={editingContact.phone || ""}
                          onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                          placeholder="Enter phone (optional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact-email-lead" className="text-sm mb-2 block">Email</Label>
                        <Input
                          id="contact-email-lead"
                          type="email"
                          value={editingContact.email || ""}
                          onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                          placeholder="Enter email (optional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact-address-lead" className="text-sm mb-2 block">Address</Label>
                        <LocationField
                          address={editingContact.address || ""}
                          addressLink={editingContact.addressLink || null}
                          onAddressChange={(value: string) => setEditingContact((prev) => ({ ...prev, address: value }))}
                          onAddressLinkChange={(value: string) => setEditingContact((prev) => ({ ...prev, addressLink: value }))}
                          onLocationChange={(data) => {
                            setEditingContact((prev) => ({
                              ...prev,
                              address: data.address,
                              addressLink: data.link,
                            }));
                          }}
                          placeholder="Enter address (optional)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact-role-lead" className="text-sm mb-2 block">Role</Label>
                        <Select
                          value={editingContact.role || EMPTY_SELECT_VALUE}
                          onValueChange={(val) => setEditingContact({ ...editingContact, role: val === EMPTY_SELECT_VALUE ? "" : val })}
                        >
                          <SelectTrigger id="contact-role-lead">
                            <Briefcase className="size-4 text-muted-foreground mr-2" />
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={EMPTY_SELECT_VALUE}>No role</SelectItem>
                            {contactRoleOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="contact-company-lead" className="text-sm mb-2 block">Company</Label>
                        <ContactCompanySelector
                          selectedCompanyId={editingContact.companyId ?? null}
                          companies={companies || []}
                          onCompanyChange={(companyId) => setEditingContact({ ...editingContact, companyId })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="contact-is-customer"
                            checked={editingContact.isCustomer ?? false}
                            onCheckedChange={(checked) => setEditingContact({ ...editingContact, isCustomer: !!checked })}
                          />
                          <Label htmlFor="contact-is-customer">Customer</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="contact-is-client"
                            checked={editingContact.isClient ?? false}
                            onCheckedChange={(checked) => setEditingContact({ ...editingContact, isClient: !!checked })}
                          />
                          <Label htmlFor="contact-is-client">PROVEEDOR</Label>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Link
                          href={`/contact/${leadDetails.contact.id}`}
                          className="text-lg font-semibold text-foreground hover:underline"
                        >
                          {leadDetails.contact.name}
                        </Link>
                      </div>
                      {leadDetails.contact.phone ? (
                        <div className="flex items-start gap-3">
                          <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="text-foreground">{leadDetails.contact.phone}</p>
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
                        </div>
                      )}
                      {leadDetails.contact.email ? (
                        <div className="flex items-start gap-3">
                          <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <a href={`mailto:${leadDetails.contact.email}`} className="text-foreground hover:underline">
                              {leadDetails.contact.email}
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
                        </div>
                      )}
                      {leadDetails.contact.address ? (
                        <div className="flex items-start gap-3">
                          <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground">Address</p>
                            <p className="text-foreground">{leadDetails.contact.address}</p>
                            {leadDetails.contact.addressLink && (
                              <a
                                href={leadDetails.contact.addressLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline mt-1 inline-block"
                              >
                                Ver en mapa
                              </a>
                            )}
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
                        </div>
                      )}
                      {(leadDetails.contact as any).role ? (
                        <div className="flex items-start gap-3">
                          <Briefcase className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">Role</p>
                            <p className="text-foreground">{(leadDetails.contact as any).role}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 rounded-md border border-dashed border-muted-foreground/30">
                          <div className="flex items-center gap-3">
                            <Briefcase className="size-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Role</p>
                              <p className="text-xs text-muted-foreground">Not available</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {leadDetails.contact.company ? (
                        <div className="flex items-start gap-3">
                          <Building className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm text-muted-foreground">Company</p>
                            <Link
                              href={`/company`}
                              className="text-foreground hover:underline"
                            >
                              {leadDetails.contact.company.name}
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
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        {leadDetails.contact.isCustomer && (
                          <Badge variant="secondary">Customer</Badge>
                        )}
                        {leadDetails.contact.isClient && (
                          <Badge variant="secondary">Client</Badge>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Company Information */}
              {leadDetails.contact.company ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building className="size-5" />
                      Company Information
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/company`)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Edit className="size-4 mr-2" />
                      Edit
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Link
                        href={`/company`}
                        className="text-lg font-semibold text-foreground hover:underline"
                      >
                        {leadDetails.contact.company.name}
                      </Link>
                      {leadDetails.contact.company.type && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Type: {typeof leadDetails.contact.company.type === 'string' 
                            ? leadDetails.contact.company.type 
                            : String(leadDetails.contact.company.type)}
                        </p>
                      )}
                    </div>
                    {leadDetails.contact.company.phone ? (
                      <div className="flex items-start gap-3">
                        <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="text-foreground">{leadDetails.contact.company.phone}</p>
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
                          onClick={() => router.push(`/company`)}
                        >
                          <Plus className="size-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    )}
                    {leadDetails.contact.company.email ? (
                      <div className="flex items-start gap-3">
                        <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <a href={`mailto:${leadDetails.contact.company.email}`} className="text-foreground hover:underline">
                            {leadDetails.contact.company.email}
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
                          onClick={() => router.push(`/company`)}
                        >
                          <Plus className="size-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    )}
                    {leadDetails.contact.company.address ? (
                      <div className="flex items-start gap-3">
                        <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="text-foreground">{leadDetails.contact.company.address}</p>
                          {leadDetails.contact.company.addressLink && (
                            <a
                              href={leadDetails.contact.company.addressLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline mt-1 inline-block"
                            >
                              View on map
                            </a>
                          )}
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
                          onClick={() => router.push(`/company`)}
                        >
                          <Plus className="size-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    )}
                    {leadDetails.contact.company.submiz && (
                      <div>
                        <p className="text-sm text-muted-foreground">Submiz</p>
                        <p className="text-foreground">{leadDetails.contact.company.submiz}</p>
                      </div>
                    )}
                    {leadDetails.contact.company.serviceId && (
                      <div>
                        <p className="text-sm text-muted-foreground">Service ID</p>
                        <p className="text-foreground">{leadDetails.contact.company.serviceId}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      {leadDetails.contact.company.isCustomer && (
                        <Badge variant="secondary">Customer</Badge>
                      )}
                      {leadDetails.contact.company.isClient && (
                        <Badge variant="secondary">Client</Badge>
                      )}
                    </div>
                    {leadDetails.contact.company.notes && leadDetails.contact.company.notes.length > 0 ? (
                      <>
                        <Separator />
                        <div>
                          <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                            <StickyNote className="size-3" />
                            Company Notes
                          </p>
                          <ul className="space-y-1">
                            {leadDetails.contact.company.notes.map((note, index) => (
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
                              <p className="text-sm text-muted-foreground">Company Notes</p>
                              <p className="text-xs text-muted-foreground">No notes</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/company`)}
                          >
                            <Plus className="size-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : leadDetails.contact ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="size-5" />
                      Company Information
                    </CardTitle>
                    <CardDescription>
                      This contact does not have an associated company
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/company?create`)}
                      className="w-full"
                    >
                      <Plus className="size-4 mr-2" />
                      Create Company
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="size-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>
                  This lead has no associated contact. Select an existing one or create a new one.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ContactModeSelector
                  contactMode={contactMode}
                  onContactModeChange={(mode) => {
                    setContactMode(mode);
                    setContactError(null);
                  }}
                  form={{
                    contactName: newContactForm.contactName,
                    phone: newContactForm.phone,
                    email: newContactForm.email,
                  }}
                  onChange={(key, value) =>
                    setNewContactForm((prev) => ({ ...prev, [key]: value }))
                  }
                  disabled={isLinkingContact}
                  contacts={contacts}
                  selectedContactId={selectedContactId}
                  onContactSelect={(id) => {
                    setSelectedContactId(id);
                    setContactError(null);
                  }}
                />

                <div className="space-y-2">
                  <Label className="text-sm">Empresa (opcional)</Label>
                  <ContactCompanySelector
                    selectedCompanyId={newContactCompanyId}
                    companies={companies || []}
                    onCompanyChange={(companyId) => setNewContactCompanyId(companyId)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/company?create`)}
                    className="mt-1"
                  >
                    <Plus className="size-4 mr-2" />
                    Create new company
                  </Button>
                </div>

                {contactError && (
                  <p className="text-sm text-destructive">{contactError}</p>
                )}

                <Button
                  variant="default"
                  onClick={handleLinkContactToLead}
                  disabled={isLinkingContact}
                  className="w-full"
                >
                  {isLinkingContact ? (
                    "Saving..."
                  ) : (
                    <>
                      <Plus className="size-4 mr-2" />
                      Save contact
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Modals */}
      <LeadModal
        controller={leadModalController}
        contacts={contactsForModal}
        projectTypes={projectTypes}
      />
      
      <NotesEditorModal controller={notesModalController} />
    </div>
  );
}
