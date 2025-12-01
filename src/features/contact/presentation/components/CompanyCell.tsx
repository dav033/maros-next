import type { Company } from "@/company";

interface CompanyCellProps {
  company: Company | undefined;
  onOpenCompanyModal: (company: Company) => void;
}

export function CompanyCell({ company, onOpenCompanyModal }: CompanyCellProps) {
  console.log('CompanyCell recibió company:', company);
  if (!company) {
    console.log('CompanyCell: company es undefined/null');
    return <span className="text-gray-400">—</span>;
  }

  return (
    <button
      type="button"
      className="group inline-flex w-40 cursor-pointer items-center rounded-full bg-blue-500/10 px-3 py-0.5 pr-4 transition-colors hover:bg-blue-500/20"
      onClick={() => onOpenCompanyModal(company)}
    >
      <span className="truncate text-sm font-medium text-blue-300 transition-colors group-hover:text-blue-200">
        {company.name}
      </span>
    </button>
  );
}
