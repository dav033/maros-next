import type {
  CompanyService,
  CompanyServiceDraft,
  CompanyServiceId,
  CompanyServicePatch,
} from "@/company";
import type { CompanyAppContext } from "@/company";
import { makeCrudUseCases } from "@/shared";

export const companyServiceCrudUseCases = makeCrudUseCases<
  CompanyServiceId,
  CompanyService,
  CompanyServiceDraft,
  CompanyServicePatch,
  CompanyAppContext
>({
  getRepo: (ctx) => ctx.repos.companyService,
});
