"use client";

import type { ChangeEvent } from "react";
import type { Company } from "@/company";
import { Checkbox, Icon, Input, Label, Select } from "@/shared/ui";

export type ContactFormValue = {
  name: string;
  phone: string;
  email: string;
  occupation: string;
  address: string;
  isCustomer: boolean;
  isClient: boolean;
  companyId: number | null;
};

export type ContactFormProps = {
  value: ContactFormValue;
  onChange: (value: ContactFormValue) => void;
  disabled?: boolean;
  companies?: Company[];
};

export function ContactForm({
  value,
  onChange,
  disabled,
  companies = [],
}: ContactFormProps) {
  function handleTextChange(
    event: ChangeEvent<HTMLInputElement>,
    key: keyof Omit<ContactFormValue, "isCustomer" | "isClient" | "companyId">
  ) {
    onChange({ ...value, [key]: event.target.value });
  }

  function handleCustomerChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, isCustomer: event.target.checked });
  }

  function handleClientChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, isClient: event.target.checked });
  }

  function handleCompanyChange(newValue: string) {
    const companyId = newValue === "" ? null : Number(newValue);
    onChange({ ...value, companyId });
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
          <Input
            value={value.occupation}
            onChange={(event) => handleTextChange(event, "occupation")}
            placeholder="Role or occupation"
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
      <div>
        <Select
          value={value.companyId ?? ""}
          onChange={handleCompanyChange}
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
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-theme-dark px-3 py-1.5">
        <Checkbox
          id="contact-is-customer"
          checked={value.isCustomer}
          onChange={handleCustomerChange}
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
          onChange={handleClientChange}
          disabled={disabled}
        />
        <Label htmlFor="contact-is-client">
          PROVEEDOR
        </Label>
      </div>
    </div>
  );
}
