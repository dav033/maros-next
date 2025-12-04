import type { LeadsAppContext } from "@/leads";
import { makeLeadsAppContext, LeadHttpRepository, LeadNumberAvailabilityHttpService } from "@/leads";
import { ContactHttpRepository } from "@/contact";
import { ProjectTypeHttpRepository } from "@/projectType";
import { SystemClock } from "@/shared/domain";

/**
 * Factory for creating the Leads application context.
 * Encapsulates all lead-related dependencies including contacts and project types.
 */
export function createLeadsAppContext(): LeadsAppContext {
  return makeLeadsAppContext({
    clock: SystemClock,
    repos: {
      contact: new ContactHttpRepository(),
      lead: new LeadHttpRepository(),
      projectType: new ProjectTypeHttpRepository(),
    },
    services: {
      leadNumberAvailability: new LeadNumberAvailabilityHttpService(),
    },
  });
}
