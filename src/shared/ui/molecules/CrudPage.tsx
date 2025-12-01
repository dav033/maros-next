"use client";

import type { ReactNode } from "react";
import { Button, Icon, Modal } from "@/shared/ui";

export interface CrudPageConfig {
  title: string;
  subtitle: string;
  
  showToolbar?: boolean;
  toolbarContent?: ReactNode;
  
  showCreateButton?: boolean;
  createButtonLabel?: string;
  createButtonIcon?: string;
  onCreateClick?: () => void;
  
  additionalActions?: Array<{
    label: string;
    icon?: string;
    variant?: "primary" | "secondary";
    onClick: () => void;
  }>;
  
  isLoading: boolean;
  isEmpty: boolean;
  emptyStateContent: ReactNode;
  skeletonContent: ReactNode;
  tableContent: ReactNode;
  
  modalOpen: boolean;
  modalTitle: string;
  modalContent: ReactNode;
  modalFooter?: ReactNode;
  onModalClose: () => void;
  
  submitDisabled?: boolean;
  submitLoading?: boolean;
  onSubmit?: () => void;
  submitLabel?: string;
  
  errorMessage?: string | null;
}

export interface CrudPageProps {
  config: CrudPageConfig;
}

export function CrudPage({ config }: CrudPageProps) {
  const {
    title,
    subtitle,
    showToolbar = false,
    toolbarContent,
    showCreateButton = true,
    createButtonLabel = "New",
    createButtonIcon = "lucide:plus",
    onCreateClick,
    additionalActions = [],
    isLoading,
    isEmpty,
    emptyStateContent,
    skeletonContent,
    tableContent,
    modalOpen,
    modalTitle,
    modalContent,
    modalFooter,
    onModalClose,
    submitDisabled = false,
    submitLoading = false,
    onSubmit,
    submitLabel = "Save",
    errorMessage,
  } = config;

  return (
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col gap-3 bg-theme-dark px-3 py-3 pt-16 sm:gap-4 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-theme-light sm:text-2xl">
          {title}
        </h1>
        <p className="text-xs text-gray-400 sm:text-sm">{subtitle}</p>
      </header>

      {(showCreateButton || additionalActions.length > 0) && (
        <div className="flex items-center justify-end gap-2">
          {additionalActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant ?? "secondary"}
              onClick={action.onClick}
            >
              {action.icon && <Icon name={action.icon} className="mr-2" size={16} />}
              {action.label}
            </Button>
          ))}
          {showCreateButton && onCreateClick && (
            <Button variant="primary" onClick={onCreateClick}>
              {createButtonIcon && <Icon name={createButtonIcon} className="mr-2" size={16} />}
              {createButtonLabel}
            </Button>
          )}
        </div>
      )}

      {showToolbar && toolbarContent}

      <section className="mt-2 flex flex-1 flex-col">
        {isLoading ? (
          skeletonContent
        ) : isEmpty ? (
          emptyStateContent
        ) : (
          tableContent
        )}
      </section>

      <Modal
        isOpen={modalOpen}
        title={modalTitle}
        onClose={onModalClose}
        footer={
          modalFooter ?? (
            <>
              <Button
                variant="secondary"
                onClick={onModalClose}
                disabled={submitLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={onSubmit}
                loading={submitLoading}
                disabled={submitDisabled}
              >
                {submitLabel}
              </Button>
            </>
          )
        }
      >
        {modalContent}
        {errorMessage && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <Icon name="lucide:alert-circle" size={16} className="text-red-400 mt-0.5" />
            <p className="text-sm text-red-400">{errorMessage}</p>
          </div>
        )}
      </Modal>
    </main>
  );
}
