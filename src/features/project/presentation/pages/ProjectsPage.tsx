"use client";

import { useProjectsPageLogic } from "./useProjectsPageLogic";
import { ProjectsPageView } from "./ProjectsPageView";

export default function ProjectsPage() {
  const logic = useProjectsPageLogic();

  return <ProjectsPageView logic={logic} />;
}



