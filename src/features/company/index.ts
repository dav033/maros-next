// Domain Models
export type { 
  Company, 
  CompanyId, 
  CompanyDraft, 
  CompanyPatch, 
  CompanyPolicies, 
  CompanyPatchPolicies 
} from "./domain/models/Company";

export type { 
  CompanyService, 
  CompanyServiceId, 
  CompanyServiceDraft, 
  CompanyServicePatch 
} from "./domain/models/CompanyService";

// For DiProvider - Application Context
export type { CompanyAppContext } from "./application/context";
export { makeCompanyAppContext } from "./application/context";

// For DiProvider - Infrastructure Repositories
export { CompanyHttpRepository, CompanyServiceHttpRepository } from "./infra/index";

// Presentation - Pages
export { CompaniesPage } from "./presentation/pages";
