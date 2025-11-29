import type {
  LeadNumberAvailabilityPort,
  LeadRepositoryPort,
} from "@/leads";
import type { ContactRepositoryPort } from "@/contact";
import type { ProjectTypeRepositoryPort } from "@/projectType";
import type { Clock } from "@/shared";

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
