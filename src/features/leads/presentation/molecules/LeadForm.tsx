"use client";

import { Input, Select, LocationField } from "@dav033/dav-components";
import type { SelectOption } from "@dav033/dav-components";
import { LeadType } from "@/leads/domain";

type ProjectType = { id: number; name: string; color?: string };
type Contact = { id: number; name: string; phone?: string; email?: string };

type LeadFormData = {
  leadNumber: string;
  leadName: string;
  leadType: LeadType;
  projectTypeId?: number;
  contactId?: number;
  location: string;
  addressLink?: string | null;
  status?: string;
  note?: string;
};

type LeadFormProps = {
  form: LeadFormData;
  onChange: <K extends keyof LeadFormData>(
    key: K,
    value: LeadFormData[K]
  ) => void;
  onBatchChange?: (fields: Partial<LeadFormData>) => void;
  projectTypes: ProjectType[];
  contacts: Contact[];
  showContactSelect: boolean;
  disabled?: boolean;
};

export function LeadForm({
  form,
  onChange,
  onBatchChange,
  projectTypes,
  contacts,
  showContactSelect,
  disabled = false,
}: LeadFormProps) {
  const projectTypeOptions: SelectOption[] = projectTypes.map((pt) => ({
    value: pt.id,
    label: pt.name,
  }));

  const contactOptions: SelectOption[] = contacts.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const leadTypeOptions: SelectOption[] = [
    { value: LeadType.CONSTRUCTION, label: "Construction" },
    { value: LeadType.ROOFING, label: "Roofing" },
    { value: LeadType.PLUMBING, label: "Plumbing" },
  ];

  // Asegurar que el valor siempre coincida con una opción válida
  const validLeadType = leadTypeOptions.some(opt => opt.value === form.leadType) 
    ? form.leadType 
    : LeadType.CONSTRUCTION;

  return (
    <div className="space-y-3">
      <Select
        value={validLeadType}
        onChange={(val: string) => {
          if (val && val !== "" && Object.values(LeadType).includes(val as LeadType)) {
            onChange("leadType", val as LeadType);
          }
        }}
        options={leadTypeOptions}
        placeholder="Select Lead Type *"
        icon="material-symbols:category"
        searchable={false}
        disabled={disabled}
        allowEmpty={false}
      />

      <Input
        value={form.leadName}
        onChange={(e) => onChange("leadName", e.target.value)}
        placeholder="Lead Name (optional)"
        disabled={disabled}
      />

      <LocationField
        address={form.location}
        addressLink={form.addressLink}
        disabled={disabled}
        onAddressChange={(value) => onChange("location", value)}
        onAddressLinkChange={(value) => onChange("addressLink", value)}
        onLocationChange={({ address, link }) => {
          if (onBatchChange) {
            onBatchChange({ location: address, addressLink: link || null });
          } else {
            onChange("location", address);
            onChange("addressLink", link || null);
          }
        }}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          options={projectTypeOptions}
          value={form.projectTypeId ?? ""}
          onChange={(val: string) =>
            onChange("projectTypeId", val ? Number(val) : undefined)
          }
          placeholder="Select Project Type *"
          icon="material-symbols:design-services"
          searchable={true}
          disabled={disabled}
          allowEmpty={true}
          emptyLabel="Select Project Type"
        />

        <Select
          options={[
            { value: "NOT_EXECUTED", label: "Not Executed" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "COMPLETED", label: "Completed" },
            { value: "LOST", label: "Lost" },
            { value: "POSTPONED", label: "Postponed" },
            { value: "PERMITS", label: "Permits" },
          ]}
          value={form.status ?? ""}
          onChange={(val: string) => onChange("status", val || undefined)}
          placeholder="Select Status"
          icon="material-symbols:flag"
          searchable={false}
          disabled={disabled}
          allowEmpty={true}
          emptyLabel="Select Status"
        />
      </div>

      {showContactSelect && (
        <Select
          options={contactOptions}
          value={form.contactId ?? ""}
          onChange={(val: string) =>
            onChange("contactId", val ? Number(val) : undefined)
          }
          placeholder="Select Contact *"
          icon="material-symbols:person"
          searchable={true}
          disabled={disabled}
          allowEmpty={true}
          emptyLabel="Select Contact"
        />
      )}

      <Input
        value={form.note ?? ""}
        onChange={(e) => onChange("note", e.target.value)}
        placeholder="Add a note (optional)"
        disabled={disabled}
      />
    </div>
  );
}
