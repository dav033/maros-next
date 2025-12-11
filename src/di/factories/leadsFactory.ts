import type { LeadsAppContext } from "@/leads";
import { makeLeadsAppContext, LeadHttpRepository, LeadNumberAvailabilityHttpService } from "@/leads";
import { ContactHttpRepository } from "@/contact";
import { ProjectTypeHttpRepository } from "@/projectType";
import { SystemClock } from "@/shared/domain";


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
