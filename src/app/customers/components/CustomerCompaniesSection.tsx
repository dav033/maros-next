"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Contact } from "@/contact";
import type { Company, CompanyPatch } from "@/company";
import { CompaniesTable } from "@/features/company/presentation/components/CompaniesTable";
import { CompaniesTableSkeleton } from "@/features/company/presentation/components/CompaniesTableSkeleton";
import { CompanyForm } from "@/features/company/presentation/components/CompanyForm";
import { useCompanyApp } from "@/di";
import { companyKeys, companyCrudUseCases } from "@/company";
import { contactsKeys } from "@/contact";
import { companyEndpoints } from "@/features/company/infra/http/endpoints";
import { useToast, Button, Modal } from "@/shared/ui";
import { useEntityForm, optimizedApiClient } from "@/shared";
import { customersKeys } from "../keys";
import { initialCompanyFormValue, toCompanyPatch, mapCompanyToFormValue } from "../helpers/companyHelpers";

export interface CustomerCompaniesSectionProps {
  companies: Company[];
  contacts: Contact[];
  services: Array<{ id: number; name: string; color?: string | null }>;
  isLoading: boolean;
}

export function CustomerCompaniesSection({
  companies,
  contacts,
  services,
  isLoading,
}: CustomerCompaniesSectionProps) {
  const companyApp = useCompanyApp();
  const queryClient = useQueryClient();
  const toast = useToast();

  const {
    isOpen,
    openEdit,
    closeModal,
    formValue,
    setFormValue,
    currentEntity: currentCompany,
    serverError,
    setServerError,
    handleSubmit: baseHandleSubmit,
    isSubmitting,
  } = useEntityForm({
    initialFormValue: initialCompanyFormValue,
    toPatch: toCompanyPatch,
    updateFn: (id, patch) => companyCrudUseCases.update(companyApp)(id, patch),
    invalidateKeys: [customersKeys.all, companyKeys.all],
    successMessage: "Company updated successfully!",
    errorMessage: "Could not update company",
  });

  const handleDeleteCompany = async (companyId: number) => {
    try {
      await companyCrudUseCases.delete(companyApp)(companyId);
      toast.showSuccess("Company deleted successfully!");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Could not delete company";
      toast.showError(message);
    }
  };

  const handleCompanySubmit = async () => {
    if (!currentCompany) {
      return;
    }
    
    const patch = toCompanyPatch(currentCompany, formValue);
    const hasChanges = Object.keys(patch).length > 0;
    const hasContactChanges = formValue.contactIds !== undefined;
    
    if (!hasChanges && !hasContactChanges) {
      setServerError("No changes detected");
      return;
    }
    
    if (hasChanges) {
      baseHandleSubmit();
    }
    
    if (hasContactChanges) {
      try {
        await optimizedApiClient.post(
          companyEndpoints.assignContacts(currentCompany.id),
          formValue.contactIds || []
        );
        queryClient.invalidateQueries({ queryKey: customersKeys.all });
        queryClient.invalidateQueries({ queryKey: contactsKeys.lists() });
        
        if (!hasChanges) {
          closeModal();
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Could not assign contacts";
        setServerError(message);
        toast.showError(message);
      }
    }
  };

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-theme-light">Company Customers</h2>
          <span className="text-sm text-gray-400">
            {companies?.length ?? 0} {companies?.length === 1 ? "company" : "companies"}
          </span>
        </div>
        {isLoading ? (
          <CompaniesTableSkeleton />
        ) : (
          <CompaniesTable
            companies={companies ?? []}
            services={services}
            isLoading={false}
            onEdit={(company) => openEdit(company, (c) => mapCompanyToFormValue(c, contacts))}
            onDelete={handleDeleteCompany}
          />
        )}
      </section>
      <Modal
        isOpen={isOpen}
        title="Edit Company"
        onClose={closeModal}
        footer={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={closeModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCompanySubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        }
      >
        {serverError && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {serverError}
          </div>
        )}
        <CompanyForm
          value={formValue}
          onChange={setFormValue}
          disabled={isSubmitting}
          services={services}
          contacts={contacts}
        />
      </Modal>
    </>
  );
}
