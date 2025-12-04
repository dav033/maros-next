// For DiProvider - Application Context
export type { LeadsAppContext } from "./application/context";
export { makeLeadsAppContext } from "./application/context";

// For DiProvider - Infrastructure Repositories
export { LeadHttpRepository, LeadNumberAvailabilityHttpService } from "./infra/index";
