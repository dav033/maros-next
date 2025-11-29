"use client";

import { useMemo, useState } from "react";
import { LeadType } from "@/leads";
import { useInstantLeadsByType, LeadsToolbar, LeadsTable, LeadsTableSkeleton, useCreateLeadController, useUpdateLeadController, LeadForm, LeadEditForm, ContactModeSelector } from "@/leads";
import { useSearchState, filterBySearch } from "@/shared/search";
import { leadsSearchConfig } from "@/leads";
import { Icon, Modal, Button } from "@/shared/ui";
import { Spinner } from "@/shared/ui/atoms/Spinner";
import { useToast } from "@/shared/ui/context/ToastContext";
import type { Lead } from "@/leads";
import { useInstantContacts } from "@/contact";
import { useProjectTypes } from "@/projectType";

export default function PlumbingLeadsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const toast = useToast();

  const {
    state: searchState,
    setQuery,
    setField,
  } = useSearchState<Lead>(leadsSearchConfig);

  const { leads, showSkeleton, refetch } = useInstantLeadsByType(LeadType.PLUMBING);
  const { contacts } = useInstantContacts();
  const { projectTypes } = useProjectTypes();

  const filteredLeads = useMemo(
    () => filterBySearch(leads ?? [], leadsSearchConfig, searchState),
    [leads, searchState]
  );

  const {
    form,
    setField: setFormField,
    contactMode,
    setContactMode,
    isLoading,
    error,
    canSubmit,
    submit,
    ContactMode,
  } = useCreateLeadController({
    leadType: LeadType.PLUMBING,
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
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-theme-light sm:text-2xl">Plumbing Leads</h1>
        <p className="text-xs text-gray-400 sm:text-sm">
          Manage plumbing leads and opportunities.
        </p>
      </header>

      <div className="flex items-center justify-between gap-4">
        <LeadsToolbar
          searchQuery={searchState.query}
          onSearchQueryChange={setQuery}
          searchField={searchState.field}
          onSearchFieldChange={(value) => setField(value as keyof Lead | "all")}
          totalCount={leads?.length ?? 0}
          filteredCount={filteredLeads.length}
        />
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Icon name="lucide:plus" className="mr-2" size={16} />
          New Lead
        </Button>
      </div>

      <section className="mt-2 flex flex-1 flex-col">
        {showSkeleton ? (
          <LeadsTableSkeleton />
        ) : filteredLeads.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="max-w-md rounded-xl border border-dashed border-theme-gray-subtle bg-theme-dark/80 px-4 py-8 text-center text-sm text-gray-400 sm:rounded-2xl sm:px-6 sm:py-10">
              <Icon name="mdi:pipe-wrench" size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-base font-medium text-gray-300">No plumbing leads found.</p>
              <p className="mt-2 text-xs sm:text-sm">
                {searchState.query ? "Try adjusting your search criteria." : "No leads available yet."}
              </p>
            </div>
          </div>
        ) : (
          <LeadsTable
            leads={filteredLeads}
            isLoading={showSkeleton}
            onEdit={handleEditLead}
            onDelete={async (lead) => {
              await refetch();
            }}
          />
        )}
      </section>

      <Modal
        isOpen={isModalOpen}
        title="Create Plumbing Lead"
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submit} disabled={!canSubmit || isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" />
                  Creating...
                </span>
              ) : (
                "Create"
              )}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <ContactModeSelector
            contactMode={contactMode}
            onContactModeChange={setContactMode}
            form={{
              contactName: form.contactName ?? "",
              phone: form.phone ?? "",
              email: form.email ?? "",
            }}
            onChange={(key, value) => setFormField(key as any, value)}
            disabled={isLoading}
          />
          <LeadForm
            form={form}
            onChange={setFormField}
            projectTypes={projectTypes}
            contacts={contacts ?? []}
            showContactSelect={contactMode === ContactMode.EXISTING_CONTACT}
            disabled={isLoading}
          />
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
              <Icon name="lucide:alert-circle" size={16} className="text-red-400 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      </Modal>

      {selectedLead && (
        <Modal
          isOpen={isEditModalOpen}
          title="Edit Lead"
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedLead(null);
          }}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedLead(null);
                }}
                disabled={updateController.isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={updateController.submit}
                disabled={!updateController.canSubmit || updateController.isLoading}
              >
                {updateController.isLoading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" />
                    Updating...
                  </span>
                ) : (
                  "Update"
                )}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <LeadEditForm
              form={updateController.form}
              onChange={updateController.setField}
              projectTypes={projectTypes}
              contacts={contacts ?? []}
              disabled={updateController.isLoading}
            />
            {updateController.error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <Icon name="lucide:alert-circle" size={16} className="text-red-400 mt-0.5" />
                <p className="text-sm text-red-400">{updateController.error}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </main>
  );
}
