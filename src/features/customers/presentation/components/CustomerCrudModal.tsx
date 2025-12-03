"use client";

import type { ReactNode } from "react";
import { Button, Modal } from "@/shared/ui";

export interface CustomerCrudModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  serverError: string | null;
  children: ReactNode;
}

export function CustomerCrudModal({
  isOpen,
  title,
  onClose,
  onSubmit,
  isSubmitting,
  serverError,
  children,
}: CustomerCrudModalProps) {
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
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
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
