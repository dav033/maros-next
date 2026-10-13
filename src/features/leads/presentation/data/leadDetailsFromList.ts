import type { Lead, LeadDetails } from "@/leads/domain";

export function leadDetailsFromList(lead: Lead): LeadDetails {
  return {
    ...lead,
    contactId: lead.contact.id,
    projectTypeId: lead.projectType.id,
    financial: { estimatedAmount: lead.qboEstimate },
    contact: lead.contact.id ? { ...lead.contact, id: lead.contact.id } : null,
  };
}
