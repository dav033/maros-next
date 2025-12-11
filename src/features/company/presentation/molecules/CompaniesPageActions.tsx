import { Button, Icon } from "@dav033/dav-components";

interface CompaniesPageActionsProps {
  onManageServices: () => void;
  onNewCompany: () => void;
}

export function CompaniesPageActions({
  onManageServices,
  onNewCompany,
}: CompaniesPageActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="secondary" onClick={onManageServices}>
        <Icon name="lucide:wrench" className="mr-2" size={16} />
        Manage Services
      </Button>
      <Button variant="primary" onClick={onNewCompany}>
        <Icon name="lucide:plus" className="mr-2" size={16} />
        New Company
      </Button>
    </div>
  );
}
