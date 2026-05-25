"use client";

import { HeartHandshake } from "lucide-react";
import { PageHeaderCard } from "@/components/shared";
import { useInstantCustomers } from "../../application/hooks/useInstantCustomers";
import { useCompanyServices } from "@/features/company/presentation/hooks";
import { CustomerContactsSection } from "../components/CustomerContactsSection";
import { CustomerCompaniesSection } from "../components/CustomerCompaniesSection";

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
    <main className="flex min-h-[calc(100vh-80px)] w-full flex-col gap-3 bg-background px-3 py-3 pt-16 sm:gap-4 sm:px-4 sm:py-4 md:px-8 md:py-6 lg:pt-6">
      <PageHeaderCard
        icon={HeartHandshake}
        title="Customers"
        description="View and manage all customers (contacts and companies)"
        metaSlot={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {safeContacts.length} contacts
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/40 px-2.5 py-1 font-medium text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              {safeCompanies.length} companies
            </span>
          </>
        }
      />

      <section className="dashboard-section-enter mt-2 flex flex-col gap-6" style={{ animationDelay: "120ms" }}>
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
      </section>
    </main>
  );
}
