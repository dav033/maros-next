"use client";

import {
  NotesEditorModal,
  DeleteFeedbackModal,
  EntityCrudPageTemplate,
  PageHeaderCard,
  PageToolbarCard,
} from "@/components/shared";
import { LeadsTable } from "@/leads/presentation";
import { ContactViewModal } from "@/contact";
import { X, XCircle, Search, SlidersHorizontal } from "lucide-react";
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
import type { UseLostLeadsPageLogicReturn } from "./useLostLeadsPageLogic";
import {
  useLeadsToolbarSearchController,
  useLeadsNotesModalController,
} from "../hooks";

export interface LostLeadsPageViewProps {
  logic: UseLostLeadsPageLogicReturn;
}

export function LostLeadsPageView({ logic }: LostLeadsPageViewProps) {
  const { data, table, notesModal, viewContactModal } = logic;
  const { showSkeleton } = data;

  const {
    rows,
    totalCount,
    filteredCount,
    searchState,
    deleteModalProps,
    getContextMenuItems,
  } = table;

  const { searchQuery, searchField, setSearchQuery, setSearchField } = searchState;

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
        <PageHeaderCard
          icon={XCircle}
          title="Lost Leads"
          description="All lost leads across every category, grouped by type."
        />
      }
      toolbar={
        <PageToolbarCard
          icon={SlidersHorizontal}
          label="Filters & search"
          resultCount={toolbarSearchController.resultCount}
          totalCount={toolbarSearchController.totalCount}
        >
          {/* Search field selector */}
          <div className="w-32 shrink-0">
            <Select value={toolbarSearchController.selectedField} onValueChange={toolbarSearchController.onFieldChange}>
              <SelectTrigger className="bg-background/60 border-border/60 h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {toolbarSearchController.searchFields.map((field) => (
                  <SelectItem key={field.value} value={field.value}>{field.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search input */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={toolbarSearchController.searchTerm}
              onChange={(e) => toolbarSearchController.onSearchChange(e.target.value)}
              placeholder={toolbarSearchController.placeholder}
              className="pl-9 bg-background/60 border-border/60 h-9"
            />
            {toolbarSearchController.searchTerm.trim().length > 0 && (
              <Button
                type="button"
                onClick={() => toolbarSearchController.onSearchChange("")}
                aria-label="Clear search"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 px-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </PageToolbarCard>
      }
      isLoading={showSkeleton}
      loadingContent={<LeadsTableSkeleton />}
      tableContent={
        <LeadsTable
          leads={rows}
          isLoading={showSkeleton}
          getContextMenuItems={getContextMenuItems}
          onOpenNotesModal={table.onOpenNotesModal}
          onViewContact={table.onViewContact}
          groupBy="leadType"
          pagination={{ enabled: true }}
          isMutating={table.isMutating}
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
                  {(deleteModalProps.itemToDelete as { name?: string })?.name}
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
        </>
      }
    />
  );
}
