import type { CompanyType, CompanyService } from "../../../domain/models";
import { COMPANY_TYPE_OPTIONS, isSubcontractorType } from "./companyTypeOptions";
import { Tag, Wrench } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  EMPTY_SELECT_VALUE,
} from "@/components/ui/select";

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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Select
        value={type || EMPTY_SELECT_VALUE}
        onValueChange={(val) => onTypeChange(val === EMPTY_SELECT_VALUE ? "" : val)}
        disabled={disabled}
      >
        <SelectTrigger>
          <Tag className="size-4 text-muted-foreground mr-2" />
          <SelectValue placeholder="No type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EMPTY_SELECT_VALUE}>No type</SelectItem>
          {COMPANY_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={serviceId != null ? String(serviceId) : EMPTY_SELECT_VALUE}
        onValueChange={(val) => onServiceChange(val === EMPTY_SELECT_VALUE ? "" : val)}
        disabled={disabled || !isSubcontractorType(type)}
      >
        <SelectTrigger>
          <Wrench className="size-4 text-muted-foreground mr-2" />
          <SelectValue placeholder="No service" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EMPTY_SELECT_VALUE}>No service</SelectItem>
          {services.map((service) => (
            <SelectItem key={service.id} value={String(service.id)}>
              {service.color && (
                <span
                  className="inline-block w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: service.color }}
                />
              )}
              {service.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
