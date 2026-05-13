"use client";

import { User, Phone, Mail, MapPin, Building, Briefcase, Plus, Link as LinkIcon, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, EMPTY_SELECT_VALUE } from "@/components/ui/select";
import { DetailField, InlineEditCardHeader, LocationField, DeleteFeedbackModal } from "@/components/shared";
import { ContactModeSelector, ContactMode } from "@/leads/presentation";
import { ContactCompanySelector } from "@/features/contact/presentation/molecules/ContactCompanySelector";
import { contactRoleOptions } from "@/contact/domain";
import type { UseInlineEditReturn } from "@/common/hooks";
import Link from "next/link";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export interface LeadContactSectionProps {
  contact: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    addressLink?: string;
    isCustomer: boolean;
    isClient: boolean;
    role?: string;
    company?: {
      id: number;
      name: string;
      phone?: string;
      email?: string;
      address?: string;
      addressLink?: string;
      isCustomer: boolean;
      isClient: boolean;
    } | null;
  } | null;
  companies: any[];
  contacts: any[];
  inlineEdit: UseInlineEditReturn<{
    name: string;
    phone: string;
    email: string;
    address: string;
    addressLink: string;
    role: string;
    companyId: number | null;
    isCustomer: boolean;
    isClient: boolean;
  }>;
  onOpenCompanyModal: (target: "existingContact" | "editingContact" | "newContactDraft") => void;
  onRemoveContact: () => Promise<void>;
  onLinkContact: (mode: ContactMode, contactId?: number, newContact?: any) => Promise<void>;
}

export function LeadContactSection({
  contact,
  companies,
  contacts,
  inlineEdit,
  onOpenCompanyModal,
  onRemoveContact,
  onLinkContact,
}: LeadContactSectionProps) {
  const {
    isEditing,
    editingValue,
    isSaving,
    startEdit,
    cancelEdit,
    saveEdit,
    setField,
    setFields,
  } = inlineEdit;

  const [isRemoving, setIsRemoving] = useState(false);
  
  // Link contact state
  const [isLinking, setIsLinking] = useState(false);
  const [contactMode, setContactMode] = useState<ContactMode>(ContactMode.EXISTING_CONTACT);
  const [selectedContactId, setSelectedContactId] = useState<number | undefined>();
  const [newContactCompanyId, setNewContactCompanyId] = useState<number | null>(null);
  const [newContactForm, setNewContactForm] = useState({
    contactName: "",
    phone: "",
    email: "",
  });

  const handleLink = async () => {
    setIsLinking(true);
    try {
      await onLinkContact(contactMode, selectedContactId, { ...newContactForm, companyId: newContactCompanyId });
    } finally {
      setIsLinking(false);
    }
  };

  const handleRemove = async () => {
    await onRemoveContact();
    setIsRemoving(false);
  };

  if (!contact) {
    return (
      <Card>
        <InlineEditCardHeader
          icon={User}
          title="Contact Information"
          isEditing={false}
          onEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          extraActions={null}
        />
        <CardContent className="space-y-4">
          <ContactModeSelector
            contactMode={contactMode}
            onContactModeChange={setContactMode}
            contacts={contacts}
            selectedContactId={selectedContactId}
            onContactSelect={setSelectedContactId}
            form={newContactForm}
            onChange={(field, value) => setNewContactForm((p) => ({ ...p, [field]: value }))}
          />
          {contactMode === ContactMode.NEW_CONTACT && (
            <div className="mt-3">
              <Label className="text-xs mb-1 block">Company (Optional)</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <ContactCompanySelector
                    selectedCompanyId={newContactCompanyId}
                    companies={companies}
                    onCompanyChange={setNewContactCompanyId}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onOpenCompanyModal("newContactDraft")}
                  type="button"
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>
          )}
          <Button
            className="w-full"
            onClick={handleLink}
            disabled={
              isLinking ||
              (contactMode === ContactMode.EXISTING_CONTACT && !selectedContactId) ||
              (contactMode === ContactMode.NEW_CONTACT && !newContactForm.contactName.trim())
            }
          >
            <LinkIcon className="size-4 mr-2" />
            {isLinking ? "Linking..." : "Link Contact"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <InlineEditCardHeader
          icon={User}
          title="Contact Information"
          isEditing={isEditing}
          isSaving={isSaving}
          onEdit={startEdit}
          onSave={saveEdit}
          onCancel={cancelEdit}
          extraActions={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRemoving(true)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash className="size-4 mr-2" />
              Remove
            </Button>
          }
        />
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div>
                <Label htmlFor="contact-name" className="text-sm mb-2 block">Name</Label>
                <Input
                  id="contact-name"
                  value={editingValue.name || ""}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="Enter name"
                />
              </div>
              <div>
                <Label htmlFor="contact-phone" className="text-sm mb-2 block">Phone</Label>
                <Input
                  id="contact-phone"
                  value={editingValue.phone || ""}
                  onChange={(e) => setField("phone", e.target.value)}
                  placeholder="Enter phone (optional)"
                />
              </div>
              <div>
                <Label htmlFor="contact-email" className="text-sm mb-2 block">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={editingValue.email || ""}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="Enter email (optional)"
                />
              </div>
              <div>
                <Label htmlFor="contact-address" className="text-sm mb-2 block">Address</Label>
                <LocationField
                  address={editingValue.address || ""}
                  addressLink={editingValue.addressLink || null}
                  onAddressChange={(value: string) => setField("address", value)}
                  onAddressLinkChange={(value: string) => setField("addressLink", value)}
                  onLocationChange={(data) => {
                    setFields({
                      address: data.address,
                      addressLink: data.link,
                    });
                  }}
                  placeholder="Enter address (optional)"
                />
              </div>
              <div>
                <Label htmlFor="contact-role" className="text-sm mb-2 block">Role</Label>
                <Select
                  value={editingValue.role || EMPTY_SELECT_VALUE}
                  onValueChange={(val) => setField("role", val === EMPTY_SELECT_VALUE ? "" : val)}
                >
                  <SelectTrigger id="contact-role">
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
                  selectedCompanyId={editingValue.companyId ?? null}
                  companies={companies || []}
                  onCompanyChange={(companyId) => setField("companyId", companyId)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenCompanyModal("editingContact")}
                  className="mt-2"
                >
                  <Plus className="size-3 mr-1" /> Create Company
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="contact-is-customer"
                    checked={editingValue.isCustomer ?? false}
                    onCheckedChange={(checked) => setField("isCustomer", !!checked)}
                  />
                  <Label htmlFor="contact-is-customer">Customer</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="contact-is-client"
                    checked={editingValue.isClient ?? false}
                    onCheckedChange={(checked) => setField("isClient", !!checked)}
                  />
                  <Label htmlFor="contact-is-client">Supplier</Label>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <Link href={`/contact/${contact.id}`} className="text-lg font-semibold text-primary hover:underline">
                  {contact.name}
                </Link>
              </div>
              <DetailField icon={Phone} label="Phone" value={contact.phone} />
              <DetailField icon={Mail} label="Email" value={contact.email} isEmail />
              <DetailField icon={MapPin} label="Address" value={contact.address} linkHref={contact.addressLink} linkLabel="View on map" />
              <DetailField icon={Briefcase} label="Role" value={contact.role} />
              
              <div className="flex items-center gap-2 pt-2">
                {contact.isCustomer && <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Customer</Badge>}
                {contact.isClient && <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Supplier</Badge>}
              </div>

              {/* Show company if present */}
              {contact.company && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Building className="size-4 text-muted-foreground" />
                    <p className="font-medium text-sm text-foreground">Associated Company</p>
                  </div>
                  <div className="space-y-3 bg-muted/30 p-3 rounded-md">
                    <Link href={`/company/${contact.company.id}`} className="font-medium text-primary hover:underline text-sm block">
                      {contact.company.name}
                    </Link>
                    <DetailField icon={Phone} label="Company Phone" value={contact.company.phone} />
                    <DetailField icon={Mail} label="Company Email" value={contact.company.email} isEmail />
                    <DetailField icon={MapPin} label="Company Address" value={contact.company.address} linkHref={contact.company.addressLink} />
                    <div className="flex items-center gap-2 pt-1">
                      {contact.company.isCustomer && <Badge variant="secondary" className="text-xs">Customer</Badge>}
                      {contact.company.isClient && <Badge variant="secondary" className="text-xs">Supplier</Badge>}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <DeleteFeedbackModal
        isOpen={isRemoving}
        onClose={() => setIsRemoving(false)}
        onConfirm={handleRemove}
        title="Remove Contact"
        description={`Are you sure you want to remove ${contact.name} from this lead? The contact will not be deleted from the system.`}
      />
    </>
  );
}
