import type { Company } from "@/company";

interface CompanyCellProps {
  company: Company | undefined;
  onOpenCompanyModal: (company: Company) => void;
}

export function CompanyCell({ company, onOpenCompanyModal }: CompanyCellProps) {
  if (!company) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <button
      type="button"
      onClick={() => onOpenCompanyModal(company)}
      className="inline-flex items-center justify-center rounded-md border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors w-24 cursor-pointer"
    >
      <span className="truncate block w-full text-center">
        {company.name}
      </span>
    </button>
  );
}
