import type {
  ContactId,
  Lead,
  LeadPolicies,
  LeadType,
  NewContact,
  ProjectTypeId,
} from "@/leads";
import type { LeadsAppContext } from "../../context";
import {
  buildLeadDraftForExistingContact,
  buildLeadDraftForNewContact,
  ensureLeadNumberAvailable,
} from "@/leads";

export type CreateLeadInput =
  | Readonly<{
      leadName?: string;
      leadNumber?: string | null;
      location: string;
      projectTypeId: ProjectTypeId;
      leadType: LeadType;
      contactId: ContactId;
    }>
  | Readonly<{
      leadName?: string;
      leadNumber?: string | null;
      location: string;
      projectTypeId: ProjectTypeId;
      leadType: LeadType;
      contact: NewContact;
    }>;

export type CreateLeadOptions = Readonly<{
  policies?: LeadPolicies;
  checkNumberAvailability?: boolean;
}>;

export async function createLead(
  ctx: LeadsAppContext,
  input: CreateLeadInput,
  options: CreateLeadOptions = {}
): Promise<Lead> {
  const { policies = {}, checkNumberAvailability = true } = options;
  const draft =
    "contactId" in input
      ? buildLeadDraftForExistingContact(ctx.clock, input, policies)
      : buildLeadDraftForNewContact(ctx.clock, input, policies);
  if (checkNumberAvailability && draft.leadNumber) {
    await ensureLeadNumberAvailable(draft.leadNumber, async (n) => {
      const available =
        await ctx.services.leadNumberAvailability.isAvailable(n);
      return !available;
    });
  }
  return ctx.repos.lead.saveNew(draft);
}

export type CreateLeadWithExistingContactInput = Extract<
  CreateLeadInput,
  { contactId: ContactId }
>;

export type CreateLeadWithNewContactInput = Extract<
  CreateLeadInput,
  { contact: NewContact }
>;
