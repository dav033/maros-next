import { notFound } from "next/navigation";
import { LeadsPageByType } from "@/features/leads/presentation/pages/LeadsPageByType";
import { loadLeadsData } from "@/features/leads/presentation/data/loadLeadsData";
import {
  leadTypeFromRouteSegment,
  LEAD_TYPE_ROUTE_SEGMENTS,
} from "@/features/leads/utils/leadTypeRoute";

interface LeadsByTypePageProps {
  params: Promise<{ leadType: string }>;
}

export async function generateStaticParams() {
  return Object.values(LEAD_TYPE_ROUTE_SEGMENTS).map((leadType) => ({
    leadType,
  }));
}

export default async function LeadsByTypePage({ params }: LeadsByTypePageProps) {
  const { leadType: leadTypeSegment } = await params;
  const leadType = leadTypeFromRouteSegment(leadTypeSegment);

  if (!leadType) {
    notFound();
  }

  const initialData = await loadLeadsData(leadType);

  return <LeadsPageByType leadType={leadType} initialData={initialData} />;
}
