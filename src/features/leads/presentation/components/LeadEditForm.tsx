"use client";

import type { Lead } from "@/leads";
import { Input, Select } from "@/shared/ui";
import type { SelectOption } from "@/shared/ui";
import type { Contact } from "@/contact";
import type { ProjectType } from "@/projectType";

type LeadEditFormProps = {
  form: {
    leadName: string;
    location: string;
    projectTypeId?: number;
    contactId?: number;
    leadNumber?: string;
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

  const contactOptions: SelectOption[] = contacts.map((c) => ({
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

      <Input
        label="Location"
        placeholder="Enter location"
        value={form.location}
        onChange={(e) => onChange("location", e.target.value)}
        disabled={disabled}
      />

      <Input
        label="Lead Number (Optional)"
        placeholder="Auto-generated if empty"
        value={form.leadNumber ?? ""}
        onChange={(e) => onChange("leadNumber", e.target.value)}
        disabled={disabled}
      />

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
