"use client";

import * as React from "react";
import type { Company } from "@/company";
import type { ContactFormValue } from "../../domain/mappers";
import { contactRoleOptions } from "@/contact/domain";
import {
  Checkbox,
  Icon,
  Input,
  Label,
  Select,
  useFormHandlers,
  Textarea,
  LocationField,
} from "@dav033/dav-components";
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
  const { handleTextChange, handleCheckboxChange, handleNumberSelectChange } =
    useFormHandlers(value, onChange);

  return (
    <div className="space-y-5">
      <div className="flex gap-2.5">
        <div className="flex-[2] min-w-0">
          <Input
            value={value.name}
            onChange={(event) => handleTextChange(event, "name")}
            placeholder="Contact name"
            disabled={disabled}
            required
            leftAddon={<Icon name="lucide:user" size={16} />}
          />
        </div>
        <div className="flex-[1.5] min-w-0">
          <Select
            value={value.role ?? ""}
            onChange={(val) => onChange({ ...value, role: val || undefined })}
            disabled={disabled}
            searchable={true}
            icon="lucide:briefcase"
            placeholder="Select role"
            options={[{ value: "", label: "No role" }, ...contactRoleOptions]}
          />
        </div>
      </div>
      <div className="flex gap-2.5">
        <div className="flex-1 min-w-0">
          <Input
            value={value.phone}
            onChange={(event) => handleTextChange(event, "phone")}
            placeholder="Phone number"
            disabled={disabled}
            leftAddon={<Icon name="lucide:phone" size={16} />}
          />
        </div>
        <div className="flex-1 min-w-0">
          <Input
            type="email"
            value={value.email}
            onChange={(event) => handleTextChange(event, "email")}
            placeholder="email@example.com"
            disabled={disabled}
            leftAddon={<Icon name="lucide:mail" size={16} />}
          />
        </div>
      </div>

      <LocationField
        address={value.address || ""}
        addressLink={value.addressLink}
        label="Address"
        placeholder="Enter address"
        googlePlaceholder="Start typing to search address"
        disabled={disabled}
        showHelperText={false}
        onAddressChange={(addr) => onChange({ ...value, address: addr })}
        onAddressLinkChange={(link) =>
          onChange({ ...value, addressLink: link || undefined })
        }
        onLocationChange={({ address, link }) =>
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
            onChange={(e) => handleCheckboxChange(e, "isCustomer")}
            disabled={disabled}
          />
          <Label htmlFor="contact-is-customer">Customer</Label>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5">
          <Checkbox
            id="contact-is-client"
            checked={value.isClient}
            onChange={(e) => handleCheckboxChange(e, "isClient")}
            disabled={disabled}
          />
          <Label htmlFor="contact-is-client">PROVEEDOR</Label>
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
