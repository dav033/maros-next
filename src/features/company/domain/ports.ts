import type {
  Company,
  CompanyDraft,
  CompanyId,
  CompanyPatch,
  CompanyService,
  CompanyServiceDraft,
  CompanyServicePatch,
  CompanyServiceId,
} from "./models";
import type { ResourceRepository } from "@/shared";

export interface CompanyRepositoryPort
  extends ResourceRepository<CompanyId, Company, CompanyDraft, CompanyPatch> {}

export interface CompanyServiceRepositoryPort
  extends ResourceRepository<
    CompanyServiceId,
    CompanyService,
    CompanyServiceDraft,
    CompanyServicePatch
  > {}
