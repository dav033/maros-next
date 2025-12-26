import { Suspense } from "react";
import { ProjectsPage } from "@/features/project/presentation";
import { loadProjectsData } from "@/features/project/presentation/data/loadProjectsData";
import { ProjectsPageSkeleton } from "@/features/project/presentation/components/ProjectsPageSkeleton";

async function ProjectsPageWithData() {
  const initialData = await loadProjectsData();
  return <ProjectsPage initialData={initialData} />;
}

export default function ProjectsPageRoute() {
  return (
    <Suspense fallback={<ProjectsPageSkeleton />}>
      <ProjectsPageWithData />
    </Suspense>
  );
}



