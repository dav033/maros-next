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

// Fence NO es un tipo grande de lead: es un ProjectType (tipo de proyecto
// menor, como Pergola o Landscaping) que se asigna en el campo projectType.
export enum LeadType {
  CONSTRUCTION = "CONSTRUCTION",
  PLUMBING = "PLUMBING",
  ROOFING = "ROOFING",
}

/** Canales de origen que acepta el backend (LEAD_SOURCES). */
export const LEAD_SOURCES = [
  "referral",
  "repeat_client",
  "website",
  "google",
  "social",
  "walk_in",
  "partner",
  "other",
] as const;

export type LeadSource = (typeof LEAD_SOURCES)[number];

/** Motivos de pérdida que acepta el backend (LEAD_LOST_REASONS). */
export const LEAD_LOST_REASONS = [
  "price",
  "timeline",
  "scope",
  "no_response",
  "competitor",
  "client_cancelled",
  "not_qualified",
  "other",
] as const;

export type LeadLostReason = (typeof LEAD_LOST_REASONS)[number];

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
  conversion?: LeadConversion;
  inReview: boolean;
  /** Estimado manual, editable desde el CRM. Independiente de QuickBooks. */
  estimate: number | null;
  /** Monto del Estimate real en QuickBooks (solo lectura, informativo). */
  qboEstimate: number | null;
  /**
   * Comercial responsable. El backend sólo devuelve el id: el nombre se resuelve
   * contra el directorio de usuarios.
   */
  ownerId: number | null;
  source: LeadSource | null;
  /** El backend lo exige para entrar en LOST (HTTP 422 si falta). */
  lostReason: LeadLostReason | null;
  /** "YYYY-MM-DD". */
  nextFollowUpAt: string | null;
  /**
   * Null en los leads que nunca registraron un cambio de estado, que es la mayoría
   * del histórico: significa "no se sabe", no "desde el principio de los tiempos".
   */
  statusChangedAt: string | null;
}

export type LeadConversion = Readonly<{
  converted: boolean;
  projectId?: number;
}>;

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
  projectTypeId?: ProjectTypeId;
  estimate?: number;
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
  estimate?: number | null;
  inReview?: boolean;
  ownerId?: number | null;
  source?: LeadSource | null;
  lostReason?: LeadLostReason | null;
  nextFollowUpAt?: string | null;
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
  /** Estimado manual, editable desde el CRM. Independiente de QuickBooks. */
  estimate?: number | null;
  /** Bloque QBO adjuntado por el backend (Estimate real, solo lectura). */
  financial?: {
    estimatedAmount?: number | null;
  } | null;
  ownerId?: number | null;
  source?: LeadSource | null;
  lostReason?: LeadLostReason | null;
  nextFollowUpAt?: string | null;
  statusChangedAt?: string | null;
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
