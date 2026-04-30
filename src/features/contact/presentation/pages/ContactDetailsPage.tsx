"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, User, Phone, Mail, MapPin, Building, Briefcase, FolderTree, StickyNote, TrendingUp, Receipt, Edit, Plus, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { CompanyModal } from "@/features/company/presentation/organisms/CompanyModal";
import { useContactCompanyModalController } from "../hooks/controllers/useContactCompanyModalController";
import { useCompanyMutations } from "@/features/company/presentation/hooks";
import { useContactMutations } from "../hooks/mutations/useContactMutations";
import { useCompanyServices } from "@/features/company/presentation/hooks";
import { initialCompanyFormValue, toDraft as toCompanyDraft } from "@/features/company/presentation/helpers/companyFormHelpers";
import type { CompanyFormValue } from "@/features/company/presentation/molecules/CompanyForm";
import { useContactsCrud } from "@/features/company/presentation/hooks";
import { useContactModalController } from "../hooks/controllers/useContactModalController";
import { ContactModal } from "../organisms/ContactModal";
import { useContactsNotesLogic } from "../hooks/notes/useContactsNotesLogic";
import { useContactsNotesModalController } from "../hooks/notes/useContactsNotesModalController";
import { NotesEditorModal, LocationField } from "@/components/shared";
import { useContactsData } from "@/features/company/presentation/hooks";
import { useContactsApp } from "@/di";
import { patchContact } from "@/contact/application";
import { toast } from "sonner";
import { ContactCompanySelector } from "@/features/contact/presentation/molecules/ContactCompanySelector";
import { contactRoleOptions } from "@/contact/domain";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, EMPTY_SELECT_VALUE } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LeadModal } from "@/features/leads/presentation/organisms/LeadModal";
import { useLeadModalController } from "@/features/leads/presentation/hooks/modals/useLeadModalController";
import { useLeadCreateModal } from "@/features/leads/presentation/hooks/modals/useLeadCreateModal";
import { useProjectTypes } from "@/projectType/presentation";
import { LeadType } from "@/leads/domain";

interface ContactDetails {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  occupation?: string;
  address?: string;
  addressLink?: string;
  isCustomer: boolean;
  isClient: boolean;
  notes: string[];
  company?: {
    id: number;
    name: string;
    address?: string;
    type: any;
    serviceId?: number;
    isCustomer: boolean;
    isClient: boolean;
    notes: string[];
  };
  leads: Array<{
    id: number;
    leadNumber?: string;
    name?: string;
    startDate?: string;
    location?: string;
    addressLink?: string;
    status?: string;
    notes?: string[];
    inReview: boolean;
    projectType?: {
      id: number;
      name: string;
    } | null;
    project?: {
      id: number;
      invoiceAmount?: number;
      payments?: number[];
      projectProgressStatus?: string;
      invoiceStatus?: string;
      quickbooks?: boolean;
      overview?: string;
      notes?: string[];
    } | null;
  }>;
  stats: {
    totalLeads: number;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
  };
}

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
      router.refresh();
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
  
  const handleCompanyFormChange = useCallback((value: CompanyFormValue) => {
    setCompanyFormValue(value);
  }, []);
  
  const handleCompanySubmit = useCallback(async () => {
    const draft = toCompanyDraft(companyFormValue);
    
    if (!draft.name) {
      setCompanyServerError("Name is required");
      return;
    }
    
    try {
      // Create the company
      const created = await createCompanyMutation.mutateAsync({ 
        draft,
        contactIds: [contactId] // Associate the contact with the new company
      });
      
      // Refresh the page to show the new company
      router.refresh();
      setIsCompanyModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not create company";
      setCompanyServerError(message);
    }
  }, [companyFormValue, createCompanyMutation, contactId, router]);
  

  const handleOpenNotesModal = useCallback(() => {
    if (contactDetails) {
      notesLogic.openFromContact(contactDetails as any);
    }
  }, [contactDetails, notesLogic]);
  
  const companyModalController = useContactCompanyModalController({
    isOpen: isCompanyModalOpen,
    onClose: closeCompanyModal,
    onSubmit: handleCompanySubmit,
    formValue: companyFormValue,
    onChange: handleCompanyFormChange,
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

  const handleStartEditingContact = useCallback(() => {
    if (contactDetails) {
      setEditingContact({
        name: contactDetails.name ?? "",
        phone: contactDetails.phone ?? "",
        email: contactDetails.email ?? "",
        address: contactDetails.address ?? "",
        addressLink: contactDetails.addressLink ?? "",
        role: (contactDetails as any).role ?? "",
        companyId: contactDetails.company?.id ?? null,
        isCustomer: contactDetails.isCustomer ?? false,
        isClient: contactDetails.isClient ?? false,
      });
      setIsEditingContact(true);
    }
  }, [contactDetails]);

  const handleCancelEditingContact = useCallback(() => {
    setIsEditingContact(false);
    setEditingContact({});
  }, []);

  const handleSaveContactInline = useCallback(async () => {
    if (!contactDetails || typeof contactDetails.id !== "number") return;
    
    setIsSavingContact(true);
    try {
      const patch: any = {};
      
      if (editingContact.name !== undefined && editingContact.name !== contactDetails.name) {
        patch.name = editingContact.name.trim();
      }
      if (editingContact.phone !== undefined && editingContact.phone !== contactDetails.phone) {
        patch.phone = editingContact.phone.trim() || null;
      }
      if (editingContact.email !== undefined && editingContact.email !== contactDetails.email) {
        patch.email = editingContact.email.trim() || null;
      }
      if (editingContact.address !== undefined && editingContact.address !== contactDetails.address) {
        patch.address = editingContact.address.trim() || null;
      }
      if (editingContact.addressLink !== undefined && editingContact.addressLink !== contactDetails.addressLink) {
        patch.addressLink = editingContact.addressLink.trim() || null;
      }
      if (editingContact.role !== undefined && editingContact.role !== ((contactDetails as any).role ?? "")) {
        patch.role = editingContact.role.trim() || null;
      }
      if (editingContact.companyId !== undefined && editingContact.companyId !== (contactDetails.company?.id ?? null)) {
        patch.companyId = editingContact.companyId;
      }
      if (editingContact.isCustomer !== undefined && editingContact.isCustomer !== contactDetails.isCustomer) {
        patch.isCustomer = editingContact.isCustomer;
      }
      if (editingContact.isClient !== undefined && editingContact.isClient !== contactDetails.isClient) {
        patch.isClient = editingContact.isClient;
      }

      if (Object.keys(patch).length > 0) {
        await patchContact(app, contactDetails.id, patch);
      }
      
      setIsEditingContact(false);
      toast.success("Contact updated successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update contact");
    } finally {
      setIsSavingContact(false);
    }
  }, [contactDetails, editingContact, app, router]);

  if (error || !contactDetails) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error loading contact</CardTitle>
            <CardDescription>
              {error || "Could not load contact information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contact with ID {contactId} does not exist or could not be found.
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
          <div>
            <h1 className="text-3xl font-bold text-foreground">{contactDetails.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {contactDetails.isCustomer && (
            <Badge variant="secondary">Customer</Badge>
          )}
          {contactDetails.isClient && (
            <Badge variant="secondary">Client</Badge>
          )}
        </div>
      </div>

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
        {/* Contact Information */}
        <div className="space-y-6">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEditingContact}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit className="size-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingContact ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Name</p>
                    <Input
                      value={editingContact.name || ""}
                      onChange={(e) => setEditingContact({ ...editingContact, name: e.target.value })}
                      placeholder="Enter name"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Phone</p>
                    <Input
                      value={editingContact.phone || ""}
                      onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                      placeholder="Enter phone (optional)"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Email</p>
                    <Input
                      type="email"
                      value={editingContact.email || ""}
                      onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                      placeholder="Enter email (optional)"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Address</p>
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
                    <Label htmlFor="contact-role" className="text-sm mb-2 block">Rol</Label>
                    <Select
                      value={editingContact.role || EMPTY_SELECT_VALUE}
                      onValueChange={(val) => setEditingContact({ ...editingContact, role: val === EMPTY_SELECT_VALUE ? "" : val })}
                    >
                      <SelectTrigger id="contact-role">
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
                    <Label htmlFor="contact-company" className="text-sm mb-2 block">Company</Label>
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
                    <p className="text-lg font-semibold text-foreground">{contactDetails.name}</p>
                  </div>
                  {contactDetails.phone ? (
                    <div className="flex items-start gap-3">
                      <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-foreground">{contactDetails.phone}</p>
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
                  {contactDetails.email ? (
                    <div className="flex items-start gap-3">
                      <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a href={`mailto:${contactDetails.email}`} className="text-foreground hover:underline">
                          {contactDetails.email}
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
                  {contactDetails.address ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="text-foreground">{contactDetails.address}</p>
                        {contactDetails.addressLink && (
                          <a
                            href={contactDetails.addressLink}
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
              {contactDetails.company ? (
                <div className="flex items-start gap-3">
                  <Building className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <Link
                      href={`/company`}
                      className="text-foreground hover:underline"
                    >
                      {contactDetails.company.name}
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
                    onClick={openCompanyModal}
                  >
                    <Plus className="size-3 mr-1" />
                    Add
                  </Button>
                </div>
              )}
              {(contactDetails as any).role ? (
                <div className="flex items-start gap-3">
                  <Briefcase className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Role</p>
                    <p className="text-foreground">{(contactDetails as any).role}</p>
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
              <div className="flex items-center gap-2 pt-2">
                {contactDetails.isCustomer && (
                  <Badge variant="secondary">Customer</Badge>
                )}
                {contactDetails.isClient && (
                  <Badge variant="secondary">Client</Badge>
                )}
              </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {contactDetails.notes && contactDetails.notes.length > 0 ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <StickyNote className="size-5" />
                  Notes
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenNotesModal}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit className="size-4 mr-2" />
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {contactDetails.notes.map((note, index) => (
                    <li key={index} className="text-sm text-foreground">
                      {note}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StickyNote className="size-5" />
                  Notes
                </CardTitle>
                <CardDescription>
                  No notes for this contact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={handleOpenNotesModal}
                  className="w-full"
                >
                  <Plus className="size-4 mr-2" />
                  Add notes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Leads and Projects */}
        <div className="space-y-6">
          {/* Leads Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="size-5" />
                Leads
              </CardTitle>
              <CardDescription>
                {contactDetails.leads.length === 0
                  ? "This contact has no associated leads"
                  : `${contactDetails.leads.length} lead(s) associated`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {contactDetails.leads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    No leads associated with this contact
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (contactId) {
                        leadCreateModal.createController.setField("contactId", contactId);
                        leadCreateModal.createController.setContactMode(leadCreateModal.createController.ContactMode.EXISTING_CONTACT);
                      }
                      leadCreateModal.open();
                    }}
                  >
                    <Plus className="size-4 mr-2" />
                    Create Lead
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {contactDetails.leads.map((lead) => (
                    <Card 
                      key={lead.id} 
                      className="border-l-4 border-l-primary cursor-pointer hover:bg-accent/30 transition-colors"
                      onClick={() => router.push(`/lead/${lead.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {lead.leadNumber && (
                                <span className="text-muted-foreground mr-2">#{lead.leadNumber}</span>
                              )}
                              {lead.name || "No name"}
                            </CardTitle>
                            {lead.projectType && (
                              <CardDescription className="flex items-center gap-1 mt-1">
                                <FolderTree className="size-3" />
                                {lead.projectType.name}
                              </CardDescription>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {lead.status && (
                              <Badge variant="outline">{lead.status}</Badge>
                            )}
                            {lead.inReview && (
                              <Badge variant="secondary">In Review</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {lead.startDate && (
                            <div>
                              <p className="text-muted-foreground">Start Date</p>
                              <p className="text-foreground">{new Date(lead.startDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {lead.location && (
                            <div>
                              <p className="text-muted-foreground">Location</p>
                              <p className="text-foreground">{lead.location}</p>
                            </div>
                          )}
                        </div>
                        {Array.isArray(lead.notes) && lead.notes.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                                <StickyNote className="size-3" />
                                Notes
                              </p>
                              <ul className="space-y-1">
                                {lead.notes.map((note, index) => (
                                  <li key={index} className="text-sm text-foreground">
                                    • {note}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects Section */}
          {contactDetails.leads.some(lead => lead.project) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="size-5" />
                  Projects
                </CardTitle>
                <CardDescription>
                  {contactDetails.leads.filter(lead => lead.project).length} project(s) associated
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contactDetails.leads
                    .filter(lead => lead.project)
                    .map((lead) => (
                      <Card 
                        key={lead.id} 
                        className="border-l-4 border-l-green-500 cursor-pointer hover:bg-accent/30 transition-colors"
                        onClick={() => router.push(`/project/${lead.project!.id}`)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">
                                {lead.name || "No name"}
                              </CardTitle>
                              {lead.projectType && (
                                <CardDescription className="flex items-center gap-1 mt-1">
                                  <FolderTree className="size-3" />
                                  {lead.projectType.name}
                                </CardDescription>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {lead.project?.projectProgressStatus && (
                                <Badge variant="outline">{lead.project.projectProgressStatus}</Badge>
                              )}
                              {lead.project?.invoiceStatus && (
                                <Badge variant="outline">{lead.project.invoiceStatus}</Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {lead.project?.invoiceAmount && (
                              <div>
                                <p className="text-muted-foreground flex items-center gap-1">
                                  <Receipt className="size-3" />
                                  Invoice Amount
                                </p>
                                <p className="text-foreground font-semibold">
                                  ${lead.project.invoiceAmount.toLocaleString()}
                                </p>
                              </div>
                            )}
                            {lead.project?.quickbooks !== undefined && (
                              <div>
                                <p className="text-muted-foreground">In QuickBooks</p>
                                <Badge variant={lead.project.quickbooks ? "default" : "outline"}>
                                  {lead.project.quickbooks ? "Yes" : "No"}
                                </Badge>
                              </div>
                            )}
                          </div>
                          {lead.project?.overview && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-muted-foreground text-sm mb-1">Project Overview</p>
                                <p className="text-foreground text-sm">{lead.project.overview}</p>
                              </div>
                            </>
                          )}
                          {Array.isArray(lead.project?.notes) && lead.project.notes.length > 0 && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1">
                                  <StickyNote className="size-3" />
                                  Notes
                                </p>
                                <ul className="space-y-1">
                                  {lead.project.notes.map((note, index) => (
                                    <li key={index} className="text-sm text-foreground">
                                      • {note}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
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
