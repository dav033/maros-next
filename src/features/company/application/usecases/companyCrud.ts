import type {
  Company,
  CompanyDraft,
  CompanyId,
  CompanyPatch,
} from "@/company";
import type { CompanyAppContext } from "@/company";
import { makeCrudUseCases } from "@/shared/application";

export const companyCrudUseCases = makeCrudUseCases<
  CompanyId,
  Company,
  CompanyDraft,
  CompanyPatch,
  CompanyAppContext
>({
  getRepo: (ctx) => ctx.repos.company,
});
