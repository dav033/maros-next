"use client";

import { useState } from "react";
import type { Lead } from "@/leads";
import {
  LeadType,
  LeadsToolbar,
  LeadsTable,
  useCreateLeadController,
  useUpdateLeadController,
  LEAD_TYPE_CONFIGS,
} from "@/leads";
import { TableSkeleton, EmptyState } from "@/shared/ui";
import { useToast } from "@/shared/ui/context/ToastContext";
import { useLeadsPageByType } from "./useLeadsPageByType";
import { CreateLeadModal } from "./CreateLeadModal";
import { EditLeadModal } from "./EditLeadModal";
import { LeadsPageHeader, LeadsPageToolbar } from "./LeadsPageComponents";

export type LeadsPageByTypeProps = {
  leadType: LeadType;
};

export function LeadsPageByType({ leadType }: LeadsPageByTypeProps) {
  const config = LEAD_TYPE_CONFIGS[leadType];
  const { title, description, emptyIconName, emptyTitle, emptySubtitle, createModalTitle } = config;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const toast = useToast();

  const {
    searchState,
    setQuery,
    setField,
    leads,
    showSkeleton,
    refetch,
    contacts,
    projectTypes,
    filteredLeads,
  } = useLeadsPageByType(leadType);

  const createController = useCreateLeadController({
    leadType,
    onCreated: async () => {
      setIsModalOpen(false);
      toast.showSuccess("Lead created successfully!");
      await refetch();
    },
  });

  const updateController = useUpdateLeadController({
    lead: selectedLead,
    onUpdated: async () => {
      setIsEditModalOpen(false);
      setSelectedLead(null);
      toast.showSuccess("Lead updated successfully!");
      await refetch();
    },
  });

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead);
    setIsEditModalOpen(true);
  };

  return (
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col gap-3 bg-theme-dark px-3 py-3 pt-16 sm:gap-4 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6">
      <LeadsPageHeader
        title={title}
        description={description}
        onNewLead={() => setIsModalOpen(true)}
      />

      <LeadsPageToolbar
        searchQuery={searchState.query}
        onSearchQueryChange={setQuery}
        searchField={searchState.field}
        onSearchFieldChange={(value) => setField(value as keyof Lead | "all")}
        totalCount={leads?.length ?? 0}
        filteredCount={filteredLeads.length}
        onNewLead={() => setIsModalOpen(true)}
        LeadsToolbar={LeadsToolbar}
      />

      <section className="mt-2 flex flex-1 flex-col">
        {showSkeleton ? (
          <TableSkeleton
            columns={[
              { width: "w-[150px]", header: "Lead Number", skeletonWidth: "w-20" },
              { width: "w-[200px]", header: "Name", skeletonWidth: "w-3/4" },
              { width: "w-[180px]", header: "Contact", skeletonWidth: "w-2/3" },
              { width: "w-[150px]", header: "Project Type", skeletonWidth: "w-3/5" },
              { width: "w-[200px]", header: "Location", skeletonWidth: "w-4/5" },
              { width: "w-[120px]", header: "Start Date", skeletonWidth: "w-20" },
              { width: "w-[130px]", header: "Status", skeletonWidth: "w-24", isBadge: true },
            ]}
            rowCount={13}
          />
        ) : !leads || leads.length === 0 ? (
          <EmptyState
            iconName={emptyIconName}
            title={emptyTitle}
            subtitle={Boolean(searchState.query) ? "Try adjusting your search criteria." : emptySubtitle}
          />
        ) : (
          <LeadsTable
            leads={filteredLeads}
            isLoading={showSkeleton}
            onEdit={handleEditLead}
            onDelete={async () => {
              await refetch();
            }}
          />
        )}
      </section>

      <CreateLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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

      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLead(null);
        }}
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
    </main>
  );
}
