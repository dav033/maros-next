import type {
  CompanyRepositoryPort,
  CompanyServiceRepositoryPort,
} from "@/company";

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
