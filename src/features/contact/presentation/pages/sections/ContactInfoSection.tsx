"use client";

import { User, Phone, Mail, MapPin, Building, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  EMPTY_SELECT_VALUE,
} from "@/components/ui/select";
import { DetailField, InlineEditCardHeader, LocationField } from "@/components/shared";
import { ContactCompanySelector } from "@/features/contact/presentation/molecules/ContactCompanySelector";
import { contactRoleOptions } from "@/contact/domain";
import type { UseInlineEditReturn } from "@/common/hooks";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export interface ContactInfoSectionProps {
  contact: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    addressLink?: string;
    role?: string;
    isCustomer: boolean;
    isClient: boolean;
    company?: {
      id: number;
      name: string;
    };
  };
  companies: any[];
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
  onOpenCompanyModal: () => void;
}

export function ContactInfoSection({
  contact,
  companies,
  inlineEdit,
  onOpenCompanyModal,
}: ContactInfoSectionProps) {
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

  return (
    <Card>
      <InlineEditCardHeader
        icon={User}
        title="Contact Information"
        isEditing={isEditing}
        isSaving={isSaving}
        onEdit={startEdit}
        onSave={saveEdit}
        onCancel={cancelEdit}
      />
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <Label htmlFor="contact-name" className="text-sm mb-2 block">
                Name
              </Label>
              <Input
                id="contact-name"
                value={editingValue.name || ""}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div>
              <Label htmlFor="contact-phone" className="text-sm mb-2 block">
                Phone
              </Label>
              <Input
                id="contact-phone"
                value={editingValue.phone || ""}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="Enter phone (optional)"
              />
            </div>
            <div>
              <Label htmlFor="contact-email" className="text-sm mb-2 block">
                Email
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={editingValue.email || ""}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="Enter email (optional)"
              />
            </div>
            <div>
              <Label htmlFor="contact-address" className="text-sm mb-2 block">
                Address
              </Label>
              <LocationField
                address={editingValue.address || ""}
                addressLink={editingValue.addressLink || null}
                onAddressChange={(value: string) => setField("address", value)}
                onAddressLinkChange={(value: string) =>
                  setField("addressLink", value)
                }
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
              <Label htmlFor="contact-role" className="text-sm mb-2 block">
                Role
              </Label>
              <Select
                value={editingValue.role || EMPTY_SELECT_VALUE}
                onValueChange={(val) =>
                  setField("role", val === EMPTY_SELECT_VALUE ? "" : val)
                }
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
              <Label htmlFor="contact-company" className="text-sm mb-2 block">
                Company
              </Label>
              <ContactCompanySelector
                selectedCompanyId={editingValue.companyId ?? null}
                companies={companies || []}
                onCompanyChange={(companyId) => setField("companyId", companyId)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="contact-is-customer"
                  checked={editingValue.isCustomer ?? false}
                  onCheckedChange={(checked) =>
                    setField("isCustomer", !!checked)
                  }
                />
                <Label htmlFor="contact-is-customer">Customer</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="contact-is-client"
                  checked={editingValue.isClient ?? false}
                  onCheckedChange={(checked) =>
                    setField("isClient", !!checked)
                  }
                />
                <Label htmlFor="contact-is-client">Supplier</Label>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {contact.name}
              </p>
            </div>
            <DetailField icon={Phone} label="Phone" value={contact.phone} />
            <DetailField
              icon={Mail}
              label="Email"
              value={contact.email}
              isEmail
            />
            <DetailField
              icon={MapPin}
              label="Address"
              value={contact.address}
              linkHref={contact.addressLink}
              linkLabel="View on map"
            />
            <DetailField
              icon={Building}
              label="Company"
              value={contact.company?.name}
              onAdd={!contact.company ? onOpenCompanyModal : undefined}
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
            <DetailField icon={Briefcase} label="Role" value={contact.role} />

            <div className="flex items-center gap-2 pt-2">
              {contact.isCustomer && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  Customer
                </Badge>
              )}
              {contact.isClient && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  Supplier
                </Badge>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
