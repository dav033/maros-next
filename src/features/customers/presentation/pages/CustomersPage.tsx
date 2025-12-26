"use client";

import { useInstantCustomers } from "../../application/hooks/useInstantCustomers";
import { useCompanyServices } from "@/features/company/presentation/hooks";
import { CustomerContactsSection } from "../components/CustomerContactsSection";
import { CustomerCompaniesSection } from "../components/CustomerCompaniesSection";
import { SimplePageHeader } from "@dav033/dav-components";
import type { CustomersPageData } from "../data/loadCustomersData";

export interface CustomersPageProps {
  initialData?: CustomersPageData;
}

export function CustomersPage({ initialData }: CustomersPageProps = {}) {
  const { contacts, companies, showSkeleton } = useInstantCustomers(initialData);
  const { services } = useCompanyServices();

 
  const safeContacts = contacts ?? [];
  const safeCompanies = companies ?? [];
  const safeServices = services ?? [];

  return (
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col gap-6 bg-theme-dark px-3 py-3 pt-16 sm:gap-6 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6">
      <SimplePageHeader
        title="Customers"
        description="View and manage all customers (contacts and companies)."
      />

      <div className="flex flex-col gap-6">
        <CustomerContactsSection
          contacts={safeContacts}
          companies={safeCompanies}
          isLoading={showSkeleton}
        />
        <CustomerCompaniesSection
          companies={safeCompanies}
          contacts={safeContacts}
          services={safeServices}
          isLoading={showSkeleton}
        />
      </div>
    </main>
  );
}
