"use client";

import * as React from "react";
import type { Company } from "@/company";
import type { ContactFormValue } from "../../domain/mappers";
import { contactRoleOptions } from "@/contact/domain";
import { Checkbox, Icon, Input, Label, Select, useFormHandlers, Textarea } from "@/shared/ui";

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
  const {
    handleTextChange,
    handleCheckboxChange,
    handleNumberSelectChange,
  } = useFormHandlers(value, onChange);

  const [googleEnabled, setGoogleEnabled] = React.useState<boolean>(
    Boolean(value.addressLink && value.addressLink !== "")
  );

  function toggleGoogle(enabled: boolean) {
    setGoogleEnabled(enabled);
    if (!enabled) {
      // Clear addressLink when disabling Google mode
      onChange({ ...value, addressLink: undefined });
    }
  }

  return (
    <div className="space-y-5 rounded-2xl bg-theme-dark/80 p-3 shadow-md">
      <div className="grid gap-2.5 md:grid-cols-[2fr,1.5fr]">
        <div className="space-y-4">
          <Input
            value={value.name}
            onChange={(event) => handleTextChange(event, "name")}
            placeholder="Contact name"
            disabled={disabled}
            required
            leftAddon={<Icon name="lucide:user" size={16} />}
          />
          <Select
            value={value.role ?? ""}
            onChange={(val) => onChange({ ...value, role: val || undefined })}
            disabled={disabled}
            searchable={true}
            icon="lucide:briefcase"
            placeholder="Select role"
            options={[
              { value: "", label: "No role" },
              ...contactRoleOptions,
            ]}
          />
          <Input
            value={value.occupation}
            onChange={(event) => handleTextChange(event, "occupation")}
            placeholder="Custom occupation (optional)"
            disabled={disabled}
            leftAddon={<Icon name="lucide:briefcase" size={16} />}
          />
        </div>
        <div className="space-y-4">
          <Input
            value={value.phone}
            onChange={(event) => handleTextChange(event, "phone")}
            placeholder="Phone number"
            disabled={disabled}
            leftAddon={<Icon name="lucide:phone" size={16} />}
          />
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
      <div>
        <Input
          value={value.address}
          onChange={(event) => handleTextChange(event, "address")}
          placeholder="Address"
          disabled={disabled}
          leftAddon={<Icon name="lucide:map-pin" size={16} />}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="contact-enable-google"
            checked={googleEnabled}
            onChange={(e) => toggleGoogle(e.target.checked)}
            disabled={disabled}
          />
          <Label htmlFor="contact-enable-google">Habilitar Google Maps (autocompletado + mapa)</Label>
        </div>
        {value.addressLink ? (
          <a
            href={value.addressLink}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-blue-400 hover:underline"
          >
            Ver en Google Maps
          </a>
        ) : null}
      </div>
      <div className="space-y-2">
        <Select
          value={value.companyId ?? ""}
          onChange={(val) => handleNumberSelectChange(val, "companyId")}
          disabled={disabled}
          searchable={true}
          icon="lucide:building-2"
          placeholder="No company"
          options={[
            { value: "", label: "No company" },
            ...companies.map((company) => ({
              value: company.id,
              label: company.name,
            })),
          ]}
        />
        {onCreateNewCompany && (
          <button
            type="button"
            onClick={onCreateNewCompany}
            disabled={disabled}
            className="flex items-center gap-2 rounded-lg border border-dashed border-blue-500/30 bg-blue-500/5 px-3 py-2 text-sm text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="lucide:building-2" size={16} />
            <span>Create New Company</span>
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-2xl bg-theme-dark px-3 py-1.5">
          <Checkbox
            id="contact-is-customer"
            checked={value.isCustomer}
            onChange={(e) => handleCheckboxChange(e, "isCustomer")}
            disabled={disabled}
          />
          <Label htmlFor="contact-is-customer">
           Customer
          </Label>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-theme-dark px-3 py-1.5">
          <Checkbox
            id="contact-is-client"
            checked={value.isClient}
            onChange={(e) => handleCheckboxChange(e, "isClient")}
            disabled={disabled}
          />
          <Label htmlFor="contact-is-client">
            PROVEEDOR
          </Label>
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
