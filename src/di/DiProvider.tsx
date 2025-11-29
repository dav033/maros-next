"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import type { ContactsAppContext } from "@/contact";
import { makeContactsAppContext, ContactHttpRepository } from "@/contact";
import type { LeadsAppContext } from "@/leads";
import { makeLeadsAppContext, LeadHttpRepository, LeadNumberAvailabilityHttpService, patchLead } from "@/leads";
import type { LeadPatch, LeadPolicies } from "@/features/leads/domain/models";
import type { ProjectTypesAppContext } from "@/projectType";
import { ProjectTypeHttpRepository } from "@/projectType";
import type { CompanyAppContext } from "@/company";
import { makeCompanyAppContext, CompanyHttpRepository, CompanyServiceHttpRepository } from "@/company";
import { SystemClock } from "@/shared";

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

export function DiProvider({ children }: Props) {
  const value = useMemo(() => {
    const contactHttpRepo = new ContactHttpRepository();
    const projectTypeRepo = new ProjectTypeHttpRepository();
    
    const contactsApp = makeContactsAppContext({
      repos: {
        contact: contactHttpRepo,
      },
    });

    const leadsApp = makeLeadsAppContext({
      clock: SystemClock,
      repos: {
        contact: contactHttpRepo,
        lead: new LeadHttpRepository(),
        projectType: projectTypeRepo,
      },
      services: {
        leadNumberAvailability: new LeadNumberAvailabilityHttpService(),
      },
    }) as LeadsAppContext & { patchLead: typeof patchLead };
    (leadsApp as any).patchLead = (id: number, patch: LeadPatch, policies?: LeadPolicies) => patchLead(leadsApp, id, patch, policies);

    const projectTypesApp: ProjectTypesAppContext = {
      repos: {
        projectType: projectTypeRepo,
      },
    };

    const companyApp = makeCompanyAppContext({
      repos: {
        company: new CompanyHttpRepository(),
        companyService: new CompanyServiceHttpRepository(),
      },
    });

    return {
      contactsApp,
      leadsApp,
      projectTypesApp,
      companyApp,
    };
  }, []);

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
