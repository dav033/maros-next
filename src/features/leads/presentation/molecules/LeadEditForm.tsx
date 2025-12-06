"use client";

import type { Lead } from "@/leads/domain";
import { Input, Select, LocationField } from "@/shared/ui";
import type { SelectOption } from "@/shared/ui";
import type { Contact } from "@/contact/domain";
import type { ProjectType } from "@/projectType/domain";

type LeadEditFormProps = {
  form: {
    leadName: string;
    location: string; // raw address
    addressLink?: string | null;
    projectTypeId?: number;
    contactId?: number;
    leadNumber?: string;
    status?: string;
  };
  onChange: <K extends keyof LeadEditFormProps["form"]>(key: K, value: LeadEditFormProps["form"][K]) => void;
  projectTypes: ProjectType[];
  contacts: Contact[];
  disabled?: boolean;
};

export function LeadEditForm({
  form,
  onChange,
  projectTypes,
  contacts,
  disabled = false,
}: LeadEditFormProps) {
  const projectTypeOptions: SelectOption[] = projectTypes.map((pt) => ({
    value: pt.id,
    label: pt.name,
  }));

  const contactOptions: SelectOption[] = contacts
    .filter((c): c is Contact & { id: number } => typeof c.id === "number")
    .map((c) => ({
      value: c.id,
      label: c.name,
    }));

  return (
    <div className="space-y-4">
      <Input
        label="Lead Name"
        placeholder="Enter lead name"
        value={form.leadName}
        onChange={(e) => onChange("leadName", e.target.value)}
        disabled={disabled}
        required
      />

      <LocationField
        address={form.location}
        addressLink={form.addressLink}
        disabled={disabled}
        onAddressChange={(value) => onChange("location", value)}
        onAddressLinkChange={(value) => onChange("addressLink", value)}
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

      <Select
        options={contactOptions}
        value={form.contactId ?? ""}
        onChange={(val: string) => onChange("contactId", val ? Number(val) : undefined)}
        placeholder="Select Contact *"
        icon="material-symbols:person"
        searchable={true}
        disabled={disabled}
      />
    </div>
  );
}
