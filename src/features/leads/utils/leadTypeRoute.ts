import { LeadType } from "@/leads/domain";

export const LEAD_TYPE_ROUTE_SEGMENTS = {
  [LeadType.CONSTRUCTION]: "construction",
  [LeadType.ROOFING]: "roofing",
  [LeadType.PLUMBING]: "plumbing",
} as const;

const ROUTE_SEGMENT_TO_LEAD_TYPE: Record<string, LeadType> = {
  construction: LeadType.CONSTRUCTION,
  roofing: LeadType.ROOFING,
  plumbing: LeadType.PLUMBING,
};

export function leadTypeFromRouteSegment(segment: string): LeadType | null {
  if (!segment) return null;
  return ROUTE_SEGMENT_TO_LEAD_TYPE[segment.toLowerCase()] ?? null;
}

export function leadTypeToRouteSegment(leadType: LeadType): string {
  return LEAD_TYPE_ROUTE_SEGMENTS[leadType];
}
