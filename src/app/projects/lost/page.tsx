import { Suspense } from "react";
import { ProjectsLostPageClient } from "./ProjectsLostPageClient";
import { ProjectsTableSkeleton } from "@/features/project/presentation/organisms/ProjectsTableSkeleton";

export default function ProjectsLostPage() {
  return (
    <Suspense fallback={<ProjectsTableSkeleton />}>
      <ProjectsLostPageClient />
    </Suspense>
  );
}
