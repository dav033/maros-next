import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProjectsPage } from "@/features/project/presentation";
import { loadProjectsData } from "@/features/project/presentation/data/loadProjectsData";
import { ProjectsPageSkeleton } from "@/features/project/presentation/components/ProjectsPageSkeleton";
import {
  leadTypeFromRouteSegment,
  LEAD_TYPE_ROUTE_SEGMENTS,
} from "@/features/leads/utils/leadTypeRoute";

interface ProjectsByTypePageProps {
  params: Promise<{ leadType: string }>;
}

export async function generateStaticParams() {
  return Object.values(LEAD_TYPE_ROUTE_SEGMENTS).map((leadType) => ({
    leadType,
  }));
}

async function ProjectsPageWithData({ leadType }: { leadType: NonNullable<ReturnType<typeof leadTypeFromRouteSegment>> }) {
  const initialData = await loadProjectsData();
  return <ProjectsPage initialData={initialData} leadType={leadType} />;
}

export default async function ProjectsByTypePage({
  params,
}: ProjectsByTypePageProps) {
  const { leadType: leadTypeSegment } = await params;
  const leadType = leadTypeFromRouteSegment(leadTypeSegment);

  if (!leadType) {
    notFound();
  }

  return (
    <Suspense fallback={<ProjectsPageSkeleton />}>
      <ProjectsPageWithData leadType={leadType} />
    </Suspense>
  );
}
