"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompanyDraft } from "../domain/models";
import { companyKeys, companyCrudUseCases } from "../application";
import { useCompanyApp } from "@/di";
import { Button, Icon, Modal, useToast } from "@/shared/ui";
import { useEntityForm, optimizedApiClient } from "@/shared";
import { CompanyForm } from "./components/CompanyForm";
import { ManageServicesModal } from "./components/ManageServicesModal";
import { CompaniesTable } from "./components/CompaniesTable";
import { CompaniesTableSkeleton } from "./components/CompaniesTableSkeleton";
import { useInstantCompanies } from "./hooks/useInstantCompanies";
import { useCompanyServices } from "./hooks/useCompanyServices";
import { useInstantContacts } from "@/features/contact/presentation/hooks/useInstantContacts";
import { companyEndpoints } from "../infra/http/endpoints";
import { contactsKeys } from "@/contact";
import { initialCompanyFormValue, toDraft, toPatch, mapCompanyToFormValue } from "./helpers/companyFormHelpers";

export default function CompaniesPage() {
  const app = useCompanyApp();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { companies, showSkeleton } = useInstantCompanies();
  const { services } = useCompanyServices();
  const { contacts } = useInstantContacts();

  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isManageServicesOpen, setIsManageServicesOpen] = useState(false);

  const {
    isOpen: isEditOpen,
    openEdit,
    closeModal: closeEditModal,
    formValue: editFormValue,
    setFormValue: setEditFormValue,
    currentEntity: currentCompany,
    serverError: editServerError,
    setServerError: setEditServerError,
    handleSubmit: handleEditSubmit,
    isSubmitting: isEditSubmitting,
  } = useEntityForm({
    initialFormValue: initialCompanyFormValue,
    toPatch,
    updateFn: async (id, patch) => {
      const updated = await companyCrudUseCases.update(app)(id, patch);
      if (editFormValue.contactIds !== undefined) {
        await optimizedApiClient.post(
          companyEndpoints.assignContacts(id),
          editFormValue.contactIds || []
        );
      }
      return updated;
    },
    invalidateKeys: [companyKeys.all, ["customers"], contactsKeys.lists()] as any,
    successMessage: "Company updated successfully!",
  });

  const [createFormValue, setCreateFormValue] = useState(initialCompanyFormValue);
  const [createServerError, setCreateServerError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (draft: CompanyDraft) => {
      const created = await companyCrudUseCases.create(app)(draft);
      if (createFormValue.contactIds && createFormValue.contactIds.length > 0) {
        await optimizedApiClient.post(
          companyEndpoints.assignContacts(created.id),
          createFormValue.contactIds
        );
      }
      return created;
    },
    onSuccess: () => {
      setIsCreateMode(false);
      setCreateServerError(null);
      setCreateFormValue(initialCompanyFormValue);
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      toast.showSuccess("Company created successfully!");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Could not create company";
      setCreateServerError(message);
      toast.showError(message);
    },
  });

  const openCreate = () => {
    setCreateFormValue(initialCompanyFormValue);
    setCreateServerError(null);
    setIsCreateMode(true);
  };

  const closeCreateModal = () => {
    if (createMutation.isPending) return;
    setIsCreateMode(false);
    setCreateServerError(null);
    setCreateFormValue(initialCompanyFormValue);
  };

  const handleCreateSubmit = () => {
    const draft = toDraft(createFormValue);
    if (!draft.name) {
      setCreateServerError("Name is required");
      return;
    }
    createMutation.mutate(draft);
  };

  const handleDelete = (id: number) => {
    queryClient.invalidateQueries({ queryKey: companyKeys.all });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
  };

  return (
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col gap-3 bg-theme-dark px-3 py-3 pt-16 sm:gap-4 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-theme-light sm:text-2xl">Companies</h1>
        <p className="text-xs text-gray-400 sm:text-sm">
          Manage companies and contractors in your network.
        </p>
      </header>

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={() => setIsManageServicesOpen(true)}>
          <Icon name="lucide:wrench" className="mr-2" size={16} />
          Manage Services
        </Button>
        <Button variant="primary" onClick={openCreate}>
          <Icon name="lucide:plus" className="mr-2" size={16} />
          New Company
        </Button>
      </div>

      <section className="mt-2 flex flex-1 flex-col">
        {showSkeleton ? (
          <CompaniesTableSkeleton />
        ) : companies && companies.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-4">
            <div className="max-w-md rounded-xl border border-dashed border-theme-gray-subtle bg-theme-dark/80 px-4 py-8 text-center text-sm text-gray-400 sm:rounded-2xl sm:px-6 sm:py-10">
              <Icon name="lucide:building-2" size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-base font-medium text-gray-300">No companies found.</p>
              <p className="mt-2 text-xs sm:text-sm">
                Use the button above to create a new company.
              </p>
            </div>
          </div>
        ) : (
          <CompaniesTable
            companies={companies ?? []}
            isLoading={showSkeleton}
            onEdit={(company) => openEdit(company, (c) => mapCompanyToFormValue(c, contacts ?? []))}
            onDelete={handleDelete}
            services={services}
          />
        )}
      </section>
      <Modal
        isOpen={isCreateMode}
        title="New company"
        onClose={closeCreateModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeCreateModal} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateSubmit}
              loading={createMutation.isPending}
              disabled={!createFormValue.name.trim()}
            >
              Create
            </Button>
          </>
        }
      >
        <CompanyForm
          value={createFormValue}
          onChange={setCreateFormValue}
          disabled={createMutation.isPending}
          services={services}
          contacts={contacts ?? []}
        />
        {createServerError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <Icon name="lucide:alert-circle" size={16} className="text-red-400 mt-0.5" />
            <p className="text-sm text-red-400">{createServerError}</p>
          </div>
        )}
      </Modal>
      <Modal
        isOpen={isEditOpen}
        title="Edit company"
        onClose={closeEditModal}
        footer={
          <>
            <Button variant="secondary" onClick={closeEditModal} disabled={isEditSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleEditSubmit}
              loading={isEditSubmitting}
              disabled={!editFormValue.name.trim()}
            >
              Save changes
            </Button>
          </>
        }
      >
        <CompanyForm
          value={editFormValue}
          onChange={setEditFormValue}
          disabled={isEditSubmitting}
          services={services}
          contacts={contacts ?? []}
        />
        {editServerError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <Icon name="lucide:alert-circle" size={16} className="text-red-400 mt-0.5" />
            <p className="text-sm text-red-400">{editServerError}</p>
          </div>
        )}
      </Modal>

      <ManageServicesModal
        isOpen={isManageServicesOpen}
        onClose={() => setIsManageServicesOpen(false)}
        services={services ?? []}
      />
    </main>
  );
}
