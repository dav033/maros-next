"use client";

import { LeadsPageByType } from "@/features/leads/presentation/pages/LeadsPageByType";
import { useLeadTypeStorage } from "@/features/leads/presentation/hooks/useLeadTypeStorage";
import { Select } from "@dav033/dav-components";
import type { SelectOption } from "@dav033/dav-components";
import { LeadType } from "@/leads/domain";
import { SimplePageHeader } from "@dav033/dav-components";

const LEAD_TYPE_OPTIONS: SelectOption[] = [
  { value: LeadType.CONSTRUCTION, label: "Construction" },
  { value: LeadType.ROOFING, label: "Roofing" },
  { value: LeadType.PLUMBING, label: "Plumbing" },
];

export default function LeadsPage() {
  const { leadType, setLeadType, isHydrated } = useLeadTypeStorage();

  if (!isHydrated) {
    return null; // Evitar hidratación incorrecta
  }

  // Asegurar que el valor siempre coincida con una opción válida
  const validLeadType = LEAD_TYPE_OPTIONS.some(opt => opt.value === leadType) 
    ? leadType 
    : LeadType.CONSTRUCTION;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <SimplePageHeader 
          title="Leads" 
          description="Manage your leads"
        />
        <div className="w-48 flex-shrink-0">
          <Select
            value={validLeadType}
            onChange={(value) => {
              if (value && value !== "" && Object.values(LeadType).includes(value as LeadType)) {
                setLeadType(value as LeadType);
              }
            }}
            options={LEAD_TYPE_OPTIONS}
            placeholder="Select Lead Type"
            icon="material-symbols:category"
            searchable={false}
            allowEmpty={false}
          />
        </div>
      </div>
      <LeadsPageByType leadType={validLeadType} />
    </div>
  );
}

