import type {
  ContactId,
  Lead,
  LeadPolicies,
  LeadType,
  NewContact,
  ProjectTypeId,
} from "@/leads/domain";
import type { LeadsAppContext } from "../../context";
import {
  buildLeadDraftForExistingContact,
  buildLeadDraftForNewContact,
  ensureLeadNumberAvailable,
} from "@/leads/domain";

export type CreateLeadInput =
  | Readonly<{
      leadName?: string;
      leadNumber?: string | null;
      location: string;
      projectTypeId: ProjectTypeId;
      leadType: LeadType; // Solo para generar número si no se proporciona
      contactId: ContactId;
      inReview?: boolean;
    }>
  | Readonly<{
      leadName?: string;
      leadNumber?: string | null;
      location: string;
      projectTypeId: ProjectTypeId;
      leadType: LeadType; // Solo para generar número si no se proporciona
      contact: NewContact;
      inReview?: boolean;
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
      ? buildLeadDraftForExistingContact(ctx.clock, input, policies, input.inReview)
      : buildLeadDraftForNewContact(ctx.clock, input, policies, input.inReview);
  if (checkNumberAvailability && draft.leadNumber) {
    await ensureLeadNumberAvailable(draft.leadNumber, async (n) => {
      const available =
        await ctx.services.leadNumberAvailability.isAvailable(n);
      return !available;
    });
  }
  // Pasar leadType solo si no se proporciona leadNumber (para generación en backend)
  const leadTypeForGeneration = !draft.leadNumber ? input.leadType : undefined;
  return ctx.repos.lead.saveNew(draft, leadTypeForGeneration);
}

export type CreateLeadWithExistingContactInput = Extract<
  CreateLeadInput,
  { contactId: ContactId }
>;

export type CreateLeadWithNewContactInput = Extract<
  CreateLeadInput,
  { contact: NewContact }
>;
