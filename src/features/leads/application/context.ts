import type {
  LeadNumberAvailabilityPort,
  LeadRepositoryPort,
} from "@/features/leads/domain";
import type { ContactRepositoryPort } from "@/features/contact/domain";
import type { ProjectTypeRepositoryPort } from "@/features/projectType/domain";
import type { Clock } from "@/shared/domain";

export type LeadsAppContext = Readonly<{
  clock: Clock;
  repos: {
    contact: ContactRepositoryPort;
    lead: LeadRepositoryPort;
    projectType?: ProjectTypeRepositoryPort;
  };
  services: {
    leadNumberAvailability: LeadNumberAvailabilityPort;
  };
}>;

export function makeLeadsAppContext(deps: LeadsAppContext): LeadsAppContext {
  return deps;
}
