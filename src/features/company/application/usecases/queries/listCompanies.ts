import type { Company } from "@/company";
import type { CompaniesAppContext } from "../../context";

export async function listCompanies(ctx: CompaniesAppContext): Promise<Company[]> {
  return ctx.repos.company.list();
}
