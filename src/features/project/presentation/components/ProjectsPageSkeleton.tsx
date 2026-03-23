import { ProjectsTableSkeleton } from "../organisms/ProjectsTableSkeleton";
import { EntityCrudPageTemplate } from "@/components/shared";

export function ProjectsPageSkeleton() {
  return (
    <EntityCrudPageTemplate
      header={
        <header className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Projects</h1>
            <p className="text-xs text-muted-foreground sm:text-sm">Manage projects and track progress.</p>
        </header>
      }
      toolbar={null}
      isLoading={true}
      loadingContent={<ProjectsTableSkeleton />}
      tableContent={null}
      modals={null}
    />
  );
}



