import { CompaniesTableSkeleton } from "../organisms/CompaniesTableSkeleton";
import { EntityCrudPageTemplate } from "@/components/shared";

export function CompaniesPageSkeleton() {
  return (
    <EntityCrudPageTemplate
      header={
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Companies</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Manage companies and services.</p>
        </header>
      }
      toolbar={null}
      isLoading={true}
      loadingContent={<CompaniesTableSkeleton />}
      tableContent={null}
      modals={null}
    />
  );
}

