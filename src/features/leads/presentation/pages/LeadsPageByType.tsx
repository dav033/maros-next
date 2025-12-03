"use client";

import type { LeadType } from "@/leads";
import { useLeadsPageLogic } from "./useLeadsPageLogic";
import { LeadsPageView } from "./LeadsPageView";

export type LeadsPageByTypeProps = {
  leadType: LeadType;
};

/**
 * Leads Page Container Component (by type).
 * 
 * Architecture:
 * - Container (this file): Manages logic via useLeadsPageLogic hook
 * - View (LeadsPageView): Pure presentational component
 * - Logic (useLeadsPageLogic): All business logic and state management
 * 
 * This component is dynamically configured based on leadType:
 * - ROOFING
 * - PLUMBING
 * - CONSTRUCTION
 * 
 * Each type has its own configuration, icons, and labels.
 * 
 * Before: ~165 lines with mixed logic and UI
 * After: ~25 lines container + specialized hook + pure view
 */
export function LeadsPageByType({ leadType }: LeadsPageByTypeProps) {
  const logic = useLeadsPageLogic({ leadType });

  return (
    <LeadsPageView
      logic={logic}
      onDelete={async () => {
        // Refetch is handled internally by the logic hook
        // This is a placeholder for any additional delete logic
      }}
    />
  );
}
