import { Suspense } from "react";
import { ProjectsCompletedPageClient } from "./ProjectsCompletedPageClient";
import { ProjectsTableSkeleton } from "@/features/project/presentation/organisms/ProjectsTableSkeleton";

export default function ProjectsCompletedPage() {
  return (
    <Suspense fallback={<ProjectsTableSkeleton />}>
      <ProjectsCompletedPageClient />
    </Suspense>
  );
}
