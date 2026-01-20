"use client";

import { LocationField } from "@/components/custom";
import type { ChangeEvent } from "react";

import { Input } from "@/components/ui/input";
import { FolderTree, Wrench, Flag, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  EMPTY_SELECT_VALUE,
} from "@/components/ui/select";
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

const LEAD_TYPE_OPTIONS = [
  { value: LeadType.CONSTRUCTION, label: "Construction" },
  { value: LeadType.ROOFING, label: "Roofing" },
  { value: LeadType.PLUMBING, label: "Plumbing" },
];

const STATUS_OPTIONS = [
  { value: "NOT_EXECUTED", label: "Not Executed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "LOST", label: "Lost" },
  { value: "POSTPONED", label: "Postponed" },
  { value: "PERMITS", label: "Permits" },
];

export function LeadForm({
  form,
  onChange,
  onBatchChange,
  projectTypes,
  contacts,
  showContactSelect,
  disabled = false,
}: LeadFormProps) {
  const validLeadType = LEAD_TYPE_OPTIONS.some(opt => opt.value === form.leadType) 
    ? form.leadType 
    : LeadType.CONSTRUCTION;

  return (
    <div className="space-y-3">
      <Select
        value={validLeadType}
        onValueChange={(val) => {
          if (val && val !== "" && Object.values(LeadType).includes(val as LeadType)) {
            onChange("leadType", val as LeadType);
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger>
          <FolderTree className="size-4 text-muted-foreground mr-2" />
          <SelectValue placeholder="Select Lead Type *" />
        </SelectTrigger>
        <SelectContent>
          {LEAD_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        value={form.leadName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("leadName", e.target.value)}
        placeholder="Lead Name (optional)"
        disabled={disabled}
      />

      <LocationField
        address={form.location}
        addressLink={form.addressLink}
        disabled={disabled}
        onAddressChange={(value: string) => onChange("location", value)}
        onAddressLinkChange={(value: string) => onChange("addressLink", value)}
        onLocationChange={({ address, link }: { address: string; link: string }) => {
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
          value={form.projectTypeId != null ? String(form.projectTypeId) : EMPTY_SELECT_VALUE}
          onValueChange={(val) => onChange("projectTypeId", val === EMPTY_SELECT_VALUE ? undefined : Number(val))}
          disabled={disabled}
        >
          <SelectTrigger>
            <Wrench className="size-4 text-muted-foreground mr-2" />
            <SelectValue placeholder="Select Project Type *" />
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
          <SelectTrigger>
            <Flag className="size-4 text-muted-foreground mr-2" />
            <SelectValue placeholder="Select Status" />
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

      {showContactSelect && (
        <Select
          value={form.contactId != null ? String(form.contactId) : EMPTY_SELECT_VALUE}
          onValueChange={(val) => onChange("contactId", val === EMPTY_SELECT_VALUE ? undefined : Number(val))}
          disabled={disabled}
        >
          <SelectTrigger>
            <User className="size-4 text-muted-foreground mr-2" />
            <SelectValue placeholder="Select Contact *" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY_SELECT_VALUE}>Select Contact</SelectItem>
            {contacts.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Input
        value={form.note ?? ""}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange("note", e.target.value)}
        placeholder="Add a note (optional)"
        disabled={disabled}
      />
    </div>
  );
}
