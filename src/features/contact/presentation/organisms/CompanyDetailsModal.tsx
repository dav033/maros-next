import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Company } from "@/company";

interface CompanyDetailsModalProps {
  isOpen: boolean;
  company: Company | null;
  onClose: () => void;
}

export function CompanyDetailsModal({
  isOpen,
  company,
  onClose,
}: CompanyDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Company Details</DialogTitle>
        </DialogHeader>
      {company ? (
        <div className="space-y-2 p-4">
          <div>
            <span className="font-semibold text-foreground">Name:</span>{" "}
            {company.name}
          </div>
          <div>
            <span className="font-semibold text-foreground">Address:</span>{" "}
            {company.address || "—"}
          </div>
          <div>
            <span className="font-semibold text-foreground">Type:</span>{" "}
            {company.type || "—"}
          </div>
          <div>
            <span className="font-semibold text-foreground">
              Service ID:
            </span>{" "}
            {company.serviceId ?? "—"}
          </div>
          <div>
            <span className="font-semibold text-foreground">Customer:</span>{" "}
            {company.isCustomer ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-semibold text-foreground">Client:</span>{" "}
            {company.isClient ? "Yes" : "No"}
          </div>
        </div>
      ) : null}
      </DialogContent>
    </Dialog>
  );
}
