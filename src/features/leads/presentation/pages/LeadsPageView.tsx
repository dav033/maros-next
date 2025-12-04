"use client";

import type { Lead } from "@/leads/domain";
import { LeadsToolbar, LeadsTable } from "@/leads/presentation";
import { TableSkeleton, EmptyState, EntityCrudPageTemplate, Button } from "@/shared/ui";
import { CreateLeadModal } from "../organisms/CreateLeadModal";
import { EditLeadModal } from "../organisms/EditLeadModal";
import { LeadsPageHeader } from "../organisms/LeadsPageComponents";
import type { UseLeadsPageLogicReturn } from "./useLeadsPageLogic";

export interface LeadsPageViewProps {
  logic: UseLeadsPageLogicReturn;
  onDelete: () => Promise<void>;
}

/**
 * Pure presentational component for the Leads page (by type).
 * Manages two modals: Create lead (with contact selection) and Edit lead.
 */
export function LeadsPageView({ logic, onDelete }: LeadsPageViewProps) {
  const {
    config,
    leads,
    filteredLeads,
    contacts,
    projectTypes,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
    showSkeleton,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
    createController,
    isEditModalOpen,
    selectedLead,
    openEditModal,
    closeEditModal,
    updateController,
  } = logic;

  const { title, description, emptyIconName, emptyTitle, emptySubtitle, createModalTitle } = config;

  return (
    <EntityCrudPageTemplate
      header={
        <LeadsPageHeader
          title={title}
          description={description}
          onNewLead={openCreateModal}
        />
      }
      toolbar={
        <div className="flex items-center justify-between gap-4">
          <LeadsToolbar
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            searchField={searchField}
            onSearchFieldChange={(value) => setSearchField(value as keyof Lead | "all")}
            totalCount={totalCount}
            filteredCount={filteredCount}
          />
          <Button variant="primary" onClick={openCreateModal}>
            <span className="mr-2 text-lg leading-none">＋</span>
            New Lead
          </Button>
        </div>
      }
      isLoading={showSkeleton}
      loadingContent={
        <TableSkeleton
          columns={[
            { width: "w-[110px]", header: "Lead Number", skeletonWidth: "w-20" },
            { width: "w-[200px]", header: "Name", skeletonWidth: "w-3/4" },
            { width: "w-[180px]", header: "Contact", skeletonWidth: "w-2/3" },
            { width: "w-[150px]", header: "Project Type", skeletonWidth: "w-3/5" },
            { width: "w-[200px]", header: "Location", skeletonWidth: "w-4/5" },
            { width: "w-[120px]", header: "Start Date", skeletonWidth: "w-20" },
            { width: "w-[120px]", header: "Status", skeletonWidth: "w-24", isBadge: true },
          ]}
          rowCount={13}
        />
      }
      isEmpty={false}
      emptyContent={null}
      tableContent={
        <LeadsTable
          leads={filteredLeads}
          isLoading={showSkeleton}
          onEdit={openEditModal}
          onDelete={onDelete}
        />
      }
      modals={
        <>
          {/* Create Lead Modal */}
          <CreateLeadModal
            isOpen={isCreateModalOpen}
            onClose={closeCreateModal}
            title={createModalTitle}
            form={createController.form}
            onFormChange={createController.setField}
            contactMode={createController.contactMode}
            onContactModeChange={createController.setContactMode}
            contacts={contacts ?? []}
            projectTypes={projectTypes}
            isLoading={createController.isLoading}
            error={createController.error}
            canSubmit={createController.canSubmit}
            onSubmit={createController.submit}
            ContactMode={createController.ContactMode}
          />

          {/* Edit Lead Modal */}
          <EditLeadModal
            isOpen={isEditModalOpen}
            onClose={closeEditModal}
            lead={selectedLead}
            form={updateController.form}
            onFormChange={updateController.setField}
            contacts={contacts ?? []}
            projectTypes={projectTypes}
            isLoading={updateController.isLoading}
            error={updateController.error}
            canSubmit={updateController.canSubmit}
            onSubmit={updateController.submit}
          />
        </>
      }
    />
  );
}
