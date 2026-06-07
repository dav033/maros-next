"use client";

import {
  NotesEditorModal,
  DeleteFeedbackModal,
  EntityCrudPageTemplate,
  PageHeaderCard,
  PageToolbarCard,
} from "@/components/shared";
import type { Lead } from "@/leads/domain";
import { LeadStatus } from "@/leads/domain";
import { LeadsTable } from "@/leads/presentation";
import { ContactViewModal } from "@/contact";
import { LeadModal } from "../organisms/LeadModal";
import { PostConversionEstimateModal } from "../organisms/PostConversionEstimateModal";
import { X, Briefcase, Search, Layers, Filter, Plus, SlidersHorizontal } from "lucide-react";
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
import type { LeadGroupBy } from "../hooks/table/useLeadsTableLogic";
import {
  useLeadModalController,
  useLeadsToolbarSearchController,
  useLeadsNotesModalController,
} from "../hooks";
import { LeadTypeSwitcher } from "@/components/shared/LeadTypeSwitcher";
import type { LeadType } from "@/leads/domain";

const LEAD_STATUS_OPTIONS: Array<{ value: LeadStatus | "all"; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: LeadStatus.NEW_LEAD, label: "New Lead" },
  { value: LeadStatus.CONTACTED, label: "Contacted" },
  { value: LeadStatus.ESTIMATING_PREPARING_PROPOSAL, label: "Estimating / Preparing Proposal" },
  { value: LeadStatus.PROPOSAL_SENT, label: "Proposal Sent" },
  { value: LeadStatus.FOLLOW_UP, label: "Follow Up" },
  { value: LeadStatus.WON, label: "Won" },
  { value: LeadStatus.LOST, label: "Lost" },
];

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

  const { searchQuery, searchField, setSearchQuery, setSearchField } = searchState;
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

          {/* Status filter */}
          <div className="w-36 shrink-0">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | "all")}>
              <SelectTrigger className="bg-background/60 border-border/60 h-9 text-xs">
                <Filter className="h-3.5 w-3.5 mr-1.5 shrink-0 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {LEAD_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        <LeadsTable
          leads={rows}
          isLoading={showSkeleton}
          onEdit={openEditModal}
          getContextMenuItems={getContextMenuItems}
          onOpenNotesModal={table.onOpenNotesModal}
          onViewContact={table.onViewContact}
          groupBy={groupBy}
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
