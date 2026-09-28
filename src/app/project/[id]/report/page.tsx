import { ProjectQboReportPage } from "@/project/presentation/pages/ProjectQboReportPage";

export default async function ProjectQboReportRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const projectId = Number.parseInt(id, 10);

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Proyecto inválido</h2>
          <p className="text-sm text-muted-foreground">
            El identificador de proyecto &quot;{id}&quot; no es válido. Revisa la URL e intenta de
            nuevo.
          </p>
        </div>
      </div>
    );
  }

  return <ProjectQboReportPage projectId={projectId} />;
}
