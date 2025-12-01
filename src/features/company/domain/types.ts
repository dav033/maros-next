export type CompanyId = number;

export type CompanyType =
  | "DESIGN"
  | "HOA"
  | "GENERAL_CONTRACTOR"
  | "SUPPLIER"
  | "SUBCONTRACTOR"
  | "OTHER"
  | null;

export interface Company {
  id: CompanyId;
  name: string;
  address: string;
  type: CompanyType;
  serviceId: number | null;
  isCustomer: boolean;
  notes: string[];
}

export interface CompanyDraft {
  name: string;
  address: string;
  type: CompanyType;
  serviceId?: number | null;
  isCustomer: boolean;
  notes?: string[];
}

export interface CompanyPatch {
  name?: string;
  address?: string;
  type?: CompanyType;
  serviceId?: number | null;
  isCustomer?: boolean;
  notes?: string[];
}

export interface CompanyPolicies {}
export interface CompanyPatchPolicies {}
