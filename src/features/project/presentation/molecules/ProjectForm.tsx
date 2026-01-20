"use client";

import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Briefcase, Receipt, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  EMPTY_SELECT_VALUE,
} from "@/components/ui/select";
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

const PROJECT_PROGRESS_OPTIONS = [
  { value: ProjectProgressStatus.NOT_EXECUTED, label: "Not Executed" },
  { value: ProjectProgressStatus.IN_PROGRESS, label: "In Progress" },
  { value: ProjectProgressStatus.COMPLETED, label: "Completed" },
  { value: ProjectProgressStatus.LOST, label: "Lost" },
  { value: ProjectProgressStatus.POSTPONED, label: "Postponed" },
  { value: ProjectProgressStatus.PERMITS, label: "Permits" },
];

const INVOICE_STATUS_OPTIONS = [
  { value: InvoiceStatus.PAID, label: "Paid" },
  { value: InvoiceStatus.PENDING, label: "Pending" },
  { value: InvoiceStatus.NOT_EXECUTED, label: "Not Executed" },
  { value: InvoiceStatus.PERMITS, label: "Permits" },
];

export function ProjectForm({
  form,
  onChange,
  leads,
  disabled = false,
}: ProjectFormProps) {
  return (
    <div className="space-y-3">
      <Select
        value={form.leadId != null ? String(form.leadId) : EMPTY_SELECT_VALUE}
        onValueChange={(val) => onChange("leadId", val === EMPTY_SELECT_VALUE ? undefined : Number(val))}
        disabled={disabled}
      >
        <SelectTrigger>
          <Briefcase className="size-4 text-muted-foreground mr-2" />
          <SelectValue placeholder="Select Lead *" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EMPTY_SELECT_VALUE}>Select Lead</SelectItem>
          {leads.map((lead) => (
            <SelectItem key={lead.id} value={String(lead.id)}>
              {lead.leadNumber} - {lead.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          step="0.01"
          value={form.invoiceAmount ?? ""}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange("invoiceAmount", e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Invoice Amount"
          disabled={disabled}
        />

        <Select
          value={form.invoiceStatus || EMPTY_SELECT_VALUE}
          onValueChange={(val) => onChange("invoiceStatus", val === EMPTY_SELECT_VALUE ? undefined : val)}
          disabled={disabled}
        >
          <SelectTrigger>
            <Receipt className="size-4 text-muted-foreground mr-2" />
            <SelectValue placeholder="Invoice Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY_SELECT_VALUE}>Select Invoice Status</SelectItem>
            {INVOICE_STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select
        value={form.projectProgressStatus || EMPTY_SELECT_VALUE}
        onValueChange={(val) => onChange("projectProgressStatus", val === EMPTY_SELECT_VALUE ? undefined : val)}
        disabled={disabled}
      >
        <SelectTrigger>
          <TrendingUp className="size-4 text-muted-foreground mr-2" />
          <SelectValue placeholder="Project Progress Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EMPTY_SELECT_VALUE}>Select Progress Status</SelectItem>
          {PROJECT_PROGRESS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Textarea
        value={form.overview ?? ""}
        onChange={(e) => onChange("overview", e.target.value || undefined)}
        placeholder="Project Overview (optional)"
        disabled={disabled}
        rows={4}
      />

      <div className="flex items-center gap-2">
        <Checkbox
          id="quickbooks"
          checked={form.quickbooks ?? false}
          onCheckedChange={(checked) => onChange("quickbooks", !!checked)}
          disabled={disabled}
        />
        <Label htmlFor="quickbooks" className="text-sm text-foreground">In QuickBooks</Label>
      </div>
    </div>
  );
}



