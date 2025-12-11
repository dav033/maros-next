"use client";

import type { CompanyService } from "../../domain/models";
import { Button, Modal, BasicModalFooter, DeleteFeedbackModal } from "@dav033/dav-components";
import { useManageServices } from "../hooks";
import { ServicesListView } from "../molecules/ServicesListView";
import { ServiceFormView } from "../molecules/ServiceFormView";

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
          <BasicModalFooter
            onCancel={resetForm}
            onSubmit={mode === "create" ? handleCreateSubmit : handleEditSubmit}
            isLoading={isPending}
            canSubmit={formValue.name.trim().length > 0}
            mode={mode === "create" ? "create" : "update"}
          />
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
        
        
      />
    </Modal>
  );
}
