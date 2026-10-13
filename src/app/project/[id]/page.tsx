import { ProjectDetailsRoute } from "@/features/project/presentation/pages/ProjectDetailsRoute";
import { parsePositiveSafeInteger } from "@/shared/utils/parsePositiveSafeInteger";

export default async function ProjectDetailsRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = parsePositiveSafeInteger(id);

  if (projectId === null) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="mb-2 font-display text-lg font-semibold text-destructive">
            Invalid Project ID
          </h2>
          <p className="text-sm text-muted-foreground">
            The project ID “{id}” is not valid. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }

  return <ProjectDetailsRoute projectId={projectId} />;
}
