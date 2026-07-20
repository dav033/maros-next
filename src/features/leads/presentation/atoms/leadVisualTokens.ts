import { LeadType } from "@/leads/domain";

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

export const LEAD_TYPE_ORDER: LeadType[] = [
  LeadType.CONSTRUCTION,
  LeadType.ROOFING,
  LeadType.PLUMBING,
];
