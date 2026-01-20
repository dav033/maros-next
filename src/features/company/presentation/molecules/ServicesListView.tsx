import { Plus, Edit, Trash, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        <p className="text-sm text-muted-foreground">
          {services.length === 0
            ? "No services yet."
            : `${services.length} service${services.length !== 1 ? "s" : ""}`}
        </p>
        <Button size="sm" onClick={onOpenCreate}>
          <Plus className="size-3.5 mr-1.5" />
          New Service
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-8">
          <div className="text-center">
            <Wrench
              className="size-10 mx-auto mb-3 text-muted-foreground"
            />
            <p className="text-sm text-muted-foreground">
              Create your first service to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-h-60 overflow-y-auto space-y-1">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/50 px-3 py-2 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {service.color ? (
                  <div
                    className="h-3.5 w-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: service.color }}
                  />
                ) : (
                  <div className="h-3.5 w-3.5 rounded-full shrink-0 border border-gray-500" />
                )}
                <span className="text-sm text-foreground truncate">
                  {service.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  onClick={() => onOpenEdit(service)}
                  variant="ghost"
                  size="sm"
                  title="Edit service"
                  disabled={isDeleting}
                  className="h-7 w-7 p-0 min-h-0 rounded text-muted-foreground hover:bg-blue-500/10 hover:text-blue-400"
                >
                  <Edit className="size-3.5" />
                </Button>
                <Button
                  onClick={() => onDelete(service)}
                  variant="ghost"
                  size="sm"
                  title="Delete service"
                  disabled={isDeleting}
                  className="h-7 w-7 p-0 min-h-0 rounded text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
