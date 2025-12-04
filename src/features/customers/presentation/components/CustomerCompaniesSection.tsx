"use client";

import type { Contact } from "@/contact/domain";
import type { Company } from "@/company/domain";
import { CompaniesTable } from "@/features/company/presentation/organisms/CompaniesTable";
import { CompaniesTableSkeleton } from "@/features/company/presentation/organisms/CompaniesTableSkeleton";
import { CompanyForm } from "@/features/company/presentation/molecules/CompanyForm";
import { CustomerCrudModal } from "./CustomerCrudModal";
import { useCompanyCustomers } from "../../application/hooks/useCompanyCustomers";

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
  const { modal, handlers } = useCompanyCustomers({ contacts });
  const safeCompanies = companies ?? [];

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-theme-light">Company Customers</h2>
          <span className="text-sm text-gray-400">
            {safeCompanies.length} {safeCompanies.length === 1 ? "company" : "companies"}
          </span>
        </div>
        {isLoading ? (
          <CompaniesTableSkeleton />
        ) : (
          <CompaniesTable
            companies={safeCompanies}
            services={services}
            isLoading={false}
            onEdit={handlers.handleEditCompany}
            onDelete={handlers.handleDeleteCompany}
          />
        )}
      </section>
      <CustomerCrudModal
        isOpen={modal.isOpen}
        title="Edit Company"
        onClose={modal.closeModal}
        onSubmit={handlers.handleCompanySubmit}
        isSubmitting={modal.isSubmitting}
        serverError={modal.serverError}
      >
        <CompanyForm
          value={modal.formValue}
          onChange={modal.setFormValue}
          disabled={modal.isSubmitting}
          services={services}
          contacts={contacts}
        />
      </CustomerCrudModal>
    </>
  );
}
