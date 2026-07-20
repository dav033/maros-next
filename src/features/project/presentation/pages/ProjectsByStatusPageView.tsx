"use client";

import type { LucideIcon } from "lucide-react";
import { X, Search, SlidersHorizontal } from "lucide-react";
import {
  NotesEditorModal,
  DeleteFeedbackModal,
  EntityCrudPageTemplate,
  PageHeaderCard,
  PageToolbarCard,
} from "@/components/shared";
import { ProjectsTable } from "@/project/presentation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectsTableSkeleton } from "../organisms/ProjectsTableSkeleton";
import type { UseProjectsByStatusPageLogicReturn } from "./useProjectsByStatusPageLogic";
import { useProjectsToolbarSearchController } from "../hooks/table/useProjectsToolbarSearchController";
import { useProjectsNotesModalController } from "../hooks/modals/useProjectsNotesModalController";

export interface ProjectsByStatusPageViewProps {
  logic: UseProjectsByStatusPageLogicReturn;
  icon: LucideIcon;
  title: string;
  description: string;
}

export function ProjectsByStatusPageView({
  logic,
  icon,
  title,
  description,
}: ProjectsByStatusPageViewProps) {
  const { data, table, notesModal } = logic;
  const { showSkeleton } = data;

  const { totalCount, filteredCount, searchState, deleteModalProps } = table;

  const { searchQuery, searchField, setSearchQuery, setSearchField } = searchState;

  const notesModalController = useProjectsNotesModalController({
    isOpen: notesModal.isOpen,
    title: notesModal.title,
    notes: notesModal.notes,
    onChangeNotes: notesModal.onChangeNotes,
    onClose: notesModal.onClose,
    onSave: notesModal.onSave,
    loading: notesModal.loading,
  });

  const toolbarSearchController = useProjectsToolbarSearchController({
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    filteredCount,
    totalCount,
  });

  return (
    <EntityCrudPageTemplate
      header={<PageHeaderCard icon={icon} title={title} description={description} />}
      toolbar={
        <PageToolbarCard
          icon={SlidersHorizontal}
          label="Filters & search"
          resultCount={toolbarSearchController.resultCount}
          totalCount={toolbarSearchController.totalCount}
        >
          {/* Search input (búsqueda simple: estas páginas ya vienen acotadas por status) */}
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
      loadingContent={<ProjectsTableSkeleton />}
      tableContent={
        <ProjectsTable
          tableLogic={table}
          isLoading={showSkeleton}
          onOpenNotesModal={logic.openNotesModal}
          groupBy="leadType"
          pagination={{ enabled: true }}
        />
      }
      modals={
        <>
          <DeleteFeedbackModal
            isOpen={deleteModalProps.isOpen}
            title="Delete Project"
            description={
              <>
                Are you sure you want to delete project{" "}
                <span className="font-semibold text-foreground">
                  {deleteModalProps.itemToDelete?.lead.name}
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
        </>
      }
    />
  );
}
