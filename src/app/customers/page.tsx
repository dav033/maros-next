"use client";

import { useInstantCustomers } from "./hooks/useInstantCustomers";
import { useCompanyServices } from "@/features/company/presentation/hooks/useCompanyServices";
import { CustomerContactsSection } from "./components/CustomerContactsSection";
import { CustomerCompaniesSection } from "./components/CustomerCompaniesSection";

export default function CustomersPage() {
  const { contacts, companies, showSkeleton } = useInstantCustomers();
  const { services } = useCompanyServices();

  return (
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col gap-6 bg-theme-dark px-3 py-3 pt-16 sm:gap-6 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-theme-light sm:text-2xl">Customers</h1>
        <p className="text-xs text-gray-400 sm:text-sm">
          View and manage all customers (contacts and companies).
        </p>
      </header>

      <div className="flex flex-col gap-6">
        <CustomerContactsSection
          contacts={contacts ?? []}
          companies={companies ?? []}
          isLoading={showSkeleton}
        />
        <CustomerCompaniesSection
          companies={companies ?? []}
          contacts={contacts ?? []}
          services={services ?? []}
          isLoading={showSkeleton}
        />
      </div>
    </main>
  );
}
