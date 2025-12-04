import type { Contact } from "@/contact/domain";
import type { LeadStatus, LeadType } from "@/leads/domain";
import type { ProjectType } from "./ProjectType";

export interface Lead {
  id: number;
  leadNumber: string;
  name: string;
  startDate: string;
  location?: string | undefined;
  addressLink?: string | undefined;
  status: LeadStatus;
  contact: Contact;
  projectType: ProjectType;
  leadType: LeadType;
  notes: string[];
}
