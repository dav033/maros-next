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
import type { Lead } from "@/leads/domain";
import { LeadStatus, STATUS_LABELS } from "@/leads/domain";
import { LeadsTable } from "@/leads/presentation";
import { LEAD_STATUS_COLORS } from "../atoms/leadVisualTokens";
import { ContactViewModal } from "@/contact";
import { LeadModal } from "../organisms/LeadModal";
import { PostConversionEstimateModal } from "../organisms/PostConversionEstimateModal";
import {
  X,
  Briefcase,
  Search,
  Layers,
  Filter,
  Plus,
  SlidersHorizontal,
  Check,
  Trash2,
} from "lucide-react";
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
import { LeadsTableSkeleton } from "../organisms/LeadsTableSkeleton";
import type { UseLeadsPageLogicReturn } from "./useLeadsPageLogic";
import type { LeadGroupBy } from "../hooks/table/useLeadsTableLogic";
import {
  useLeadModalController,
  useLeadsToolbarSearchController,
  useLeadsNotesModalController,
} from "../hooks";
import { LeadTypeSwitcher } from "@/components/shared/LeadTypeSwitcher";
import type { LeadType } from "@/leads/domain";

const LEAD_STATUS_FILTER_OPTIONS = Object.values(LeadStatus).map((status) => ({
  value: status,
  label: (STATUS_LABELS as Record<string, string>)[status] ?? status,
  color: LEAD_STATUS_COLORS[status],
}));

const LEAD_GROUP_OPTIONS: Array<{ value: LeadGroupBy; label: string }> = [
  { value: "none", label: "No grouping" },
  { value: "status", label: "By status" },
  { value: "projectType", label: "By type" },
];

export interface LeadsPageViewProps {
  logic: UseLeadsPageLogicReturn;
  leadType: LeadType;
}

export function LeadsPageView({ logic, leadType }: LeadsPageViewProps) {
  const {
    config,
    data,
    crud,
    table,
    bulkActions,
    notesModal,
    viewContactModal,
    convertProjectModal,
    postConversionEstimateModal,
  } = logic;

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
    filterState,
    deleteModalProps,
    getContextMenuItems,
  } = table;

  const { searchQuery, setSearchQuery } = searchState;
  const { statusFilter, setStatusFilter, groupBy, setGroupBy } = filterState;

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
    setSearchQuery,
    filteredCount,
    totalCount,
  });

  return (
    <EntityCrudPageTemplate
      header={
        <PageHeaderCard
          icon={Briefcase}
          title={title}
          description={description}
          rightSlot={
            <Button onClick={openCreateModal} aria-label="New Lead" className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              New lead
            </Button>
          }
          belowSlot={<LeadTypeSwitcher currentType={leadType} basePath="/leads" />}
        />
      }
      toolbar={
        <PageToolbarCard
          icon={SlidersHorizontal}
          label="Filters & search"
          resultCount={toolbarSearchController.resultCount}
          totalCount={toolbarSearchController.totalCount}
        >
          {/* Search input (busca en todos los campos a la vez) */}
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

          {/* Status filter (multi-select: ver más de un estado a la vez) */}
          <div className="w-40 shrink-0">
            <MultiSelectFilter
              icon={Filter}
              placeholder="All statuses"
              options={LEAD_STATUS_FILTER_OPTIONS}
              selected={statusFilter}
              onChange={setStatusFilter}
            />
          </div>

          {/* Group by */}
          <div className="w-36 shrink-0">
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as LeadGroupBy)}>
              <SelectTrigger className="bg-background/60 border-border/60 h-9 text-xs">
                <Layers className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {LEAD_GROUP_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </PageToolbarCard>
      }
      isLoading={showSkeleton}
      loadingContent={<LeadsTableSkeleton />}
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
                    {(STATUS_LABELS as Record<string, string>)[status] ?? status}
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

          <LeadsTable
            leads={rows}
            isLoading={showSkeleton}
            onEdit={openEditModal}
            getContextMenuItems={getContextMenuItems}
            onOpenNotesModal={table.onOpenNotesModal}
            onViewContact={table.onViewContact}
            groupBy={groupBy}
            pagination={{ enabled: true }}
            isMutating={table.isMutating}
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
            title="Delete Leads"
            description={
              <>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {bulkActions.selectedCount} lead{bulkActions.selectedCount === 1 ? "" : "s"}
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
            title="Delete Lead"
            description={
              <>
                Are you sure you want to delete lead{" "}
                <span className="font-semibold text-foreground">
                  {deleteModalProps.itemToDelete?.name}
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

          <DeleteFeedbackModal
            isOpen={convertProjectModal.isOpen}
            title="Convert Lead to Project"
            description={
              <>
                Are you sure you want to convert lead{" "}
                <span className="font-semibold text-foreground">
                  {convertProjectModal.leadToConvert?.leadNumber
                    ? `#${convertProjectModal.leadToConvert.leadNumber}`
                    : convertProjectModal.leadToConvert?.name}
                </span>{" "}
                into a project?
              </>
            }
            loading={convertProjectModal.loading}
            onClose={convertProjectModal.onClose}
            onConfirm={convertProjectModal.onConfirm}
            confirmLabel="Convert"
            loadingLabel="Converting..."
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

{postConversionEstimateModal.projectId !== null && (
            <PostConversionEstimateModal
              open
              onClose={postConversionEstimateModal.onClose}
              projectId={postConversionEstimateModal.projectId}
              leadName={postConversionEstimateModal.leadName}
              contactEmail={postConversionEstimateModal.contactEmail}
            />
          )}
        </>
      }
    />
  );
}
