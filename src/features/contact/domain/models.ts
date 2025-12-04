export interface Contact {
  id: number;
  name: string;
  occupation?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  address?: string | undefined;
  addressLink?: string | undefined;
  isCustomer: boolean;
  isClient: boolean;
  companyId?: number | null;
  company?: {
    id: number;
    name: string;
    address?: string | undefined;
    type: any;
    serviceId?: number | undefined;
    isCustomer: boolean;
    isClient: boolean;
    notes: string[];
  } | undefined;
  notes: string[];
}

export type ContactDraft = Readonly<{
  name: string;
  phone?: string | null | undefined;
  email?: string | null | undefined;
  occupation?: string | null | undefined;
  address?: string | null | undefined;
  addressLink?: string | null | undefined;
  isCustomer?: boolean | undefined;
  isClient?: boolean | undefined;
  companyId?: number | null | undefined;
  notes?: string[] | null | undefined;
}>;

export type ContactPatch = Readonly<{
  name?: string | undefined;
  occupation?: string | null | undefined;
  phone?: string | null | undefined;
  email?: string | null | undefined;
  address?: string | null | undefined;
  addressLink?: string | null | undefined;
  isCustomer?: boolean | undefined;
  isClient?: boolean | undefined;
  companyId?: number | null | undefined;
  notes?: string[] | null | undefined;
}>;

export type ContactId = number;

export type ContactLike = Readonly<{
  name?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
}>;

export type ContactUniquenessCheck = Readonly<{
  name?: string | undefined;
  email?: string | undefined;
  phone?: string | undefined;
  notes?: string[];
}>;

export type DuplicateCheckOptions = Readonly<{
  useName?: boolean;
  useEmail?: boolean;
  usePhone?: boolean;
}>;

export type UniquenessOptions = Readonly<{
  minLength?: number;
  useName?: boolean;
  useEmail?: boolean;
  usePhone?: boolean;
}>;

export type ContactDraftPolicies = Readonly<{
  maxNameLength?: number;
  minPhoneDigits?: number;
  requireAtLeastOneReach?: boolean;
}>;

export type ContactIntegrityPolicies = Readonly<{
  maxNameLength?: number;
  minPhoneDigits?: number;
}>;

export type ContactValidationPolicies = Readonly<{
  maxNameLength?: number;
  minPhoneDigits?: number;
  requireAtLeastOneReach?: boolean;
}>;

export type ContactField =
  | "name"
  | "email"
  | "phone"
  | "occupation"
  | "address";

export type ValidationIssue = Readonly<{
  field: ContactField | "global";
  code: string;
  message: string;
  details?: Record<string, unknown>;
}>;

export type ApplyContactPatchResult = Readonly<{
  contact: Contact;
  events: ReadonlyArray<{
    type: "ContactUpdated";
    payload: { id: number; changed: string[]; notes?: string[] };
  }>;
}>;
