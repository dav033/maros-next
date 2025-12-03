"use client";

import { useContactsPageLogic } from "../hooks/useContactsPageLogic";
import { ContactsPageView } from "./ContactsPageView";

/**
 * Contacts Page Container Component.
 * 
 * Architecture:
 * - Container (this file): Manages logic via useContactsPageLogic hook
 * - View (ContactsPageView): Pure presentational component
 * - Logic (useContactsPageLogic): All business logic and state management
 * 
 * Benefits of this pattern:
 * - Clear separation of concerns
 * - Easier testing (logic and view separately)
 * - Better reusability
 * - Improved maintainability
 * 
 * Before: ~180 lines with mixed logic and UI
 * After: ~20 lines container + specialized hook + pure view
 */
export default function ContactsPage() {
  const logic = useContactsPageLogic();
  
  return <ContactsPageView logic={logic} />;
}
