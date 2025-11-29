"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Company, CompanyDraft, CompanyPatch, CompanyService, CompanyServiceDraft } from "../domain/models";
import { CompanyType } from "../domain/models";
import { companyKeys, companyCrudUseCases } from "../application";
import { companyServiceCrudUseCases } from "../application/usecases/companyServiceCrud";
import { useCompanyApp } from "@/di";
import { normalizeEmptyToUndefined, pickDefined } from "@/shared";
import { Button, Icon, Modal, useToast } from "@/shared/ui";
import { CompanyForm, type CompanyFormValue } from "./components/CompanyForm";
import { ManageServicesModal } from "./components/ManageServicesModal";
import { CompaniesTable } from "./components/CompaniesTable";
import { CompaniesTableSkeleton } from "./components/CompaniesTableSkeleton";
import { useInstantCompanies } from "./hooks/useInstantCompanies";
import { useCompanyServices } from "./hooks/useCompanyServices";
import { useInstantContacts } from "@/features/contact/presentation/hooks/useInstantContacts";
import { companyEndpoints } from "../infra/http/endpoints";
import { optimizedApiClient } from "@/shared";
import { contactsKeys } from "@/contact";

type Mode = "list" | "create" | "edit" | "manageServices";

const initialFormValue: CompanyFormValue = {
  name: "",
  address: "",
  type: null,
  serviceId: null,
  isCustomer: false,
  isClient: false,
  contactIds: [],
  notes: [],
};

function toDraft(value: CompanyFormValue): CompanyDraft {
  return {
    name: value.name.trim(),
    address: normalizeEmptyToUndefined(value.address),
    type: value.type,
    serviceId: value.serviceId,
    isCustomer: value.isCustomer,
    isClient: value.isClient,
  };
}

function toPatch(current: Company, value: CompanyFormValue): CompanyPatch {
  const trimmedName = value.name.trim();
  const normalizedAddress = normalizeEmptyToUndefined(value.address);
  const currentAddress = normalizeEmptyToUndefined(current.address);

  const patch: Partial<Company> = {};

  if (trimmedName !== current.name) {
    patch.name = trimmedName;
  }
  if (normalizedAddress !== currentAddress) {
    patch.address = normalizedAddress;
  }
  if (value.type !== current.type) {
    patch.type = value.type;
  }
  if (value.serviceId !== current.serviceId) {
    patch.serviceId = value.serviceId;
  }
  if (value.isCustomer !== current.isCustomer) {
    patch.isCustomer = value.isCustomer;
  }
  if (value.isClient !== current.isClient) {
    patch.isClient = value.isClient;
  }

  // Si el formulario tiene notas, inclúyelas en el patch
  if (Array.isArray(value.notes)) {
    patch.notes = value.notes;
  }
  return patch as CompanyPatch;
}

export default function CompaniesPage() {
  const app = useCompanyApp();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { companies, showSkeleton } = useInstantCompanies();
  const { services } = useCompanyServices();
  const { contacts } = useInstantContacts();

  const [mode, setMode] = useState<Mode>("list");
  const [current, setCurrent] = useState<Company | null>(null);
  const [formValue, setFormValue] = useState<CompanyFormValue>(initialFormValue);
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async (draft: CompanyDraft) => {
      const created = await companyCrudUseCases.create(app)(draft);
      // Assign contacts if any were selected
      if (formValue.contactIds && formValue.contactIds.length > 0) {
        await optimizedApiClient.post(
          companyEndpoints.assignContacts(created.id),
          formValue.contactIds
        );
      }
      return created;
    },
    onSuccess: () => {
      setMode("list");
      setServerError(null);
      setFormValue(initialFormValue);
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      toast.showSuccess("Company created successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not create company";
      setServerError(message);
      toast.showError(message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (input: { id: number; patch: CompanyPatch }) => {
      const updated = await companyCrudUseCases.update(app)(input.id, input.patch);
      // Assign contacts if any were selected
      if (formValue.contactIds && formValue.contactIds.length >= 0) {
        await optimizedApiClient.post(
          companyEndpoints.assignContacts(input.id),
          formValue.contactIds || []
        );
      }
      return updated;
    },
    onSuccess: () => {
      setMode("list");
      setCurrent(null);
      setServerError(null);
      setFormValue(initialFormValue);
      queryClient.invalidateQueries({ queryKey: companyKeys.all });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
      toast.showSuccess("Company updated successfully!");
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Could not update company";
      setServerError(message);
      toast.showError(message);
    },
  });

  function openCreate() {
    setFormValue(initialFormValue);
    setCurrent(null);
    setServerError(null);
    setMode("create");
  }

  function openEdit(company: Company) {
    setCurrent(company);
    // Get contact IDs that belong to this company
    const companyContactIds = (contacts ?? [])
      .filter((contact) => contact.companyId === company.id)
      .map((contact) => contact.id);
    
    setFormValue({
      name: company.name,
      address: company.address ?? "",
      type: company.type,
      serviceId: company.serviceId ?? null,
      isCustomer: company.isCustomer,
      isClient: company.isClient,
      contactIds: companyContactIds,
    });
    setServerError(null);
    setMode("edit");
  }

  function openManageServices() {
    setMode("manageServices");
  }

  function closeManageServices() {
    setMode("list");
  }

  function closeModal() {
    if (createMutation.isPending || updateMutation.isPending) {
      return;
    }
    setMode("list");
    setCurrent(null);
    setServerError(null);
    setFormValue(initialFormValue);
  }

  function handleCreateSubmit() {
    const draft = toDraft(formValue);
    if (!draft.name) {
      setServerError("Name is required");
      return;
    }
    createMutation.mutate(draft);
  }

  function handleEditSubmit() {
    if (!current) {
      return;
    }
    const patch = toPatch(current, formValue);
    const hasChanges = Object.keys(patch).length > 0;
    const hasContactChanges = formValue.contactIds !== undefined;
    
    if (!hasChanges && !hasContactChanges) {
      closeModal();
      return;
    }
    
    updateMutation.mutate({ id: current.id, patch });
  }

  function handleFormChange(value: CompanyFormValue) {
    setFormValue(value);
  }

  function handleDelete(id: number) {
    queryClient.invalidateQueries({ queryKey: companyKeys.all });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
  }

  const isModalOpen = mode === "create" || mode === "edit";
  const isManageServicesOpen = mode === "manageServices";

  return (
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col gap-3 bg-theme-dark px-3 py-3 pt-16 sm:gap-4 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-theme-light sm:text-2xl">Companies</h1>
        <p className="text-xs text-gray-400 sm:text-sm">
          Manage companies and contractors in your network.
        </p>
      </header>

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={openManageServices}>
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
            onEdit={openEdit}
            onDelete={handleDelete}
            services={services}
          />
        )}
      </section>

      <Modal
        isOpen={isModalOpen}
        title={mode === "create" ? "New company" : "Edit company"}
        onClose={closeModal}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={closeModal}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={mode === "create" ? handleCreateSubmit : handleEditSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
              disabled={!formValue.name.trim()}
            >
              {mode === "create" ? "Create" : "Save changes"}
            </Button>
          </>
        }
      >
        <CompanyForm
          value={formValue}
          onChange={handleFormChange}
          disabled={createMutation.isPending || updateMutation.isPending}
          services={services}
          contacts={contacts ?? []}
        />
        {serverError && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
            <Icon name="lucide:alert-circle" size={16} className="text-red-400 mt-0.5" />
            <p className="text-sm text-red-400">{serverError}</p>
          </div>
        )}
      </Modal>

      <ManageServicesModal
        isOpen={isManageServicesOpen}
        onClose={closeManageServices}
        services={services ?? []}
      />
    </main>
  );
}
