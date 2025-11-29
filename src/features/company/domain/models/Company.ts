export enum CompanyType {
  HOA = "HOA",
  GENERAL_CONTRACTOR = "GENERAL_CONTRACTOR",
  SUPPLIER = "SUPPLIER",
  SUBCONTRACTOR = "SUBCONTRACTOR",
  OTHER = "OTHER",
}

export type CompanyId = number;

export interface Company {
  id: CompanyId;
  name: string;
  address?: string | undefined;
  type: CompanyType;
  serviceId?: number | null;
  isCustomer: boolean;
  isClient: boolean;
  notes: string[];
}

export type CompanyDraft = Readonly<{
  name: string;
  address?: string | undefined;
  type: CompanyType;
  serviceId?: number | null;
  isCustomer?: boolean | undefined;
  isClient?: boolean | undefined;
  notes?: string[];
}>;

export type CompanyPatch = Readonly<{
  name?: string | undefined;
  address?: string | undefined;
  type?: CompanyType | undefined;
  serviceId?: number | null | undefined;
  isCustomer?: boolean | undefined;
  isClient?: boolean | undefined;
  notes?: string[];
}>;
