"use client";

import { HeartHandshake, RefreshCw } from "lucide-react";
import { PageHeaderCard } from "@/components/shared";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstantCustomers } from "../../application/hooks/useInstantCustomers";
import { useCompanyServices } from "@/features/company/presentation/hooks";
import { CustomerContactsSection } from "../components/CustomerContactsSection";
import { CustomerCompaniesSection } from "../components/CustomerCompaniesSection";

import type { CustomersPageData } from "../data/loadCustomersData";

export interface CustomersPageProps {
  initialData?: CustomersPageData;
}

export function CustomersPage({ initialData }: CustomersPageProps = {}) {
  const {
    contacts,
    companies,
    showSkeleton,
    hasData,
    error,
    isFetching,
    refetch,
  } = useInstantCustomers(initialData);
  const { services } = useCompanyServices();

  const safeContacts = contacts ?? [];
  const safeCompanies = companies ?? [];
  const safeServices = services ?? [];

  return (
    <div className="flex w-full flex-1 flex-col gap-3 sm:gap-4">
      <PageHeaderCard
        icon={HeartHandshake}
        title="Customers"
        description="View and manage all customers (contacts and companies)"
        metaSlot={
          showSkeleton ? (
            <>
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-32 rounded-full" />
            </>
          ) : error && !hasData ? undefined : (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {safeContacts.length} contacts
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-elev-4 px-2.5 py-1 font-medium text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                {safeCompanies.length} companies
              </span>
            </>
          )
        }
      />

      <div className="mt-2 space-y-4">
        {error ? (
          <Alert variant="destructive" className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <AlertTitle>
                {hasData ? "No se pudieron actualizar los clientes" : "No se pudieron cargar los clientes"}
              </AlertTitle>
              <AlertDescription>
                {hasData
                  ? "Se conservan los datos cargados anteriormente. Puedes volver a intentarlo."
                  : "Comprueba tu conexión y vuelve a intentarlo."}
              </AlertDescription>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0 border-destructive/50 text-foreground hover:bg-destructive/10"
              disabled={isFetching}
              onClick={() => void refetch()}
            >
              <RefreshCw className={isFetching ? "animate-spin" : undefined} />
              {isFetching ? "Reintentando…" : "Reintentar"}
            </Button>
          </Alert>
        ) : null}

        {error && !hasData ? null : (
          <section className="flex flex-col gap-6">
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
        )}
      </div>
    </div>
  );
}
