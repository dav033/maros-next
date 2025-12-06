"use client";

import { Input, Select, LocationField } from "@/shared/ui";
import type { SelectOption } from "@/shared/ui";

type ProjectType = { id: number; name: string; color?: string };
type Contact = { id: number; name: string; phone?: string; email?: string };

type LeadFormData = {
  leadNumber: string;
  leadName: string;
  projectTypeId?: number;
  contactId?: number;
  location: string; // raw address
  addressLink?: string | null; // Google Maps link
  status?: string;
  note?: string;
};

type LeadFormProps = {
  form: LeadFormData;
  onChange: <K extends keyof LeadFormData>(key: K, value: LeadFormData[K]) => void;
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

  return (
    <div className="space-y-3">
      <Input
        value={form.leadName}
        onChange={(e) => onChange("leadName", e.target.value)}
        placeholder="Lead Name (optional)"
        disabled={disabled}
      />

      {/* Location field with text mode and Google Maps */}
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

      {/* Project Type and Status in the same row */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          options={projectTypeOptions}
          value={form.projectTypeId ?? ""}
          onChange={(val: string) => onChange("projectTypeId", val ? Number(val) : undefined)}
          placeholder="Select Project Type *"
          icon="material-symbols:design-services"
          searchable={true}
          disabled={disabled}
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
        />
      </div>

      {showContactSelect && (
        <Select
          options={contactOptions}
          value={form.contactId ?? ""}
          onChange={(val: string) => onChange("contactId", val ? Number(val) : undefined)}
          placeholder="Select Contact *"
          icon="material-symbols:person"
          searchable={true}
          disabled={disabled}
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
