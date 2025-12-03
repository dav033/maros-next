import { Select } from "@/shared/ui";
import type { CompanyType, CompanyService } from "../../../domain/models";
import { COMPANY_TYPE_OPTIONS, isSubcontractorType } from "./companyTypeOptions";

interface CompanyTypeFieldsProps {
  type: CompanyType | null;
  serviceId: number | null;
  disabled?: boolean;
  services: CompanyService[];
  onTypeChange: (value: string) => void;
  onServiceChange: (value: string) => void;
}

export function CompanyTypeFields({
  type,
  serviceId,
  disabled,
  services,
  onTypeChange,
  onServiceChange,
}: CompanyTypeFieldsProps) {
  return (
    <>
      <Select
        value={type ?? ""}
        onChange={onTypeChange}
        disabled={disabled}
        icon="lucide:tag"
        placeholder="No type"
        emptyLabel="No type"
        options={COMPANY_TYPE_OPTIONS}
      />
      <Select
        value={serviceId ?? ""}
        onChange={onServiceChange}
        disabled={disabled || !isSubcontractorType(type)}
        searchable={true}
        icon="lucide:wrench"
        placeholder="No service"
        options={[
          { value: "", label: "No service" },
          ...services.map((service) => ({
            value: service.id,
            label: service.name,
            color: service.color,
          })),
        ]}
      />
    </>
  );
}
