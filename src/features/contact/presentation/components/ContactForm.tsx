"use client";

import type { Company } from "@/company";
import type { ContactFormValue } from "../../domain/mappers";
import { Checkbox, Icon, Input, Label, Select, useFormHandlers, Textarea } from "@/shared/ui";

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
  const {
    handleTextChange,
    handleCheckboxChange,
    handleNumberSelectChange,
  } = useFormHandlers(value, onChange);

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
      </div>
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
      <div>
        <Textarea
          value={value.note ?? ""}
          onChange={(event) => onChange({ ...value, note: event.target.value })}
          placeholder="Add a note (optional)"
          disabled={disabled}
          rows={3}
        />
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
  );
}
