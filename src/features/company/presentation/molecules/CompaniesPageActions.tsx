import { Wrench, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        <Wrench className="size-4 mr-2" />
        Manage Services
      </Button>
      <Button onClick={onNewCompany}>
        <Plus className="size-4 mr-2" />
        New Company
      </Button>
    </div>
  );
}
