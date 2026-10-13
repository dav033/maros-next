import { notFound } from "next/navigation";
import { ProjectsPage } from "@/features/project/presentation";
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

export default async function ProjectsByTypePage({
  params,
}: ProjectsByTypePageProps) {
  const { leadType: leadTypeSegment } = await params;
  const leadType = leadTypeFromRouteSegment(leadTypeSegment);

  if (!leadType) {
    notFound();
  }

  return <ProjectsPage leadType={leadType} />;
}
