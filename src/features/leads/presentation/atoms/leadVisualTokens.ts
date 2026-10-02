import { LeadType, type LeadLostReason, type LeadSource } from "@/leads/domain";

// Colores desde tokens CSS compartidos (--badge-*), no hex crudo: ver globals.css.
export const LEAD_STATUS_COLORS: Record<string, string> = {
  NEW_LEAD: "hsl(var(--badge-neutral))",
  CONTACTED: "hsl(var(--badge-blue))",
  ESTIMATING_PREPARING_PROPOSAL: "hsl(var(--badge-indigo))",
  PROPOSAL_SENT: "hsl(var(--badge-amber))",
  FOLLOW_UP: "hsl(var(--badge-orange))",
  WON: "hsl(var(--badge-green))",
  LOST: "hsl(var(--badge-neutral))",
};

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  [LeadType.CONSTRUCTION]: "Construction",
  [LeadType.PLUMBING]: "Plumbing",
  [LeadType.ROOFING]: "Roofing",
};

export const LEAD_TYPE_COLORS: Record<LeadType, string> = {
  [LeadType.CONSTRUCTION]: "hsl(var(--badge-amber))",
  [LeadType.PLUMBING]: "hsl(var(--badge-blue))",
  [LeadType.ROOFING]: "hsl(var(--badge-red))",
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  referral: "Referral",
  repeat_client: "Repeat client",
  website: "Website",
  google: "Google",
  social: "Social media",
  walk_in: "Walk-in",
  partner: "Partner",
  other: "Other",
};

export const LEAD_LOST_REASON_LABELS: Record<LeadLostReason, string> = {
  price: "Price",
  timeline: "Timeline",
  scope: "Scope",
  no_response: "No response",
  competitor: "Competitor",
  client_cancelled: "Client cancelled",
  not_qualified: "Not qualified",
  other: "Other",
};

export const LEAD_TYPE_ORDER: LeadType[] = [
  LeadType.CONSTRUCTION,
  LeadType.ROOFING,
  LeadType.PLUMBING,
];
