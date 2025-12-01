"use client";

import type { CompanyService } from "../../domain/models";
import { Button, Modal } from "@/shared/ui";
import { DeleteFeedbackModal } from "@/shared/ui/molecules/DeleteFeedbackModal";
import { useManageServices } from "./useManageServices";
import { ServicesListView } from "./ServicesListView";
import { ServiceFormView } from "./ServiceFormView";

type ManageServicesModalProps = {
  isOpen: boolean;
  onClose: () => void;
  services: CompanyService[];
};

export function ManageServicesModal({ isOpen, onClose, services }: ManageServicesModalProps) {
  const {
    mode,
    currentService,
    formValue,
    serverError,
    deleteModalOpen,
    serviceToDelete,
    deleteError,
    isPending,
    isDeleting,
    resetForm,
    openCreate,
    openEdit,
    handleFormChange,
    handleCreateSubmit,
    handleEditSubmit,
    handleDelete,
    confirmDelete,
    closeDeleteModal,
  } = useManageServices();

  const handleClose = () => {
    if (isPending || isDeleting) return;
    resetForm();
    onClose();
  };

  const isFormMode = mode === "create" || mode === "edit";

  return (
    <Modal
      isOpen={isOpen}
      title={
        mode === "list" ? (
          "Manage Services"
        ) : mode === "create" ? (
          "New Service"
        ) : (
          <div className="flex items-center gap-2">
            <div 
              className="h-4 w-4 rounded-full shrink-0"
              style={{ backgroundColor: currentService?.color || "#000000" }}
            />
            <span>Edit Service</span>
          </div>
        )
      }
      onClose={handleClose}
      footer={
        isFormMode ? (
          <>
            <Button variant="secondary" onClick={resetForm} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={mode === "create" ? handleCreateSubmit : handleEditSubmit}
              loading={isPending}
              disabled={!formValue.name.trim()}
            >
              {mode === "create" ? "Create" : "Save changes"}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        )
      }
    >
      {mode === "list" ? (
        <ServicesListView
          services={services}
          onOpenCreate={openCreate}
          onOpenEdit={openEdit}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      ) : (
        <ServiceFormView
          formValue={formValue}
          onChange={handleFormChange}
          serverError={serverError}
          isPending={isPending}
        />
      )}

      <DeleteFeedbackModal
        isOpen={deleteModalOpen}
        title="Delete Service"
        description={
          <>
            Are you sure you want to delete service{" "}
            <span className="font-semibold text-theme-light">
              {serviceToDelete?.name}
            </span>
            ?<br />
            This action cannot be undone.
          </>
        }
        error={deleteError}
        loading={isDeleting}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </Modal>
  );
}
