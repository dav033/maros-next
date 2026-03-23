"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { ArrowLeft, Building, Phone, Mail, MapPin, FileText, StickyNote, Edit, Save, X, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useCompanyMutations, useContactsData } from "../hooks";
import { useCompanyNotesLogic } from "../hooks/notes/useCompanyNotesLogic";
import { useCompanyNotesModalController } from "../hooks/notes/useCompanyNotesModalController";
import { NotesEditorModal, LocationField } from "@/components/shared";
import { updateCompanyAction } from "@/features/company/actions/companyActions";
import { toast } from "sonner";
import { useContactsApp } from "@/di";
import { createContact, contactsKeys } from "@/contact/application";
import { toContactDraft, type ContactFormValue } from "@/contact/domain";
import { initialContactFormValue } from "@/features/contact/presentation/hooks/mutations/useContactMutations";
import { CompanyContactsSelector } from "../molecules/form/CompanyContactsSelector";
import { ContactModal } from "@/features/contact/presentation/organisms/ContactModal";
import { useContactModalController } from "@/features/contact/presentation/hooks/controllers/useContactModalController";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, EMPTY_SELECT_VALUE } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CompanyTypeBadge } from "../atoms/CompanyTypeBadge";
import { COMPANY_TYPE_OPTIONS } from "../molecules/form/companyTypeOptions";
import type { CompanyType } from "../../domain/models";

interface CompanyDetails {
  id: number;
  name: string;
  address?: string;
  addressLink?: string;
  type: CompanyType;
  serviceId?: number | null;
  isCustomer: boolean;
  isClient: boolean;
  notes: string[];
  phone?: string;
  email?: string;
  submiz?: string;
  contacts?: Array<{
    id: number;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    addressLink?: string;
    isCustomer: boolean;
    isClient: boolean;
    notes: string[];
  }>;
}

interface CompanyDetailsPageProps {
  companyId: number;
  initialData: {
    companyDetails: CompanyDetails | null;
    error?: string;
  };
}

export function CompanyDetailsPage({ companyId, initialData }: CompanyDetailsPageProps) {
  const router = useRouter();
  const { companyDetails, error } = initialData;
  
  // Notes logic
  const notesLogic = useCompanyNotesLogic();
  
  // Inline editing state for company
  const [isEditingCompany, setIsEditingCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Partial<{
    name: string;
    phone: string;
    email: string;
    address: string;
    addressLink: string;
    type: CompanyType | null;
    isCustomer: boolean;
    isClient: boolean;
  }>>({});
  const [isSavingCompany, setIsSavingCompany] = useState(false);

  // Add contacts: selector + create new
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactIdsToAdd, setContactIdsToAdd] = useState<number[]>([]);
  const [isAddingContactsSaving, setIsAddingContactsSaving] = useState(false);
  const [isCreateContactOpen, setIsCreateContactOpen] = useState(false);
  const [createContactFormValue, setCreateContactFormValue] = useState<ContactFormValue>(initialContactFormValue);
  const [createContactError, setCreateContactError] = useState<string | null>(null);
  const [isCreateContactPending, setIsCreateContactPending] = useState(false);

  const { updateMutation } = useCompanyMutations();
  const data = useContactsData();
  const { contacts = [], companies = [] } = data;
  const contactsApp = useContactsApp();
  const queryClient = useQueryClient();

  const currentContactIds = (companyDetails?.contacts ?? []).map((c) => c.id);
  const contactsNotInCompany = contacts.filter(
    (c): c is typeof c & { id: number } =>
      typeof c.id === "number" && !currentContactIds.includes(c.id)
  );

  const handleToggleContactToAdd = useCallback((contactId: number) => {
    setContactIdsToAdd((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId]
    );
  }, []);

  const handleAddSelectedContacts = useCallback(async () => {
    if (!companyDetails || contactIdsToAdd.length === 0) return;
    setIsAddingContactsSaving(true);
    try {
      await updateMutation.mutateAsync({
        id: companyDetails.id,
        patch: {},
        contactIds: [...currentContactIds, ...contactIdsToAdd],
      });
      setContactIdsToAdd([]);
      setIsAddingContact(false);
      toast.success("Contacts added successfully.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add contacts.");
    } finally {
      setIsAddingContactsSaving(false);
    }
  }, [companyDetails, contactIdsToAdd, currentContactIds, updateMutation, router]);

  const handleOpenCreateContact = useCallback(() => {
    setCreateContactFormValue({
      ...initialContactFormValue,
      companyId: companyDetails?.id ?? null,
    });
    setCreateContactError(null);
    setIsCreateContactOpen(true);
  }, [companyDetails?.id]);

  const handleCloseCreateContact = useCallback(() => {
    if (!isCreateContactPending) {
      setIsCreateContactOpen(false);
      setCreateContactError(null);
      setCreateContactFormValue(initialContactFormValue);
    }
  }, [isCreateContactPending]);

  const handleCreateContactSubmit = useCallback(async () => {
    if (!companyDetails) return;
    setIsCreateContactPending(true);
    setCreateContactError(null);
    try {
      const draft = toContactDraft({
        ...createContactFormValue,
        companyId: companyDetails.id,
      });
      const newContact = await createContact(contactsApp, draft);
      if (typeof newContact.id !== "number") {
        throw new Error("Created contact has no id");
      }
      await queryClient.invalidateQueries({ queryKey: contactsKeys.list });
      await updateMutation.mutateAsync({
        id: companyDetails.id,
        patch: {},
        contactIds: [...currentContactIds, newContact.id],
      });
      setIsCreateContactOpen(false);
      setCreateContactFormValue(initialContactFormValue);
      toast.success("Contact created and added to company.");
      router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not create contact.";
      setCreateContactError(msg);
      toast.error(msg);
    } finally {
      setIsCreateContactPending(false);
    }
  }, [companyDetails, createContactFormValue, contactsApp, queryClient, updateMutation, currentContactIds, router]);

  const addContactModalController = useContactModalController({
    mode: isCreateContactOpen ? "create" : "list",
    closeModal: handleCloseCreateContact,
    handleCreateSubmit: handleCreateContactSubmit,
    handleEditSubmit: () => {},
    formValue: createContactFormValue,
    handleFormChange: setCreateContactFormValue,
    isPending: isCreateContactPending,
    serverError: createContactError,
  });

  const handleOpenNotesModal = useCallback(() => {
    if (companyDetails) {
      notesLogic.openFromCompany(companyDetails as any);
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

  const handleStartEditingCompany = useCallback(() => {
    if (companyDetails) {
      setEditingCompany({
        name: companyDetails.name ?? "",
        phone: companyDetails.phone ?? "",
        email: companyDetails.email ?? "",
        address: companyDetails.address ?? "",
        addressLink: companyDetails.addressLink ?? "",
        type: companyDetails.type ?? null,
        isCustomer: companyDetails.isCustomer ?? false,
        isClient: companyDetails.isClient ?? false,
      });
      setIsEditingCompany(true);
    }
  }, [companyDetails]);

  const handleCancelEditingCompany = useCallback(() => {
    setIsEditingCompany(false);
    setEditingCompany({});
  }, []);

  const handleSaveCompanyInline = useCallback(async () => {
    if (!companyDetails || typeof companyDetails.id !== "number") return;
    
    setIsSavingCompany(true);
    try {
      const patch: any = {};
      
      if (editingCompany.name !== undefined && editingCompany.name !== companyDetails.name) {
        patch.name = editingCompany.name.trim();
      }
      if (editingCompany.phone !== undefined && editingCompany.phone !== companyDetails.phone) {
        patch.phone = editingCompany.phone.trim() || null;
      }
      if (editingCompany.email !== undefined && editingCompany.email !== companyDetails.email) {
        patch.email = editingCompany.email.trim() || null;
      }
      if (editingCompany.address !== undefined && editingCompany.address !== companyDetails.address) {
        patch.address = editingCompany.address.trim() || null;
      }
      if (editingCompany.addressLink !== undefined && editingCompany.addressLink !== companyDetails.addressLink) {
        patch.addressLink = editingCompany.addressLink.trim() || null;
      }
      if (editingCompany.type !== undefined && editingCompany.type !== companyDetails.type) {
        patch.type = editingCompany.type;
      }
      if (editingCompany.isCustomer !== undefined && editingCompany.isCustomer !== companyDetails.isCustomer) {
        patch.isCustomer = editingCompany.isCustomer;
      }
      if (editingCompany.isClient !== undefined && editingCompany.isClient !== companyDetails.isClient) {
        patch.isClient = editingCompany.isClient;
      }

      if (Object.keys(patch).length > 0) {
        await updateCompanyAction(companyDetails.id, patch);
      }
      
      setIsEditingCompany(false);
      toast.success("Company updated successfully!");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update company");
    } finally {
      setIsSavingCompany(false);
    }
  }, [companyDetails, editingCompany, router]);

  if (error || !companyDetails) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="size-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error loading company</CardTitle>
            <CardDescription>
              {error || "Could not load company information"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Company with ID {companyId} does not exist or could not be found.
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
            <h1 className="text-3xl font-bold text-foreground">{companyDetails.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {companyDetails.isCustomer && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Customer</Badge>
          )}
          {companyDetails.isClient && (
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Client</Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building className="size-5" />
                Company Information
              </CardTitle>
              {isEditingCompany ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEditingCompany}
                    disabled={isSavingCompany}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveCompanyInline}
                    disabled={isSavingCompany}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Save className="size-4 mr-2" />
                    {isSavingCompany ? "Saving..." : "Save"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEditingCompany}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Edit className="size-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingCompany ? (
                <>
                  <div>
                    <Label htmlFor="company-name" className="text-sm mb-2 block">Name</Label>
                    <Input
                      id="company-name"
                      value={editingCompany.name || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-phone" className="text-sm mb-2 block">Phone</Label>
                    <Input
                      id="company-phone"
                      value={editingCompany.phone || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, phone: e.target.value })}
                      placeholder="Enter phone (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-email" className="text-sm mb-2 block">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={editingCompany.email || ""}
                      onChange={(e) => setEditingCompany({ ...editingCompany, email: e.target.value })}
                      placeholder="Enter email (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-address" className="text-sm mb-2 block">Address</Label>
                    <LocationField
                      address={editingCompany.address || ""}
                      addressLink={editingCompany.addressLink || null}
                      onAddressChange={(value: string) => setEditingCompany((prev) => ({ ...prev, address: value }))}
                      onAddressLinkChange={(value: string) => setEditingCompany((prev) => ({ ...prev, addressLink: value }))}
                      onLocationChange={(data) => {
                        setEditingCompany((prev) => ({
                          ...prev,
                          address: data.address,
                          addressLink: data.link,
                        }));
                      }}
                      placeholder="Enter address (optional)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-type" className="text-sm mb-2 block">Tipo</Label>
                    <Select
                      value={editingCompany.type || EMPTY_SELECT_VALUE}
                      onValueChange={(val) => setEditingCompany({ ...editingCompany, type: val === EMPTY_SELECT_VALUE ? null : val as CompanyType })}
                    >
                      <SelectTrigger id="company-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EMPTY_SELECT_VALUE}>No type</SelectItem>
                        {COMPANY_TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="company-is-customer"
                        checked={editingCompany.isCustomer ?? false}
                        onCheckedChange={(checked) => setEditingCompany({ ...editingCompany, isCustomer: !!checked })}
                      />
                      <Label htmlFor="company-is-customer">Customer</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="company-is-client"
                        checked={editingCompany.isClient ?? false}
                        onCheckedChange={(checked) => setEditingCompany({ ...editingCompany, isClient: !!checked })}
                      />
                      <Label htmlFor="company-is-client">Client</Label>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{companyDetails.name}</p>
                  </div>
                  {companyDetails.type && (
                    <div className="flex items-center gap-2">
                      <CompanyTypeBadge type={companyDetails.type} />
                    </div>
                  )}
                  {companyDetails.phone ? (
                    <div className="flex items-start gap-3">
                      <Phone className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="text-foreground">{companyDetails.phone}</p>
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
                  {companyDetails.email ? (
                    <div className="flex items-start gap-3">
                      <Mail className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a href={`mailto:${companyDetails.email}`} className="text-foreground hover:underline">
                          {companyDetails.email}
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
                  {companyDetails.address ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="size-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="text-foreground">{companyDetails.address}</p>
                        {companyDetails.addressLink && (
                          <a
                            href={companyDetails.addressLink}
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
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    {companyDetails.isCustomer && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Customer</Badge>
                    )}
                    {companyDetails.isClient && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Client</Badge>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {companyDetails.notes && companyDetails.notes.length > 0 ? (
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
                  {companyDetails.notes.map((note, index) => (
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
                  No notes for this company
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={handleOpenNotesModal}
                  className="w-full"
                >
                  <Plus className="size-4 mr-2" />
                  Add Notes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contacts Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5" />
                  Contacts
                </CardTitle>
                <CardDescription>
                  {companyDetails.contacts && companyDetails.contacts.length > 0
                    ? `${companyDetails.contacts.length} contact(s) associated`
                    : "This company has no associated contacts"}
                </CardDescription>
              </div>
              {!isAddingContact ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingContact(true)}
                  className="shrink-0"
                >
                  <Plus className="size-4 mr-2" />
                  Add contact
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              {isAddingContact ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select existing contacts to add, or create a new contact.
                  </p>
                  <CompanyContactsSelector
                    selectedContactIds={contactIdsToAdd}
                    contacts={contactsNotInCompany}
                    onContactToggle={handleToggleContactToAdd}
                    onCreateNewContact={handleOpenCreateContact}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleAddSelectedContacts}
                      disabled={contactIdsToAdd.length === 0 || isAddingContactsSaving}
                    >
                      {isAddingContactsSaving ? "Saving..." : "Add selected"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsAddingContact(false);
                        setContactIdsToAdd([]);
                      }}
                      disabled={isAddingContactsSaving}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : !companyDetails.contacts || companyDetails.contacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    No contacts associated with this company
                  </p>
                  <Button variant="outline" onClick={() => setIsAddingContact(true)}>
                    <Plus className="size-4 mr-2" />
                    Add contact
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {companyDetails.contacts.map((contact) => (
                    <Card 
                      key={contact.id} 
                      className="border-l-4 border-l-primary cursor-pointer hover:bg-accent/30 transition-colors"
                      onClick={() => router.push(`/contact/${contact.id}`)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {contact.name || "No name"}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {contact.isCustomer && (
                              <Badge variant="outline">Customer</Badge>
                            )}
                            {contact.isClient && (
                              <Badge variant="outline">Client</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {contact.phone && (
                            <div>
                              <p className="text-muted-foreground">Phone</p>
                              <p className="text-foreground">{contact.phone}</p>
                            </div>
                          )}
                          {contact.email && (
                            <div>
                              <p className="text-muted-foreground">Email</p>
                              <a href={`mailto:${contact.email}`} className="text-foreground hover:underline">
                                {contact.email}
                              </a>
                            </div>
                          )}
                        </div>
                        {contact.address && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-muted-foreground text-sm mb-1">Address</p>
                              <p className="text-sm text-foreground">{contact.address}</p>
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
        </div>
      </div>

      {/* Notes Modal */}
      <NotesEditorModal
        controller={notesModalController}
      />

      {/* Create contact modal (add to company) */}
      <ContactModal
        controller={addContactModalController}
        companies={companies ?? []}
      />
    </div>
  );
}
