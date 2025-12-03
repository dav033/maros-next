import { Modal, Button, Icon } from "@/shared/ui";
import type { ReactNode } from "react";

export interface DeleteFeedbackModalProps {
  isOpen: boolean;
  title?: ReactNode;
  description?: ReactNode;
  error?: string | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function DeleteFeedbackModal({
  isOpen,
  title = "Delete Item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  error,
  loading = false,
  onClose,
  onConfirm,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}: DeleteFeedbackModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Icon name="lucide:loader-2" size={16} className="animate-spin" />
                Deleting...
              </span>
            ) : (
              confirmLabel
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-300">{description}</p>
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <Icon name="lucide:alert-circle" size={16} className="text-red-400 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
