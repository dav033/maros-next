import { ProjectsTableSkeleton } from "../organisms/ProjectsTableSkeleton";
import { EntityCrudPageTemplate, SimplePageHeader } from "@dav033/dav-components";

export function ProjectsPageSkeleton() {
  return (
    <EntityCrudPageTemplate
      header={
        <SimplePageHeader
          title="Projects"
          description="Manage projects and track progress."
        />
      }
      toolbar={null}
      isLoading={true}
      loadingContent={<ProjectsTableSkeleton />}
      tableContent={null}
      modals={null}
    />
  );
}



