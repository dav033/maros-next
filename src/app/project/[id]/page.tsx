import { Suspense } from "react";
import { ProjectDetailsPage } from "@/project/presentation/pages/ProjectDetailsPage";
import { ProjectDetailsPageSkeleton } from "@/features/project/presentation/components/ProjectDetailsPageSkeleton";
import { loadProjectDetailsData } from "@/features/project/presentation/data/loadProjectDetailsData";

async function ProjectDetailsPageWithData({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const idString = resolvedParams.id;
  
  if (!idString) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Invalid Project ID</h2>
          <p className="text-sm text-muted-foreground">
            No project ID provided. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  const projectId = parseInt(idString, 10);
  
  if (isNaN(projectId) || projectId <= 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Invalid Project ID</h2>
          <p className="text-sm text-muted-foreground">
            The project ID "{idString}" is not valid. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }
  
  const initialData = await loadProjectDetailsData(projectId);
  return <ProjectDetailsPage projectId={projectId} initialData={initialData} />;
}

export default async function ProjectDetailsRoutePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  return (
    <Suspense fallback={<ProjectDetailsPageSkeleton />}>
      <ProjectDetailsPageWithData params={params} />
    </Suspense>
  );
}
