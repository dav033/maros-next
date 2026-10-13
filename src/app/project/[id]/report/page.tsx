import { parseProjectReport } from "@/project/domain";
import { ProjectQboReportPage } from "@/project/presentation/pages/ProjectQboReportPage";
import { parsePositiveSafeInteger } from "@/shared/utils/parsePositiveSafeInteger";

export default async function ProjectQboReportRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const { report } = await searchParams;
  const projectId = parsePositiveSafeInteger(id);

  if (projectId === null) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="font-display text-lg font-semibold text-destructive mb-2">Invalid project</h2>
          <p className="text-sm text-muted-foreground">
            El identificador de proyecto &quot;{id}&quot; no es válido. Revisa la URL e intenta de
            nuevo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProjectQboReportPage projectId={projectId} initialReport={parseProjectReport(report)} />
  );
}
