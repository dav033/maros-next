"use client";

import React from "react";
import type { Contact } from "@/contact/domain";
import type { Company } from "@/company/domain";
import { CompaniesTable } from "@/features/company/presentation/organisms/CompaniesTable";
import { CompaniesTableSkeleton } from "@/features/company/presentation/organisms/CompaniesTableSkeleton";
import { CompanyForm } from "@/features/company/presentation/molecules/CompanyForm";
import { CustomerCrudModal } from "./CustomerCrudModal";
import { useCompanyCustomers } from "../../application/hooks/useCompanyCustomers";
import { TableToolbar, useTableWithSearch, DeleteFeedbackModal } from "@dav033/dav-components";

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
  const [deleteTargetId, setDeleteTargetId] = React.useState<number | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const { modal, handlers } = useCompanyCustomers({ contacts });
  const safeCompanies = companies ?? [];
  const safeServices = services ?? [];

  const {
    filteredData,
    searchQuery,
    searchField,
    setSearchQuery,
    setSearchField,
    totalCount,
    filteredCount,
  } = useTableWithSearch<Company>({
    data: safeCompanies,
    searchableFields: ["name", "address", "type", "serviceId"],
    customSearchFn: (company, term, field) => {
      const lower = term.toLowerCase();
      if (field === "all") {
        const serviceName =
          safeServices.find((s) => s.id === company.serviceId)?.name?.toLowerCase() ??
          "";
        return (
          company.name?.toLowerCase().includes(lower) ||
          company.address?.toLowerCase().includes(lower) ||
          company.type?.toLowerCase().includes(lower) ||
          serviceName.includes(lower)
        );
      }
      if (field === "serviceId") {
        const serviceName =
          safeServices.find((s) => s.id === company.serviceId)?.name?.toLowerCase() ??
          "";
        return serviceName.includes(lower);
      }
      const value = (company as any)[field];
      return typeof value === "string"
        ? value.toLowerCase().includes(lower)
        : false;
    },
  });

  return (
    <>
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-theme-light">Company Customers</h2>
          <span />
        </div>
        <TableToolbar
          search={{
            searchTerm: searchQuery,
            onSearchChange: setSearchQuery,
            selectedField: searchField,
            onFieldChange: setSearchField,
            searchFields: [
              { value: "all", label: "All fields" },
              { value: "name", label: "Name" },
              { value: "address", label: "Address" },
              { value: "type", label: "Type" },
              { value: "service", label: "Service" },
            ],
            placeholder: "Search companies...",
            resultCount: filteredCount,
            totalCount,
          }}
        />
        {isLoading ? (
          <CompaniesTableSkeleton />
        ) : (
          <CompaniesTable
            companies={filteredData}
            services={services}
            isLoading={false}
            getContextMenuItems={(company) => [
              {
                label: "Edit",
                icon: "lucide:edit",
                onClick: () => handlers.handleEditCompany(company),
              },
              {
                label: "Delete",
                icon: "lucide:trash",
                variant: "danger",
                onClick: () => setDeleteTargetId(company.id),
              },
            ]}
          />
        )}
      </section>
      <DeleteFeedbackModal
        isOpen={deleteTargetId !== null}
        title="Delete Company"
        description={
          <>
            Are you sure you want to delete this company?
            <br />
            This action cannot be undone.
          </>
        }
        loading={isDeleting}
        onClose={() => {
          if (isDeleting) return;
          setDeleteTargetId(null);
        }}
        onConfirm={async () => {
          if (!deleteTargetId) return;
          setIsDeleting(true);
          await handlers.handleDeleteCompany(deleteTargetId);
          setIsDeleting(false);
          setDeleteTargetId(null);
        }}
      />
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
