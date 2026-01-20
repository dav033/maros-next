"use client";

import { LeadsPageByType } from "@/features/leads/presentation/pages/LeadsPageByType";
import { useLeadTypeStorage } from "@/features/leads/presentation/hooks/useLeadTypeStorage";
import { LeadType } from "@/leads/domain";
import { FolderTree } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LEAD_TYPE_OPTIONS = [
  { value: LeadType.CONSTRUCTION, label: "Construction" },
  { value: LeadType.ROOFING, label: "Roofing" },
  { value: LeadType.PLUMBING, label: "Plumbing" },
];

export function LeadsPageClient() {
  const { leadType, setLeadType, isHydrated } = useLeadTypeStorage();

  if (!isHydrated) {
    return null;
  }

  const validLeadType = LEAD_TYPE_OPTIONS.some(opt => opt.value === leadType) 
    ? leadType 
    : LeadType.CONSTRUCTION;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Leads</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Manage your leads</p>
        </header>
        <div className="w-48 flex-shrink-0">
          <Select
            value={validLeadType}
            onValueChange={(value) => {
              if (value && value !== "" && Object.values(LeadType).includes(value as LeadType)) {
                setLeadType(value as LeadType);
              }
            }}
          >
            <SelectTrigger>
              <FolderTree className="size-4 text-muted-foreground mr-2" />
              <SelectValue placeholder="Select Lead Type" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <LeadsPageByType leadType={validLeadType} />
    </div>
  );
}



