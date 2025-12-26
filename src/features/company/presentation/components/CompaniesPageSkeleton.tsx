import { CompaniesTableSkeleton } from "../organisms/CompaniesTableSkeleton";
import { EntityCrudPageTemplate, SimplePageHeader } from "@dav033/dav-components";

export function CompaniesPageSkeleton() {
  return (
    <EntityCrudPageTemplate
      header={
        <SimplePageHeader
          title="Companies"
          description="Manage companies and services."
        />
      }
      toolbar={null}
      isLoading={true}
      loadingContent={<CompaniesTableSkeleton />}
      tableContent={null}
      modals={null}
    />
  );
}

