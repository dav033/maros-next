import type { Company } from "@/company";
import type { CompanyAppContext } from "../../context";

export async function listCompanies(ctx: CompanyAppContext): Promise<Company[]> {
  return ctx.repos.company.list();
}
