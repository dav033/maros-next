"use client";

import { XCircle } from "lucide-react";
import { ProjectProgressStatus } from "@/project/domain";
import {
  ProjectsByStatusPageView,
  useProjectsByStatusPageLogic,
} from "@/features/project/presentation/pages";

export function ProjectsLostPageClient() {
  const logic = useProjectsByStatusPageLogic(ProjectProgressStatus.LOST);

  return (
    <ProjectsByStatusPageView
      logic={logic}
      icon={XCircle}
      title="Lost Projects"
      description="All lost projects across every category, grouped by type."
    />
  );
}
