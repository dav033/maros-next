"use client";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Briefcase, TrendingUp, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  EMPTY_SELECT_VALUE,
} from "@/components/ui/select";
import { ProjectProgressStatus } from "@/project/domain";
import type { Lead } from "@/leads/domain";

type ProjectFormData = {
  projectProgressStatus?: string;
  overview?: string;
  notes?: string[];
  leadId?: number;
  leadName?: string;
  leadNumber?: string;
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

      {isEditMode && (
        <>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Lead Name</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={form.leadName ?? ""}
                onChange={(event) => onChange("leadName", event.target.value || undefined)}
                placeholder="Lead name"
                disabled={disabled}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Project Number / Lead Number</label>
            <Input
              value={form.leadNumber ?? ""}
              onChange={(event) => onChange("leadNumber", event.target.value || undefined)}
              placeholder="e.g. 001-1123"
              disabled={disabled}
            />
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
        </>
      )}

      <Textarea
        value={form.overview ?? ""}
        onChange={(e) => onChange("overview", e.target.value || undefined)}
        placeholder="Project Overview (optional)"
        disabled={disabled}
        rows={4}
        className="w-full"
      />
    </div>
  );
}



