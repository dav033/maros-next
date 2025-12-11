"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import type { ContactsAppContext } from "@/contact";
import type { LeadsAppContext } from "@/leads";
import type { ProjectTypesAppContext } from "@/projectType";
import type { CompanyAppContext } from "@/company";
import type { ReportsAppContext } from "@/reports";
import type { ProjectsAppContext } from "@/project";
import {
  createContactsAppContext,
  createLeadsAppContext,
  createProjectTypesAppContext,
  createCompanyAppContext,
  createReportsAppContext,
  createProjectsAppContext,
} from "./factories";

type DiContextValue = {
  contactsApp: ContactsAppContext;
  leadsApp: LeadsAppContext;
  projectTypesApp: ProjectTypesAppContext;
  companyApp: CompanyAppContext;
  reportsApp: ReportsAppContext;
  projectsApp: ProjectsAppContext;
};

const DiContext = createContext<DiContextValue | null>(null);

type Props = {
  children: ReactNode;
};


export function DiProvider({ children }: Props) {
  const value = useMemo(() => ({
    contactsApp: createContactsAppContext(),
    leadsApp: createLeadsAppContext(),
    projectTypesApp: createProjectTypesAppContext(),
    companyApp: createCompanyAppContext(),
    reportsApp: createReportsAppContext(),
    projectsApp: createProjectsAppContext(),
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

export function useReportsApp(): ReportsAppContext {
  const context = useContext(DiContext);
  if (!context) {
    throw new Error("useReportsApp must be used within DiProvider");
  }
  return context.reportsApp;
}

export function useProjectsApp(): ProjectsAppContext {
  const context = useContext(DiContext);
  if (!context) {
    throw new Error("useProjectsApp must be used within DiProvider");
  }
  return context.projectsApp;
}
