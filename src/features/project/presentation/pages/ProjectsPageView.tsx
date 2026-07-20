"use client";

import {
  NotesEditorModal,
  DeleteFeedbackModal,
  EntityCrudPageTemplate,
  MultiSelectFilter,
  PageHeaderCard,
  PageToolbarCard,
  BulkActionsBar,
} from "@/components/shared";
import type { Project } from "@/project/domain";
import { ProjectProgressStatus, InvoiceStatus } from "@/project/domain";
import { INVOICE_COLORS, PROGRESS_COLORS, PROGRESS_LABELS } from "../organisms/projectVisualTokens";
import { ProjectsTable } from "@/project/presentation";
import { ProjectModal } from "../organisms/ProjectModal";
import {
  X,
  FolderPlus,
  Search,
  Layers,
  FolderKanban,
  Filter,
  Plus,
  SlidersHorizontal,
  Receipt,
  Check,
  Trash2,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UseProjectsPageLogicReturn } from "./useProjectsPageLogic";
import type { ProjectGroupBy } from "../hooks/table/useProjectsTableLogic";
import { useProjectsToolbarSearchController } from "../hooks/table/useProjectsToolbarSearchController";
import { useProjectsNotesModalController } from "../hooks/modals/useProjectsNotesModalController";
import { useInstantLeadsByType } from "@/leads/presentation";
import { LeadTypeSwitcher } from "@/components/shared/LeadTypeSwitcher";

const PROGRESS_FILTER_OPTIONS = [
  { value: ProjectProgressStatus.NOT_EXECUTED, label: "Not Executed", color: PROGRESS_COLORS.NOT_EXECUTED },
  { value: ProjectProgressStatus.IN_PROGRESS, label: "In Progress", color: PROGRESS_COLORS.IN_PROGRESS },
  { value: ProjectProgressStatus.COMPLETED, label: "Completed", color: PROGRESS_COLORS.COMPLETED },
  { value: ProjectProgressStatus.POSTPONED, label: "Postponed", color: PROGRESS_COLORS.POSTPONED },
  { value: ProjectProgressStatus.PERMITS, label: "Permits", color: PROGRESS_COLORS.PERMITS },
  { value: ProjectProgressStatus.LOST, label: "Lost", color: PROGRESS_COLORS.LOST },
];

const INVOICE_FILTER_OPTIONS = [
  { value: InvoiceStatus.PAID, label: "Paid", color: INVOICE_COLORS.PAID },
  { value: InvoiceStatus.PENDING, label: "Pending", color: INVOICE_COLORS.PENDING },
  { value: InvoiceStatus.NOT_EXECUTED, label: "Not Executed", color: INVOICE_COLORS.NOT_EXECUTED },
  { value: InvoiceStatus.PERMITS, label: "Permits", color: INVOICE_COLORS.PERMITS },
];

const PROJECT_GROUP_OPTIONS: Array<{ value: ProjectGroupBy; label: string }> = [
  { value: "none", label: "No grouping" },
  { value: "progressStatus", label: "By progress" },
  { value: "invoiceStatus", label: "By invoice" },
  { value: "projectType", label: "By type" },
  { value: "leadType", label: "By category" },
];

export interface ProjectsPageViewProps {
  logic: UseProjectsPageLogicReturn;
}

export function ProjectsPageView({ logic }: ProjectsPageViewProps) {
  const { leadType, data, crud, table, bulkActions, notesModal, openNotesModal } = logic;

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

  const leadsByType = useInstantLeadsByType(leadType);
  const leads = leadsByType.leads ?? [];

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
        <PageHeaderCard
          icon={FolderKanban}
          title="Projects"
          description="Track active work, invoices and project progress"
          rightSlot={
            <Button onClick={openCreateModal} aria-label="New Project" className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              New project
            </Button>
          }
          belowSlot={<LeadTypeSwitcher currentType={leadType} basePath="/projects" />}
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

          {/* Progress status filter (multi-select: ver más de un estado a la vez) */}
          <div className="w-40 shrink-0">
            <MultiSelectFilter
              icon={Filter}
              placeholder="All progress"
              options={PROGRESS_FILTER_OPTIONS}
              selected={progressFilter}
              onChange={setProgressFilter}
            />
          </div>

          {/* Invoice status filter (multi-select) */}
          <div className="w-40 shrink-0">
            <MultiSelectFilter
              icon={Receipt}
              placeholder="All invoices"
              options={INVOICE_FILTER_OPTIONS}
              selected={invoiceFilter}
              onChange={setInvoiceFilter}
            />
          </div>

          {/* Group by */}
          <div className="w-36 shrink-0">
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as ProjectGroupBy)}>
              <SelectTrigger className="bg-background/60 border-border/60 h-9 text-xs">
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
        </PageToolbarCard>
      }
      isLoading={showSkeleton}
      loadingContent={<ProjectsTableSkeleton />}
      tableContent={
        <div className="space-y-3">
          <BulkActionsBar count={bulkActions.selectedCount} onClear={bulkActions.clearSelection}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                  disabled={bulkActions.availableStatuses.length === 0 || bulkActions.isChangingStatus}
                >
                  <Check className="h-3.5 w-3.5" />
                  Change status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {bulkActions.availableStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => void bulkActions.changeStatus(status)}
                  >
                    {PROGRESS_LABELS[status] ?? status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="gap-1.5"
              onClick={bulkActions.deleteModal.open}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </BulkActionsBar>

          <ProjectsTable
            tableLogic={table}
            isLoading={showSkeleton}
            onOpenNotesModal={openNotesModal}
            groupBy={groupBy}
            pagination={{ enabled: true }}
            selection={{
              selectedIds: bulkActions.selectedIds,
              onSelectionChange: bulkActions.onSelectionChange,
            }}
          />
        </div>
      }
      modals={
        <>
          <DeleteFeedbackModal
            isOpen={bulkActions.deleteModal.isOpen}
            title="Delete Projects"
            description={
              <>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {bulkActions.selectedCount} project{bulkActions.selectedCount === 1 ? "" : "s"}
                </span>
                ?
                <br />
                This action cannot be undone.
              </>
            }
            loading={bulkActions.deleteModal.isDeleting}
            onClose={bulkActions.deleteModal.close}
            onConfirm={() => void bulkActions.deleteModal.confirm()}
          />

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

          <ProjectModal
            controller={projectModalController}
            leads={leads}
          />

          <NotesEditorModal controller={notesModalController} />
        </>
      }
    />
  );
}

