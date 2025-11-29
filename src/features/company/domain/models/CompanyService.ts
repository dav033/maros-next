export type CompanyServiceId = number;

export interface CompanyService {
  id: CompanyServiceId;
  name: string;
  color?: string | null;
}

export type CompanyServiceDraft = Readonly<{
  name: string;
  color?: string | null;
}>;

export type CompanyServicePatch = Readonly<{
  name?: string | undefined;
  color?: string | null | undefined;
}>;
