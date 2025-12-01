"use client";

import type { ReactNode, MouseEvent } from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/shared/ui";

export type ModalProps = {
  isOpen: boolean;
  title?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
};

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  footer,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) {
    return null;
  }

  function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    onClose();
  }

  function handleContentClick(event: MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-theme-gray bg-theme-dark p-4 shadow-2xl sm:p-6 max-h-[90vh] overflow-y-auto"
        onClick={handleContentClick}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          {title && (
            <h2 className="text-base font-semibold text-theme-light sm:text-lg flex items-center">{title}</h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-400 hover:bg-theme-gray-subtle hover:text-theme-light active:scale-95 transition-transform"
            aria-label="Close"
          >
            <Icon name="lucide:x" size={20} />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
