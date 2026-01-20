import { Button } from "@/components/ui/button";
import { Plus, Save, Trash, Loader } from "lucide-react";

interface BasicModalFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  canSubmit?: boolean;
  mode?: "create" | "update" | "delete";
  cancelLabel?: string;
  submitLabel?: string;
}

const modeConfig = {
  create: {
    label: "Create",
    Icon: Plus,
    variant: "default" as const,
  },
  update: {
    label: "Save",
    Icon: Save,
    variant: "default" as const,
  },
  delete: {
    label: "Delete",
    Icon: Trash,
    variant: "destructive" as const,
  },
};

export function BasicModalFooter({
  onCancel,
  onSubmit,
  isLoading = false,
  canSubmit = true,
  mode = "create",
  cancelLabel = "Cancel",
  submitLabel,
}: BasicModalFooterProps) {
  const config = modeConfig[mode];
  const label = submitLabel || config.label;

  return (
    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
      <Button variant="outline" onClick={onCancel} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button
        variant={config.variant}
        onClick={onSubmit}
        disabled={!canSubmit || isLoading}
      >
        {isLoading ? (
          <>
            <Loader className="size-4 mr-2 animate-spin" />
            {mode === "create" ? "Creating..." : mode === "update" ? "Saving..." : "Deleting..."}
          </>
        ) : (
          <>
            <config.Icon className="size-4 mr-2" />
            {label}
          </>
        )}
      </Button>
    </div>
  );
}
