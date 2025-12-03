import { CompanyType } from "../../../domain/models";

export const COMPANY_TYPE_OPTIONS = [
  { value: "DESIGN", label: "Design" },
  { value: "HOA", label: "HOA" },
  { value: "GENERAL_CONTRACTOR", label: "General Contractor" },
  { value: "SUPPLIER", label: "Supplier" },
  { value: "SUBCONTRACTOR", label: "Subcontractor" },
  { value: "OTHER", label: "Other" },
] as const;

export function isSubcontractorType(type: CompanyType | null): boolean {
  return type === "SUBCONTRACTOR";
}
