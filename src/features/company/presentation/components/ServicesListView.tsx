import { Button, Icon } from "@/shared/ui";
import type { CompanyService } from "../../domain/models";

interface ServicesListViewProps {
  services: CompanyService[];
  onOpenCreate: () => void;
  onOpenEdit: (service: CompanyService) => void;
  onDelete: (service: CompanyService) => void;
  isDeleting: boolean;
}

export function ServicesListView({
  services,
  onOpenCreate,
  onOpenEdit,
  onDelete,
  isDeleting,
}: ServicesListViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          {services.length === 0
            ? "No services yet."
            : `${services.length} service${services.length !== 1 ? "s" : ""}`}
        </p>
        <Button variant="primary" size="sm" onClick={onOpenCreate}>
          <Icon name="lucide:plus" className="mr-1.5" size={14} />
          New Service
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-theme-gray-subtle bg-theme-dark/50 p-8">
          <div className="text-center">
            <Icon name="lucide:wrench" size={40} className="mx-auto mb-3 text-gray-500" />
            <p className="text-sm text-gray-400">
              Create your first service to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-lg border border-theme-gray-subtle bg-theme-dark/50 px-2.5 py-2 transition-colors hover:bg-theme-dark/70"
            >
              <div className="flex items-center gap-2">
                {service.color ? (
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: service.color }}
                  />
                ) : (
                  <div className="h-3 w-3 rounded-full shrink-0 border border-gray-500" />
                )}
                <span className="text-sm text-theme-light">{service.name}</span>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => onOpenEdit(service)}
                  className="rounded p-1 text-gray-400 transition-colors hover:bg-theme-gray-subtle hover:text-theme-light cursor-pointer"
                  title="Edit service"
                  disabled={isDeleting}
                >
                  <Icon name="lucide:edit" size={14} />
                </button>
                <button
                  onClick={() => onDelete(service)}
                  className="rounded p-1 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50 cursor-pointer"
                  title="Delete service"
                  disabled={isDeleting}
                >
                  <Icon name="lucide:trash-2" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
