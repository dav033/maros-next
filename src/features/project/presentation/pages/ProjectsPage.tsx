"use client";

import { useProjectsPageLogic } from "./useProjectsPageLogic";
import { ProjectsPageView } from "./ProjectsPageView";
import type { ProjectsPageData } from "../data/loadProjectsData";

export interface ProjectsPageProps {
  initialData?: ProjectsPageData;
}

export default function ProjectsPage({ initialData }: ProjectsPageProps = {}) {
  const logic = useProjectsPageLogic(initialData);

  return <ProjectsPageView logic={logic} />;
}

