"use client";

import { NotesEditorModal, DeleteFeedbackModal, EntityCrudPageTemplate } from "@/components/shared";
import type { Lead } from "@/leads/domain";
import { LeadsTable } from "@/leads/presentation";
import { ContactViewModal } from "@/contact";
import { LeadModal } from "../organisms/LeadModal";
import { X, Briefcase, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadsTableSkeleton } from "../organisms/LeadsTableSkeleton";
import type { UseLeadsPageLogicReturn } from "./useLeadsPageLogic";
import {
  useLeadModalController,
  useLeadsToolbarSearchController,
  useLeadsNotesModalController,
} from "../hooks";

export interface LeadsPageViewProps {
  logic: UseLeadsPageLogicReturn;
}

export function LeadsPageView({ logic }: LeadsPageViewProps) {
  const { config, data, crud, table, notesModal, viewContactModal } = logic;

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
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                />
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
              size="icon"
              className="bg-[#2c3637] hover:bg-[#2c3637]/90 text-foreground"
            >
              <Briefcase className="size-4" />
            </Button>
          </div>
        </div>
      }
      isLoading={showSkeleton}
      loadingContent={<LeadsTableSkeleton />}
      tableContent={
        <LeadsTable
          leads={rows}
          isLoading={showSkeleton}
          onEdit={openEditModal}
          getContextMenuItems={getContextMenuItems}
          onOpenNotesModal={table.onOpenNotesModal}
          onViewContact={table.onViewContact}
          pagination={{ enabled: true }}
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
        </>
      }
    />
  );
}
