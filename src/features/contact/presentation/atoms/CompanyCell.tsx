import type { Company } from "@/company";
import { Badge } from "@/shared/ui";

interface CompanyCellProps {
  company: Company | undefined;
  onOpenCompanyModal: (company: Company) => void;
}

export function CompanyCell({ company, onOpenCompanyModal }: CompanyCellProps) {
  if (!company) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <Badge
      variant="primary"
      size="md"
      interactive
      onClick={() => onOpenCompanyModal(company)}
      className="w-24"
    >
      <span className="truncate block w-full text-center">
        {company.name}
      </span>
    </Badge>
  );
}
