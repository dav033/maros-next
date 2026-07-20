"use client";

import { CheckCircle2 } from "lucide-react";
import { ProjectProgressStatus } from "@/project/domain";
import {
  ProjectsByStatusPageView,
  useProjectsByStatusPageLogic,
} from "@/features/project/presentation/pages";

export function ProjectsCompletedPageClient() {
  const logic = useProjectsByStatusPageLogic(ProjectProgressStatus.COMPLETED);

  return (
    <ProjectsByStatusPageView
      logic={logic}
      icon={CheckCircle2}
      title="Completed Projects"
      description="All completed projects across every category, grouped by type."
    />
  );
}
