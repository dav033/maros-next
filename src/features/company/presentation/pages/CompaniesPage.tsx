"use client";

import { useCompaniesPageLogic } from "../hooks/useCompaniesPageLogic";
import { CompaniesPageView } from "./CompaniesPageView";

/**
 * Companies Page Container Component.
 * 
 * Architecture:
 * - Container (this file): Manages logic via useCompaniesPageLogic hook
 * - View (CompaniesPageView): Pure presentational component
 * - Logic (useCompaniesPageLogic): All business logic and state management
 * 
 * Manages complex modal interactions:
 * - Company create/edit modals
 * - Services management modal
 * - Nested contact creation modal (within company modal)
 * 
 * Before: ~180 lines with mixed logic and UI + 5 specialized hooks
 * After: ~20 lines container + consolidated hook + pure view
 */
export default function CompaniesPage() {
  const logic = useCompaniesPageLogic();
  
  return <CompaniesPageView logic={logic} />;
}
