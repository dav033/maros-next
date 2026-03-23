"use client";

import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Briefcase, Receipt, TrendingUp, DollarSign, Plus, Trash2 } from "lucide-react";
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
  isEditMode?: boolean;
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
  isEditMode = false,
}: ProjectFormProps) {
  return (
    <div className="space-y-3 w-full">
      {!isEditMode && (
        <Select
          value={form.leadId != null ? String(form.leadId) : EMPTY_SELECT_VALUE}
          onValueChange={(val) => onChange("leadId", val === EMPTY_SELECT_VALUE ? undefined : Number(val))}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center">
              <Briefcase className="size-4 text-muted-foreground mr-2 shrink-0" />
              <SelectValue placeholder="Select Lead *" />
            </div>
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
      )}

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
          className="w-full"
        />

        <Select
          value={form.invoiceStatus || EMPTY_SELECT_VALUE}
          onValueChange={(val) => onChange("invoiceStatus", val === EMPTY_SELECT_VALUE ? undefined : val)}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center">
              <Receipt className="size-4 text-muted-foreground mr-2 shrink-0" />
              <SelectValue placeholder="Select Invoice Status" />
            </div>
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm flex items-center gap-1.5">
            <DollarSign className="size-4 text-muted-foreground" />
            Payments
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange("payments", [...(form.payments ?? []), 0])}
            disabled={disabled}
            className="shrink-0"
          >
            <Plus className="size-4 mr-1" />
            Add payment
          </Button>
        </div>
        {(form.payments?.length ?? 0) > 0 ? (
          <ul className="space-y-2">
            {(form.payments ?? []).map((amount, index) => (
              <li key={index} className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  value={amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value ? Number(e.target.value) : 0;
                    const next = [...(form.payments ?? [])];
                    next[index] = value;
                    onChange("payments", next);
                  }}
                  placeholder="Amount"
                  disabled={disabled}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const next = (form.payments ?? []).filter((_, i) => i !== index);
                    onChange("payments", next);
                  }}
                  disabled={disabled}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                  aria-label="Remove payment"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No payments recorded</p>
        )}
      </div>

      <Select
        value={form.projectProgressStatus || EMPTY_SELECT_VALUE}
        onValueChange={(val) => onChange("projectProgressStatus", val === EMPTY_SELECT_VALUE ? undefined : val)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center">
            <TrendingUp className="size-4 text-muted-foreground mr-2 shrink-0" />
            <SelectValue placeholder="Select Progress Status" />
          </div>
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
        className="w-full"
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



