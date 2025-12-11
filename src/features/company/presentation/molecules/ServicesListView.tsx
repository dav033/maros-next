import { Button, Icon, ListCardItem } from "@dav033/dav-components";
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
            <Icon
              name="lucide:wrench"
              size={40}
              className="mx-auto mb-3 text-gray-500"
            />
            <p className="text-sm text-gray-400">
              Create your first service to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto">
          {services.map((service) => (
            <ListCardItem
              key={service.id}
              actions={
                <>
                  <Button
                    onClick={() => onOpenEdit(service)}
                    variant="ghost"
                    size="sm"
                    title="Edit service"
                    disabled={isDeleting}
                    className="h-7 w-7 p-0 min-h-0 rounded text-gray-400 hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    <Icon name="lucide:edit" size={14} />
                  </Button>
                  <Button
                    onClick={() => onDelete(service)}
                    variant="ghost"
                    size="sm"
                    title="Delete service"
                    disabled={isDeleting}
                    className="h-7 w-7 p-0 min-h-0 rounded text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Icon name="lucide:trash-2" size={14} />
                  </Button>
                </>
              }
            >
              {service.color ? (
                <div
                  className="h-3.5 w-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: service.color }}
                />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full shrink-0 border border-gray-500" />
              )}
              <span className="text-sm text-theme-light truncate">
                {service.name}
              </span>
            </ListCardItem>
          ))}
        </div>
      )}
    </div>
  );
}
