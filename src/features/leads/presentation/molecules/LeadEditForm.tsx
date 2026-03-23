"use client";

import { LocationField } from "@/components/shared";
import type { ChangeEvent } from "react";

import { Input } from "@/components/ui/input";
import { Wrench, Flag, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  EMPTY_SELECT_VALUE,
} from "@/components/ui/select";
import type { Contact } from "@/contact/domain";
import type { ProjectType } from "@/projectType/domain";

type LeadEditFormProps = {
  form: {
    leadName: string;
    location: string;
    addressLink?: string | null;
    projectTypeId?: number;
    contactId?: number;
    leadNumber?: string;
    status?: string;
  };
  onChange: <K extends keyof LeadEditFormProps["form"]>(
    key: K,
    value: LeadEditFormProps["form"][K]
  ) => void;
  projectTypes: ProjectType[];
  contacts: Contact[];
  disabled?: boolean;
};

const STATUS_OPTIONS = [
  { value: "NOT_EXECUTED", label: "Not Executed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "LOST", label: "Lost" },
  { value: "POSTPONED", label: "Postponed" },
  { value: "PERMITS", label: "Permits" },
];

export function LeadEditForm({
  form,
  onChange,
  projectTypes,
  contacts,
  disabled = false,
}: LeadEditFormProps) {
  const validContacts = contacts.filter(
    (c): c is Contact & { id: number } => typeof c.id === "number"
  );

  return (
    <div className="space-y-4 w-full">
      <Input
        placeholder="Enter lead name"
        value={form.leadName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("leadName", e.target.value)}
        disabled={disabled}
        required
        className="w-full"
      />

      <LocationField
        address={form.location}
        addressLink={form.addressLink}
        disabled={disabled}
        onAddressChange={(value: string) => onChange("location", value)}
        onAddressLinkChange={(value: string) => onChange("addressLink", value)}
        className="w-full"
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          value={form.projectTypeId != null ? String(form.projectTypeId) : EMPTY_SELECT_VALUE}
          onValueChange={(val) => onChange("projectTypeId", val === EMPTY_SELECT_VALUE ? undefined : Number(val))}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center">
              <Wrench className="size-4 text-muted-foreground mr-2 shrink-0" />
              <SelectValue placeholder="Select Project Type *" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY_SELECT_VALUE}>Select Project Type</SelectItem>
            {projectTypes.map((pt) => (
              <SelectItem key={pt.id} value={String(pt.id)}>
                {pt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={form.status || EMPTY_SELECT_VALUE}
          onValueChange={(val) => onChange("status", val === EMPTY_SELECT_VALUE ? undefined : val)}
          disabled={disabled}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center">
              <Flag className="size-4 text-muted-foreground mr-2 shrink-0" />
              <SelectValue placeholder="Select Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY_SELECT_VALUE}>Select Status</SelectItem>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select
        value={form.contactId != null ? String(form.contactId) : EMPTY_SELECT_VALUE}
        onValueChange={(val) => onChange("contactId", val === EMPTY_SELECT_VALUE ? undefined : Number(val))}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <div className="flex items-center">
            <User className="size-4 text-muted-foreground mr-2 shrink-0" />
            <SelectValue placeholder="Select Contact" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EMPTY_SELECT_VALUE}>Select Contact</SelectItem>
          {validContacts.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
