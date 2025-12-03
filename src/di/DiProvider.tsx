"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import type { ContactsAppContext } from "@/contact";
import type { LeadsAppContext } from "@/leads";
import type { ProjectTypesAppContext } from "@/projectType";
import type { CompanyAppContext } from "@/company";
import {
  createContactsAppContext,
  createLeadsAppContext,
  createProjectTypesAppContext,
  createCompanyAppContext,
} from "./factories";

type DiContextValue = {
  contactsApp: ContactsAppContext;
  leadsApp: LeadsAppContext;
  projectTypesApp: ProjectTypesAppContext;
  companyApp: CompanyAppContext;
};

const DiContext = createContext<DiContextValue | null>(null);

type Props = {
  children: ReactNode;
};

/**
 * Dependency Injection Provider for the application.
 * 
 * Initializes and provides all feature contexts through modular factories.
 * Each factory encapsulates the creation of its own dependencies.
 * 
 * @see ./factories for individual context creation logic
 */
export function DiProvider({ children }: Props) {
  const value = useMemo(() => ({
    contactsApp: createContactsAppContext(),
    leadsApp: createLeadsAppContext(),
    projectTypesApp: createProjectTypesAppContext(),
    companyApp: createCompanyAppContext(),
  }), []);

  return <DiContext.Provider value={value}>{children}</DiContext.Provider>;
}

export function useContactsApp(): ContactsAppContext {
  const context = useContext(DiContext);
  if (!context) {
    throw new Error("useContactsApp must be used within DiProvider");
  }
  return context.contactsApp;
}

export function useLeadsApp(): LeadsAppContext {
  const context = useContext(DiContext);
  if (!context) {
    throw new Error("useLeadsApp must be used within DiProvider");
  }
  return context.leadsApp;
}

export function useProjectTypesApp(): ProjectTypesAppContext {
  const context = useContext(DiContext);
  if (!context) {
    throw new Error("useProjectTypesApp must be used within DiProvider");
  }
  return context.projectTypesApp;
}

export function useCompanyApp(): CompanyAppContext {
  const context = useContext(DiContext);
  if (!context) {
    throw new Error("useCompanyApp must be used within DiProvider");
  }
  return context.companyApp;
}
