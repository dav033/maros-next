"use client";

import { NotesEditorModal, DeleteFeedbackModal, EntityCrudPageTemplate } from "@/components/shared";
import type { Project } from "@/project/domain";
import { ProjectProgressStatus, InvoiceStatus } from "@/project/domain";
import { ProjectsTable } from "@/project/presentation";
import { ProjectModal } from "../organisms/ProjectModal";
import { PaymentsModal } from "../organisms/PaymentsModal";
import { X, FolderPlus, Search, Layers } from "lucide-react";
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
import type { ProjectGroupBy } from "../hooks/table/useProjectsTableLogic";
import { useProjectsToolbarSearchController } from "../hooks/table/useProjectsToolbarSearchController";
import { useProjectsNotesModalController } from "../hooks/modals/useProjectsNotesModalController";
import { useInstantLeadsByType } from "@/leads/presentation";
import { LeadType } from "@/leads/domain";

const PROGRESS_OPTIONS: Array<{ value: ProjectProgressStatus | "all"; label: string }> = [
  { value: "all", label: "All progress" },
  { value: ProjectProgressStatus.NOT_EXECUTED, label: "Not Executed" },
  { value: ProjectProgressStatus.IN_PROGRESS, label: "In Progress" },
  { value: ProjectProgressStatus.COMPLETED, label: "Completed" },
  { value: ProjectProgressStatus.POSTPONED, label: "Postponed" },
  { value: ProjectProgressStatus.PERMITS, label: "Permits" },
  { value: ProjectProgressStatus.LOST, label: "Lost" },
];

const INVOICE_OPTIONS: Array<{ value: InvoiceStatus | "all"; label: string }> = [
  { value: "all", label: "All invoices" },
  { value: InvoiceStatus.PAID, label: "Paid" },
  { value: InvoiceStatus.PENDING, label: "Pending" },
  { value: InvoiceStatus.NOT_EXECUTED, label: "Not Executed" },
  { value: InvoiceStatus.PERMITS, label: "Permits" },
];

const PROJECT_GROUP_OPTIONS: Array<{ value: ProjectGroupBy; label: string }> = [
  { value: "none", label: "No grouping" },
  { value: "progressStatus", label: "By progress" },
  { value: "invoiceStatus", label: "By invoice" },
  { value: "projectType", label: "By type" },
];

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
    filterState,
    deleteModalProps,
    getContextMenuItems,
  } = table;

  const { searchQuery, searchField, setSearchQuery, setSearchField } = searchState;
  const { progressFilter, setProgressFilter, invoiceFilter, setInvoiceFilter, groupBy, setGroupBy } = filterState;

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
        <div className="flex flex-col gap-2 rounded-xl bg-card p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-1 items-center gap-2 flex-wrap">
              {/* Search field selector */}
              <div className="w-32 shrink-0">
                <Select value={toolbarSearchController.selectedField} onValueChange={toolbarSearchController.onFieldChange}>
                  <SelectTrigger className="bg-background border-input h-9 text-xs">
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
              <div className="flex-1 min-w-[160px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={toolbarSearchController.searchTerm}
                  onChange={(e) => toolbarSearchController.onSearchChange(e.target.value)}
                  placeholder={toolbarSearchController.placeholder}
                  className="pl-9 bg-background border-input h-9"
                />
              </div>
              {toolbarSearchController.searchTerm.trim().length > 0 && (
                <Button type="button" onClick={() => toolbarSearchController.onSearchChange("")} aria-label="Clear search" variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-9 px-2">
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Progress status filter */}
              <div className="w-36 shrink-0">
                <Select value={progressFilter} onValueChange={(v) => setProgressFilter(v as ProjectProgressStatus | "all")}>
                  <SelectTrigger className="bg-background border-input h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {PROGRESS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Invoice status filter */}
              <div className="w-36 shrink-0">
                <Select value={invoiceFilter} onValueChange={(v) => setInvoiceFilter(v as InvoiceStatus | "all")}>
                  <SelectTrigger className="bg-background border-input h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {INVOICE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Group by */}
              <div className="w-36 shrink-0">
                <Select value={groupBy} onValueChange={(v) => setGroupBy(v as ProjectGroupBy)}>
                  <SelectTrigger className="bg-background border-input h-9 text-xs">
                    <Layers className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {PROJECT_GROUP_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {typeof toolbarSearchController.resultCount === "number" && (
                <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                  {toolbarSearchController.resultCount} of {toolbarSearchController.totalCount}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button onClick={openCreateModal} aria-label="New Project" size="icon" className="bg-[#2c3637] hover:bg-[#2c3637]/90 text-foreground">
                <FolderPlus className="size-4" />
              </Button>
            </div>
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
          groupBy={groupBy}
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

