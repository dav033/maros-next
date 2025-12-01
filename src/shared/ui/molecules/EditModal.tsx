import type { ReactNode } from "react";
import { Modal, Button } from "@/shared/ui";

export type EditModalProps<T> = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  isPending: boolean;
  serverError: string | null;
  children: ReactNode;
};

export function EditModal<T>({
  isOpen,
  title,
  onClose,
  onSubmit,
  isPending,
  serverError,
  children,
}: EditModalProps<T>) {
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      }
    >
      {serverError && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {serverError}
        </div>
      )}
      {children}
    </Modal>
  );
}
