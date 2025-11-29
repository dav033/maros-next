"use client";

import type { ChangeEvent } from "react";
import { useState, useEffect, useRef } from "react";
import type { CompanyType, CompanyService } from "../../domain/models";
import type { Contact } from "@/contact";
import { Checkbox, Icon, Input, Label, Select } from "@/shared/ui";

export type CompanyFormValue = {
  name: string;
  address: string;
  type: CompanyType;
  serviceId: number | null;
  isCustomer: boolean;
  isClient: boolean;
  contactIds: number[];
  notes: string[];
};

export type CompanyFormProps = {
  value: CompanyFormValue;
  onChange: (value: CompanyFormValue) => void;
  disabled?: boolean;
  services?: CompanyService[];
  contacts?: Contact[];
};

export function CompanyForm({ value, onChange, disabled, services = [], contacts = [] }: CompanyFormProps) {
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const contactsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (contactsDropdownRef.current?.contains(target)) return;
      setIsContactsOpen(false);
    };
    if (isContactsOpen) {
      window.addEventListener("mousedown", onClickOutside);
      return () => window.removeEventListener("mousedown", onClickOutside);
    }
  }, [isContactsOpen]);

  function handleTextChange(
    event: ChangeEvent<HTMLInputElement>,
    key: keyof Pick<CompanyFormValue, "name" | "address">
  ) {
    onChange({ ...value, [key]: event.target.value });
  }

  function handleTypeChange(event: ChangeEvent<HTMLSelectElement>) {
    const newType = event.target.value as CompanyType;
    const shouldResetService = newType !== "SUBCONTRACTOR";
    onChange({
      ...value,
      type: newType,
      serviceId: shouldResetService ? null : value.serviceId,
    });
  }

  function handleServiceChange(newValue: string) {
    const serviceId = newValue === "" ? null : Number(newValue);
    onChange({ ...value, serviceId });
  }

  function handleCustomerChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, isCustomer: event.target.checked });
  }

  function handleClientChange(event: ChangeEvent<HTMLInputElement>) {
    onChange({ ...value, isClient: event.target.checked });
  }

  function handleContactToggle(contactId: number) {
    const currentIds = value.contactIds || [];
    const newIds = currentIds.includes(contactId)
      ? currentIds.filter((id) => id !== contactId)
      : [...currentIds, contactId];
    onChange({ ...value, contactIds: newIds });
  }

  return (
    <div className="space-y-5 rounded-2xl bg-theme-dark/80 p-3 shadow-md">
      <div className="space-y-4">
        <Input
          value={value.name}
          onChange={(event) => handleTextChange(event, "name")}
          placeholder="Company name"
          disabled={disabled}
          required
          leftAddon={<Icon name="lucide:building-2" size={16} />}
        />
        <Input
          value={value.address}
          onChange={(event) => handleTextChange(event, "address")}
          placeholder="Company address"
          disabled={disabled}
          leftAddon={<Icon name="lucide:map-pin" size={16} />}
        />
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon name="lucide:tag" size={16} className="text-gray-400" />
          </div>
          <select
            value={value.type ?? ""}
            onChange={handleTypeChange}
            disabled={disabled}
            className="w-full rounded-lg border border-theme-gray-subtle bg-theme-dark py-2 pl-10 pr-3 text-sm text-gray-200 focus:border-theme-accent focus:outline-none focus:ring-1 focus:ring-theme-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">No type</option>
            <option value="DESIGN">Design</option>
            <option value="HOA">HOA</option>
            <option value="GENERAL_CONTRACTOR">General Contractor</option>
            <option value="SUPPLIER">Supplier</option>
            <option value="SUBCONTRACTOR">Subcontractor</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <Select
          value={value.serviceId ?? ""}
          onChange={handleServiceChange}
          disabled={disabled || value.type !== "SUBCONTRACTOR"}
          searchable={true}
          icon="lucide:wrench"
          placeholder="No service"
          options={[
            { value: "", label: "No service" },
            ...services.map((service) => ({
              value: service.id,
              label: service.name,
              color: service.color,
            })),
          ]}
        />
        {/* Contacts Multi-Select */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsContactsOpen(!isContactsOpen)}
            disabled={disabled}
            className="flex h-10 w-full items-center gap-2 rounded-lg border border-theme-gray-subtle bg-theme-dark px-3 text-left text-sm text-theme-light placeholder:text-gray-400 outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Icon name="lucide:users" size={16} className="text-gray-400" />
            <span className="flex-1 truncate">
              {value.contactIds && value.contactIds.length > 0
                ? `${value.contactIds.length} contact${value.contactIds.length === 1 ? "" : "s"} selected`
                : "Select contacts"}
            </span>
            <Icon
              name={isContactsOpen ? "lucide:chevron-up" : "lucide:chevron-down"}
              size={16}
              className="text-gray-400"
            />
          </button>
          {isContactsOpen && (
            <div
              ref={contactsDropdownRef}
              className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-theme-gray bg-theme-dark shadow-lg"
            >
              {contacts.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400">No contacts available</div>
              ) : (
                contacts.map((contact) => (
                  <label
                    key={contact.id}
                    className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-theme-light hover:bg-theme-gray"
                  >
                    <Checkbox
                      checked={value.contactIds?.includes(contact.id) ?? false}
                      onChange={() => handleContactToggle(contact.id)}
                      disabled={disabled}
                    />
                    <span className="flex-1 truncate">{contact.name}</span>
                  </label>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-theme-dark px-3 py-1.5">
        <Checkbox
          id="company-is-customer"
          checked={value.isCustomer}
          onChange={handleCustomerChange}
          disabled={disabled}
        />
        <Label htmlFor="company-is-customer">
          CUSTOMER
        </Label>
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-theme-dark px-3 py-1.5">
        <Checkbox
          id="company-is-client"
          checked={value.isClient}
          onChange={handleClientChange}
          disabled={disabled}
        />
        <Label htmlFor="company-is-client">
          PROVEEDOR
        </Label>
      </div>
    </div>
  );
}
