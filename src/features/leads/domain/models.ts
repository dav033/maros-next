import type { Contact } from "@/contact";
import type { ProjectType } from "@/projectType";
import type { ISODate } from "@/shared";

export enum LeadStatus {
  NOT_EXECUTED = "NOT_EXECUTED",
  COMPLETED = "COMPLETED",
  IN_PROGRESS = "IN_PROGRESS",
  LOST = "LOST",
  POSTPONED = "POSTPONED",
  PERMITS = "PERMITS",
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
  startDate: string;
  location?: string | undefined;
  status: LeadStatus;
  contact: Contact;
  projectType: ProjectType;
  leadType: LeadType;
  notes: string[];
}

export type LeadId = number;
export type ContactId = number;
export type ProjectTypeId = number;

export type NewContact = Readonly<{
  companyName: string;
  name: string;
  phone: string;
  email: string;
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
  status: LeadStatus | null;
  projectTypeId: ProjectTypeId;
  leadType: LeadType;
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
  status?: LeadStatus | null;
  contactId?: number;
  projectTypeId?: number;
  startDate?: ISODate;
  leadNumber?: string | null;
  notes?: string[];
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
