"use client";

import { Input, Select, Textarea } from "@dav033/dav-components";
import type { SelectOption } from "@dav033/dav-components";
import { ProjectProgressStatus, InvoiceStatus } from "@/project/domain";
import type { Lead } from "@/leads/domain";

type ProjectFormData = {
  invoiceAmount?: number;
  payments?: number[];
  projectProgressStatus?: string;
  invoiceStatus?: string;
  quickbooks?: boolean;
  overview?: string;
  notes?: string[];
  leadId?: number;
};

type ProjectFormProps = {
  form: ProjectFormData;
  onChange: <K extends keyof ProjectFormData>(
    key: K,
    value: ProjectFormData[K]
  ) => void;
  leads: Lead[];
  disabled?: boolean;
};

export function ProjectForm({
  form,
  onChange,
  leads,
  disabled = false,
}: ProjectFormProps) {
  const leadOptions: SelectOption[] = leads.map((lead) => ({
    value: lead.id,
    label: `${lead.leadNumber} - ${lead.name}`,
  }));

  const projectProgressStatusOptions: SelectOption[] = [
    { value: ProjectProgressStatus.NOT_EXECUTED, label: "Not Executed" },
    { value: ProjectProgressStatus.IN_PROGRESS, label: "In Progress" },
    { value: ProjectProgressStatus.COMPLETED, label: "Completed" },
    { value: ProjectProgressStatus.LOST, label: "Lost" },
    { value: ProjectProgressStatus.POSTPONED, label: "Postponed" },
    { value: ProjectProgressStatus.PERMITS, label: "Permits" },
  ];

  const invoiceStatusOptions: SelectOption[] = [
    { value: InvoiceStatus.PAID, label: "Paid" },
    { value: InvoiceStatus.PENDING, label: "Pending" },
    { value: InvoiceStatus.NOT_EXECUTED, label: "Not Executed" },
    { value: InvoiceStatus.PERMITS, label: "Permits" },
  ];

  return (
    <div className="space-y-3">
      <Select
        options={leadOptions}
        value={form.leadId ?? ""}
        onChange={(val: string) =>
          onChange("leadId", val ? Number(val) : undefined)
        }
        placeholder="Select Lead *"
        icon="material-symbols:briefcase"
        searchable={true}
        disabled={disabled}
        allowEmpty={true}
        emptyLabel="Select Lead"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          step="0.01"
          value={form.invoiceAmount ?? ""}
          onChange={(e) =>
            onChange("invoiceAmount", e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Invoice Amount"
          disabled={disabled}
        />

        <Select
          options={invoiceStatusOptions}
          value={form.invoiceStatus ?? ""}
          onChange={(val: string) => onChange("invoiceStatus", val || undefined)}
          placeholder="Invoice Status"
          icon="material-symbols:receipt"
          searchable={false}
          disabled={disabled}
          allowEmpty={true}
          emptyLabel="Select Invoice Status"
        />
      </div>

      <Select
        options={projectProgressStatusOptions}
        value={form.projectProgressStatus ?? ""}
        onChange={(val: string) => onChange("projectProgressStatus", val || undefined)}
        placeholder="Project Progress Status"
        icon="material-symbols:trending-up"
        searchable={false}
        disabled={disabled}
        allowEmpty={true}
        emptyLabel="Select Progress Status"
      />

      <Textarea
        value={form.overview ?? ""}
        onChange={(e) => onChange("overview", e.target.value || undefined)}
        placeholder="Project Overview (optional)"
        disabled={disabled}
        rows={4}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.quickbooks ?? false}
          onChange={(e) => onChange("quickbooks", e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-gray-300 text-theme-primary focus:ring-theme-primary"
        />
        <label className="text-sm text-gray-700">In QuickBooks</label>
      </div>
    </div>
  );
}



