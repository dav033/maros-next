import { Modal } from "@/shared/ui";
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
    <Modal isOpen={isOpen} onClose={onClose}>
      {company ? (
        <div className="space-y-2 p-4">
          <div>
            <span className="font-semibold text-theme-light">Name:</span>{" "}
            {company.name}
          </div>
          <div>
            <span className="font-semibold text-theme-light">Address:</span>{" "}
            {company.address || "—"}
          </div>
          <div>
            <span className="font-semibold text-theme-light">Type:</span>{" "}
            {company.type || "—"}
          </div>
          <div>
            <span className="font-semibold text-theme-light">
              Service ID:
            </span>{" "}
            {company.serviceId ?? "—"}
          </div>
          <div>
            <span className="font-semibold text-theme-light">Customer:</span>{" "}
            {company.isCustomer ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-semibold text-theme-light">Client:</span>{" "}
            {company.isClient ? "Yes" : "No"}
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
