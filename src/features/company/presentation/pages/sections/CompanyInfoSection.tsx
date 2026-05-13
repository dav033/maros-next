"use client";

import { Building, Phone, Mail, MapPin } from "lucide-react";
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
import { CompanyTypeBadge } from "../../atoms/CompanyTypeBadge";
import { COMPANY_TYPE_OPTIONS } from "../../molecules/form/companyTypeOptions";
import type { CompanyType } from "../../../domain/models";
import type { UseInlineEditReturn } from "@/common/hooks";

export interface CompanyInfoSectionProps {
  company: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    addressLink?: string;
    type: CompanyType;
    isCustomer: boolean;
    isClient: boolean;
  };
  inlineEdit: UseInlineEditReturn<{
    name: string;
    phone: string;
    email: string;
    address: string;
    addressLink: string;
    type: CompanyType | null;
    isCustomer: boolean;
    isClient: boolean;
  }>;
}

export function CompanyInfoSection({
  company,
  inlineEdit,
}: CompanyInfoSectionProps) {
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
        icon={Building}
        title="Company Information"
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
              <Label htmlFor="company-name" className="text-sm mb-2 block">
                Name
              </Label>
              <Input
                id="company-name"
                value={editingValue.name || ""}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label htmlFor="company-phone" className="text-sm mb-2 block">
                Phone
              </Label>
              <Input
                id="company-phone"
                value={editingValue.phone || ""}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder="Enter phone (optional)"
              />
            </div>
            <div>
              <Label htmlFor="company-email" className="text-sm mb-2 block">
                Email
              </Label>
              <Input
                id="company-email"
                type="email"
                value={editingValue.email || ""}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="Enter email (optional)"
              />
            </div>
            <div>
              <Label htmlFor="company-address" className="text-sm mb-2 block">
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
              <Label htmlFor="company-type" className="text-sm mb-2 block">
                Type
              </Label>
              <Select
                value={editingValue.type || EMPTY_SELECT_VALUE}
                onValueChange={(val) =>
                  setField(
                    "type",
                    val === EMPTY_SELECT_VALUE
                      ? null
                      : (val as CompanyType),
                  )
                }
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
                  checked={editingValue.isCustomer ?? false}
                  onCheckedChange={(checked) =>
                    setField("isCustomer", !!checked)
                  }
                />
                <Label htmlFor="company-is-customer">Customer</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="company-is-client"
                  checked={editingValue.isClient ?? false}
                  onCheckedChange={(checked) =>
                    setField("isClient", !!checked)
                  }
                />
                <Label htmlFor="company-is-client">Client</Label>
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {company.name}
              </p>
            </div>
            {company.type && (
              <div className="flex items-center gap-2">
                <CompanyTypeBadge type={company.type} />
              </div>
            )}
            <DetailField icon={Phone} label="Phone" value={company.phone} />
            <DetailField
              icon={Mail}
              label="Email"
              value={company.email}
              isEmail
            />
            <DetailField
              icon={MapPin}
              label="Address"
              value={company.address}
              linkHref={company.addressLink}
              linkLabel="View on map"
            />
            <div className="flex items-center gap-2 pt-2">
              {company.isCustomer && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  Customer
                </Badge>
              )}
              {company.isClient && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  Client
                </Badge>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
