import type {
  CompanyRepositoryPort,
  CompanyServiceRepositoryPort,
} from "@/features/company/domain";

export type CompanyAppContext = Readonly<{
  repos: {
    company: CompanyRepositoryPort;
    companyService: CompanyServiceRepositoryPort;
  };
}>;

export function makeCompanyAppContext(
  deps: CompanyAppContext
): CompanyAppContext {
  return deps;
}
