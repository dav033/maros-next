"use client";

import { useProjectsPageLogic } from "./useProjectsPageLogic";
import { ProjectsPageView } from "./ProjectsPageView";
import type { ProjectsPageData } from "../data/loadProjectsData";
import { LeadType } from "@/leads/domain";

export interface ProjectsPageProps {
  initialData?: ProjectsPageData;
  leadType: LeadType;
}

export default function ProjectsPage({ initialData, leadType }: ProjectsPageProps) {
  const logic = useProjectsPageLogic({ initialData, leadType });

  return <ProjectsPageView logic={logic} />;
}

