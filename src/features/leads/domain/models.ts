import type { Contact } from "@/contact/domain";
import type { ProjectType } from "@/projectType/domain";
import type { ISODate } from "@/shared/domain";

export enum LeadStatus {
  NEW_LEAD = "NEW_LEAD",
  CONTACTED = "CONTACTED",
  ESTIMATING_PREPARING_PROPOSAL = "ESTIMATING_PREPARING_PROPOSAL",
  PROPOSAL_SENT = "PROPOSAL_SENT",
  FOLLOW_UP = "FOLLOW_UP",
  WON = "WON",
  LOST = "LOST",
}

export enum LeadType {
  CONSTRUCTION = "CONSTRUCTION",
  PLUMBING = "PLUMBING",
  ROOFING = "ROOFING",
}

export interface Lead {
  id: number;
  leadNumber: string;
  name: string;
  startDate: string | null;
  location?: string | undefined;
  addressLink?: string | undefined;
  status: LeadStatus;
  contact: Contact;
  projectType: ProjectType;
  project?: {
    id: number;
  } | null;
  notes: string[];
  attachments: string[];
  inReview: boolean;
  estimate: number | null;
}

export type LeadId = number;
export type ContactId = number;
export type ProjectTypeId = number;

export type NewContact = Readonly<{
  name: string;
  phone: string;
  email: string;
  companyId?: number;
}>;

export type LeadPolicies = Readonly<{
  leadNumberPattern?: RegExp;
  allowedTransitions?: Partial<Record<LeadStatus, LeadStatus[]>>;
}>;

type LeadDraftBase = Readonly<{
  leadNumber: string | null;
  name: string;
  startDate: ISODate;
  location: string;
  addressLink?: string | null;
  status: LeadStatus | null;
  projectTypeId: ProjectTypeId;
  inReview?: boolean;
}>;

export type LeadDraftWithNewContact = LeadDraftBase &
  Readonly<{
    contact: NewContact;
  }>;

export type LeadDraftWithExistingContact = LeadDraftBase &
  Readonly<{
    contactId: ContactId;
  }>;

export type LeadDraft = LeadDraftWithNewContact | LeadDraftWithExistingContact;

export type LeadPatch = Readonly<{
  name?: string;
  location?: string;
  addressLink?: string | null;
  status?: LeadStatus | null;
  contactId?: number;
  projectTypeId?: number;
  startDate?: ISODate;
  leadNumber?: string | null;
  notes?: string[];
  attachments?: string[];
  inReview?: boolean;
  estimate?: number | null;
}>;

export type ApplyLeadPatchResult = Readonly<{
  lead: Lead;
  events: unknown[];
}>;

export type LeadSection = Readonly<{
  name: string;
  data: Lead[];
}>;

export type LeadStatusCount = Record<LeadStatus, number>;

export type LeadStatusSummary = Readonly<{
  totalLeads: number;
  byStatus: LeadStatusCount;
}>;

export interface LeadAttachment {
  id: number;
  leadId: number;
  fileName: string;
  s3Key: string;
  contentType?: string;
  fileSize?: number;
  createdAt: string;
  downloadUrl?: string;
}

export interface LeadDetails {
  id: number;
  leadNumber?: string;
  name?: string;
  startDate?: string | null;
  location?: string;
  addressLink?: string;
  status?: string;
  projectTypeId?: number | null;
  contactId?: number | null;
  notes?: string[];
  attachments?: string[];
  inReview: boolean;
  estimate?: number | null;
  contact?: {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    occupation?: string;
    role?: string;
    address?: string;
    addressLink?: string;
    isCustomer: boolean;
    isClient: boolean;
    company?: {
      id: number;
      name: string;
      address?: string;
      addressLink?: string;
      phone?: string;
      email?: string;
      submiz?: string;
      type: any;
      serviceId?: number;
      isCustomer: boolean;
      isClient: boolean;
      notes?: string[];
    } | null;
  } | null;
  projectType?: {
    id: number;
    name: string;
  } | null;
  project?: {
    id: number;
  } | null;
}
