import { LeadType } from "../domain/models";

export type LeadTypeConfig = {
  leadType: LeadType;
  title: string;
  description: string;
  emptyIconName: string;
  emptyTitle: string;
  emptySubtitle: string;
  createModalTitle: string;
};

export const LEAD_TYPE_CONFIGS: Record<LeadType, LeadTypeConfig> = {
  [LeadType.CONSTRUCTION]: {
    leadType: LeadType.CONSTRUCTION,
    title: "Construction Leads",
    description: "Manage construction leads and opportunities.",
    emptyIconName: "mdi:tools",
    emptyTitle: "No construction leads found.",
    emptySubtitle: "No leads available yet.",
    createModalTitle: "Create Construction Lead",
  },
  [LeadType.PLUMBING]: {
    leadType: LeadType.PLUMBING,
    title: "Plumbing Leads",
    description: "Manage plumbing leads and opportunities.",
    emptyIconName: "mdi:pipe-wrench",
    emptyTitle: "No plumbing leads found.",
    emptySubtitle: "No leads available yet.",
    createModalTitle: "Create Plumbing Lead",
  },
  [LeadType.ROOFING]: {
    leadType: LeadType.ROOFING,
    title: "Roofing Leads",
    description: "Manage roofing leads and opportunities.",
    emptyIconName: "mdi:home-roof",
    emptyTitle: "No roofing leads found.",
    emptySubtitle: "No leads available yet.",
    createModalTitle: "Create Roofing Lead",
  },
};
