"use client";

import { NotesEditorModal, DeleteFeedbackModal, EntityCrudPageTemplate } from "@/components/shared";
import type { Project } from "@/project/domain";
import { ProjectsTable } from "@/project/presentation";
import { ProjectModal } from "../organisms/ProjectModal";
import { PaymentsModal } from "../organisms/PaymentsModal";
import { X, FolderPlus, Search } from "lucide-react";
import { ProjectsTableSkeleton } from "../organisms/ProjectsTableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UseProjectsPageLogicReturn } from "./useProjectsPageLogic";
import { useProjectsToolbarSearchController } from "../hooks/table/useProjectsToolbarSearchController";
import { useProjectsNotesModalController } from "../hooks/modals/useProjectsNotesModalController";
import { useInstantLeadsByType } from "@/leads/presentation";
import { LeadType } from "@/leads/domain";

export interface ProjectsPageViewProps {
  logic: UseProjectsPageLogicReturn;
}

export function ProjectsPageView({ logic }: ProjectsPageViewProps) {
  const { data, crud, table, notesModal, openNotesModal, paymentsModal } = logic;

  const { projects, showSkeleton } = data;

  const {
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    createController,
    isEditModalOpen,
    selectedProject,
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

  // Obtener todos los leads para el select
  const allLeads = useInstantLeadsByType(LeadType.CONSTRUCTION);
  const plumbingLeads = useInstantLeadsByType(LeadType.PLUMBING);
  const roofingLeads = useInstantLeadsByType(LeadType.ROOFING);
  
  const leads = [
    ...(allLeads.leads ?? []),
    ...(plumbingLeads.leads ?? []),
    ...(roofingLeads.leads ?? []),
  ];

  const toolbarSearchController = useProjectsToolbarSearchController({
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    filteredCount,
    totalCount,
  });

  const notesModalController = useProjectsNotesModalController({
    isOpen: notesModal.isOpen,
    title: notesModal.title,
    notes: notesModal.notes,
    onChangeNotes: notesModal.onChangeNotes,
    onClose: notesModal.onClose,
    onSave: notesModal.onSave,
    loading: notesModal.loading,
  });

  const projectModalController = {
    isOpen: isCreateModalOpen || isEditModalOpen,
    mode: (isCreateModalOpen ? "create" : "edit") as "create" | "edit",
    onClose: isCreateModalOpen ? closeCreateModal : closeEditModal,
    createController: isCreateModalOpen ? createController : undefined,
    updateController: isEditModalOpen ? updateController : undefined,
    project: selectedProject,
  };

  return (
    <EntityCrudPageTemplate
      header={
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Projects</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Manage your projects</p>
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
              aria-label="New Project"
              size="icon"
              className="bg-[#2c3637] hover:bg-[#2c3637]/90 text-foreground"
            >
              <FolderPlus className="size-4" />
            </Button>
          </div>
        </div>
      }
      isLoading={showSkeleton}
      loadingContent={<ProjectsTableSkeleton />}
      tableContent={
        <ProjectsTable
          tableLogic={table}
          isLoading={showSkeleton}
          onOpenNotesModal={openNotesModal}
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
                  {selectedProject?.lead.name}
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

          <ProjectModal
            controller={projectModalController}
            leads={leads}
          />

          <NotesEditorModal controller={notesModalController} />

          <PaymentsModal controller={paymentsModal} />
        </>
      }
    />
  );
}

