"use client";

import { LocationField } from "@/components/shared";
import * as React from "react";
import type { ChangeEvent } from "react";
import { useFormHandlers } from "@/common/hooks";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  EMPTY_SELECT_VALUE,
} from "@/components/ui/select";

import type { Company } from "@/company";
import type { ContactFormValue } from "../../domain/mappers";
import { contactRoleOptions } from "@/contact/domain";
import { User, Briefcase, Phone, Mail } from "lucide-react";
import { ContactCompanySelector } from "./ContactCompanySelector";

export type ContactFormProps = {
  value: ContactFormValue;
  onChange: (value: ContactFormValue) => void;
  disabled?: boolean;
  companies?: Company[];
  onCreateNewCompany?: () => void;
};

export function ContactForm({
  value,
  onChange,
  disabled,
  companies = [],
  onCreateNewCompany,
}: ContactFormProps) {
  const { handleTextChange } = useFormHandlers(value, onChange);

  return (
    <div className="space-y-5">
      <div className="flex gap-2.5">
        <div className="flex-[2] min-w-0 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <User className="size-4" />
          </div>
          <Input
            value={value.name}
            onChange={(event: ChangeEvent<HTMLInputElement>) => handleTextChange(event, "name")}
            placeholder="Contact name"
            disabled={disabled}
            required
            className="pl-10"
          />
        </div>
        <div className="flex-[1.5] min-w-0">
          <Select
            value={value.role || EMPTY_SELECT_VALUE}
            onValueChange={(val) => onChange({ ...value, role: val === EMPTY_SELECT_VALUE ? undefined : val })}
            disabled={disabled}
          >
            <SelectTrigger>
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
      </div>
      <div className="flex gap-2.5">
        <div className="flex-1 min-w-0 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Phone className="size-4" />
          </div>
          <Input
            value={value.phone}
            onChange={(event: ChangeEvent<HTMLInputElement>) => handleTextChange(event, "phone")}
            placeholder="Phone number"
            disabled={disabled}
            className="pl-10"
          />
        </div>
        <div className="flex-1 min-w-0 relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Mail className="size-4" />
          </div>
          <Input
            type="email"
            value={value.email}
            onChange={(event: ChangeEvent<HTMLInputElement>) => handleTextChange(event, "email")}
            placeholder="email@example.com"
            disabled={disabled}
            className="pl-10"
          />
        </div>
      </div>

      <LocationField
        address={value.address || ""}
        addressLink={value.addressLink}
        label="Address"
        placeholder="Enter address"
        disabled={disabled}
        onAddressChange={(addr: string) => onChange({ ...value, address: addr })}
        onAddressLinkChange={(link: string) =>
          onChange({ ...value, addressLink: link || undefined })
        }
        onLocationChange={({ address, link }: { address: string; link: string }) =>
          onChange({ ...value, address, addressLink: link || undefined })
        }
      />

      <div className="space-y-2">
        <ContactCompanySelector
          selectedCompanyId={value.companyId ?? null}
          companies={companies}
          disabled={disabled}
          onCompanyChange={(companyId) => onChange({ ...value, companyId })}
          onCreateNewCompany={onCreateNewCompany}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5">
          <Checkbox
            id="contact-is-customer"
            checked={value.isCustomer}
            onCheckedChange={(checked) => onChange({ ...value, isCustomer: !!checked })}
            disabled={disabled}
          />
          <Label htmlFor="contact-is-customer">Customer</Label>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5">
          <Checkbox
            id="contact-is-client"
            checked={value.isClient}
            onCheckedChange={(checked) => onChange({ ...value, isClient: !!checked })}
            disabled={disabled}
          />
          <Label htmlFor="contact-is-client">Supplier</Label>
        </div>
      </div>
      <div>
        <Textarea
          value={value.note ?? ""}
          onChange={(event) => onChange({ ...value, note: event.target.value })}
          placeholder="Add a note (optional)"
          disabled={disabled}
          rows={3}
        />
      </div>
    </div>
  );
}
