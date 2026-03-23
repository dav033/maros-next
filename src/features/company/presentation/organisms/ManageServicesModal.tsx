"use client";

import { DeleteFeedbackModal } from "@/components/shared";
import { Plus, Save, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import type { CompanyService } from "../../domain/models";
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "list" ? (
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
            )}
          </DialogTitle>
        </DialogHeader>
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

        <DialogFooter>
          {isFormMode ? (
            <>
              <Button variant="outline" onClick={resetForm} disabled={isPending}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={mode === "create" ? handleCreateSubmit : handleEditSubmit}
                disabled={formValue.name.trim().length === 0 || isPending}
              >
                {isPending ? (
                  <>
                    <Loader className="size-4 mr-2 animate-spin" />
                    {mode === "create" ? "Creating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    {mode === "create" ? (
                      <>
                        <Plus className="size-4 mr-2" />
                        Create
                      </>
                    ) : (
                      <>
                        <Save className="size-4 mr-2" />
                        Save
                      </>
                    )}
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
      <DeleteFeedbackModal
        isOpen={deleteModalOpen}
        title="Delete Service"
        description={
          <>
            Are you sure you want to delete service{" "}
            <span className="font-semibold text-foreground">
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
    </Dialog>
  );
}
