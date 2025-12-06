"use client";

import type { CompanyType, CompanyService } from "../../domain/models";
import type { Contact } from "@/contact";
import { Textarea } from "@/shared/ui";
import {
  CompanyBasicFields,
  CompanyTypeFields,
  CompanyContactsSelector,
  CompanyCheckboxField,
  useCompanyFormHandlers,
} from "./form";

export type CompanyFormValue = {
  name: string;
  address: string;
  addressLink?: string;
  type: CompanyType | null;
  serviceId: number | null;
  isCustomer: boolean;
  isClient: boolean;
  contactIds: number[];
  notes: string[];
  note?: string;
};

export type CompanyFormProps = {
  value: CompanyFormValue;
  onChange: (value: CompanyFormValue) => void;
  disabled?: boolean;
  services?: CompanyService[];
  contacts?: Contact[];
  onCreateNewContact?: () => void;
};

export function CompanyForm({ value, onChange, disabled, services = [], contacts = [], onCreateNewContact }: CompanyFormProps) {
  const {
    handleTextChange,
    handleTypeChange,
    handleServiceChange,
    handleCustomerChange,
    handleClientChange,
    handleContactToggle,
    handleNoteChange,
  } = useCompanyFormHandlers(value, onChange);

  return (
    <div className="space-y-5 rounded-2xl bg-theme-dark/80 p-3 shadow-md">
      <div className="space-y-4">
        <CompanyBasicFields
          name={value.name}
          address={value.address}
          disabled={disabled}
          onNameChange={(event) => handleTextChange(event, "name")}
          onAddressChange={(address) => onChange({ ...value, address })}
          onAddressLinkChange={(addressLink) => onChange({ ...value, addressLink })}
        />

        <CompanyTypeFields
          type={value.type}
          serviceId={value.serviceId}
          disabled={disabled}
          services={services}
          onTypeChange={handleTypeChange}
          onServiceChange={handleServiceChange}
        />

        <CompanyContactsSelector
          selectedContactIds={value.contactIds}
          contacts={contacts}
          disabled={disabled}
          onContactToggle={handleContactToggle}
          onCreateNewContact={onCreateNewContact}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CompanyCheckboxField
          id="company-is-customer"
          label="CUSTOMER"
          checked={value.isCustomer}
          disabled={disabled}
          onChange={handleCustomerChange}
        />

        <CompanyCheckboxField
          id="company-is-client"
          label="PROVEEDOR"
          checked={value.isClient}
          disabled={disabled}
          onChange={handleClientChange}
        />
      </div>

      <Textarea
        value={value.note ?? ""}
        onChange={handleNoteChange}
        placeholder="Add a note (optional)"
        disabled={disabled}
        rows={3}
      />
    </div>
  );
}
