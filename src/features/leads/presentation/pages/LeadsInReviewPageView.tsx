"use client";




import { NotesEditorModal } from "@/components/custom";
import type { Lead } from "@/leads/domain";
import { LeadsInReviewTable } from "../organisms/LeadsInReviewTable";
import {
  DeleteFeedbackModal,
  EntityCrudPageTemplate,
} from "@/components/custom";
import { X, Briefcase, Loader, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
// TODO: NotesEditorModal needs custom implementation

import { ContactViewModal } from "@/contact";
import { LeadModal } from "../organisms/LeadModal";
import { LeadsTableSkeleton } from "../organisms/LeadsTableSkeleton";
import type { UseLeadsInReviewPageLogicReturn } from "./useLeadsInReviewPageLogic";
import {
  useLeadModalController,
  useLeadsToolbarSearchController,
  useLeadsNotesModalController,
} from "../hooks";

export interface LeadsInReviewPageViewProps {
  logic: UseLeadsInReviewPageLogicReturn;
}

export function LeadsInReviewPageView({ logic }: LeadsInReviewPageViewProps) {
  const { config, data, crud, table, notesModal, viewContactModal, reviewActions, rejectConfirmModal } = logic;

  const { title, description, createModalTitle } = config;

  const { leads, contacts, projectTypes, showSkeleton } = data;

  const {
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    createController,
    isEditModalOpen,
    selectedLead,
    openEditModal,
    closeEditModal,
    updateController,
  } = crud;

  const {
    rows,
    totalCount,
    filteredCount,
    searchState,
    deleteModalProps,
    getContextMenuItems,
  } = table;

  const { searchQuery, searchField, setSearchQuery, setSearchField } =
    searchState;

  const { controller: leadModalController, contactsForModal } =
    useLeadModalController({
      isCreateModalOpen,
      isEditModalOpen,
      closeCreateModal,
      closeEditModal,
      createController,
      updateController,
      selectedLead,
      contacts,
    });

  const notesModalController = useLeadsNotesModalController({
    isOpen: notesModal.isOpen,
    title: notesModal.title,
    notes: notesModal.notes,
    onChangeNotes: notesModal.onChangeNotes,
    onClose: notesModal.onClose,
    onSave: notesModal.onSave,
    loading: notesModal.loading,
  });

  const toolbarSearchController = useLeadsToolbarSearchController({
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    filteredCount,
    totalCount,
  });

  return (
    <EntityCrudPageTemplate
      header={
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
          )}
        </header>
      }
      toolbar={
        <div className="flex items-center justify-between gap-3 rounded-xl bg-card p-3">
          <div className="max-w-3xl flex-1">
            <div className="flex items-center gap-2 w-full">
              <div className="w-32 shrink-0">
                <Select value={toolbarSearchController.selectedField} onValueChange={toolbarSearchController.onFieldChange}>
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {toolbarSearchController.searchFields.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-0 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={toolbarSearchController.searchTerm}
                  onChange={(e) => toolbarSearchController.onSearchChange(e.target.value)}
                  placeholder={toolbarSearchController.placeholder}
                  className="pl-9 bg-background border-input"
                />
              </div>
              {toolbarSearchController.searchTerm.trim().length > 0 && (
                <Button
                  type="button"
                  onClick={() => toolbarSearchController.onSearchChange("")}
                  aria-label="Clear search"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {typeof toolbarSearchController.resultCount === "number" && typeof toolbarSearchController.totalCount === "number" && (
                <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                  Showing {toolbarSearchController.resultCount} of {toolbarSearchController.totalCount} results
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={openCreateModal}
              aria-label="New Lead"
              className="whitespace-nowrap text-sm font-medium"
            >
              <span className="mr-2"><Briefcase className="size-4.5" /></span>
              New Lead
            </Button>
          </div>
        </div>
      }
      isLoading={showSkeleton}
      loadingContent={<LeadsTableSkeleton />}
      tableContent={
        <LeadsInReviewTable
          leads={rows}
          isLoading={showSkeleton}
          onEdit={openEditModal}
          getContextMenuItems={getContextMenuItems}
          onOpenNotesModal={table.onOpenNotesModal}
          onViewContact={table.onViewContact}
          onAccept={reviewActions.onAccept}
          onReject={reviewActions.onRejectClick}
          isAccepting={reviewActions.isAccepting}
          isRejecting={reviewActions.isRejecting}
        />
      }
      modals={
        <>
          <DeleteFeedbackModal
            isOpen={deleteModalProps.isOpen}
            title="Delete Lead"
            description={
              <>
                Are you sure you want to delete lead{" "}
                <span className="font-semibold text-foreground">
                  {(deleteModalProps.itemToDelete as any)?.name}
                </span>
                ?
                <br />
                This action cannot be undone.
              </>
            }
            error={deleteModalProps.error}
            loading={deleteModalProps.isDeleting}
            onClose={deleteModalProps.onClose}
            onConfirm={deleteModalProps.onConfirm}
          />

          <NotesEditorModal controller={notesModalController} />

          <ContactViewModal
            isOpen={viewContactModal.isOpen}
            contact={viewContactModal.contact}
            onClose={viewContactModal.close}
          />

          <LeadModal
            controller={leadModalController}
            contacts={contactsForModal}
            projectTypes={projectTypes}
          />

          {/* Reject Confirmation Modal */}
          <Dialog open={rejectConfirmModal.isOpen} onOpenChange={(open) => !open && rejectConfirmModal.onClose()}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject this lead?</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
              <p className="text-foreground">
                Are you sure you want to reject lead{" "}
                <span className="font-semibold text-foreground">
                  {rejectConfirmModal.leadToReject?.name}
                </span>
                ?
              </p>
              
              {rejectConfirmModal.isLoadingInfo ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader className="size-4 animate-spin" />
                  Loading...
                </div>
              ) : rejectConfirmModal.rejectionInfo && (
                <div className="space-y-3 pt-2 border-t border-border-primary">
                  {rejectConfirmModal.rejectionInfo.contact?.canDelete && (
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rejectConfirmModal.deleteContact}
                        onChange={(e) => rejectConfirmModal.setDeleteContact(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-800 text-red-500 focus:ring-red-500/50"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-foreground group-hover:text-foreground">
                          Also delete contact:{" "}
                          <span className="font-medium text-foreground">
                            {rejectConfirmModal.rejectionInfo.contact.name}
                          </span>
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          This contact has no other leads
                        </p>
                      </div>
                    </label>
                  )}
                  
                  {rejectConfirmModal.rejectionInfo.company?.canDelete && (
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rejectConfirmModal.deleteCompany}
                        onChange={(e) => rejectConfirmModal.setDeleteCompany(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-800 text-red-500 focus:ring-red-500/50"
                      />
                      <div className="flex-1">
                        <span className="text-sm text-foreground group-hover:text-foreground">
                          Also delete company:{" "}
                          <span className="font-medium text-foreground">
                            {rejectConfirmModal.rejectionInfo.company.name}
                          </span>
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          This company has no other leads
                        </p>
                      </div>
                    </label>
                  )}
                  
                  {!rejectConfirmModal.rejectionInfo.contact?.canDelete && 
                   !rejectConfirmModal.rejectionInfo.company?.canDelete && (
                    <p className="text-xs text-muted-foreground">
                      The associated contact and company have other leads and cannot be deleted.
                    </p>
                  )}
                </div>
              )}
              
              <p className="text-sm text-red-400/80">
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={rejectConfirmModal.onClose}
                  disabled={rejectConfirmModal.isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={rejectConfirmModal.onConfirm}
                  disabled={rejectConfirmModal.isLoading}
                >
                  {rejectConfirmModal.isLoading ? (
                    <>
                      <Loader className="size-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    "Reject"
                  )}
                </Button>
              </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      }
    />
  );
}
