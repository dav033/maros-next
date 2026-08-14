import { createServerApiClient } from "@/shared/infra/http";
import { headers } from "next/headers";
import { LeadHttpRepository, makeLeadsAppContext, LeadNumberAvailabilityHttpService } from "@/leads";
import { listLeadsByType } from "@/leads/application";
import { ContactHttpRepository, makeContactsAppContext } from "@/contact";
import { listContacts } from "@/contact/application";
import { ProjectTypeHttpRepository } from "@/projectType";
import type { ProjectTypesAppContext } from "@/projectType";
import { listProjectTypes } from "@/projectType/application";
import { SystemClock } from "@/shared/domain";
import type { Lead, LeadType } from "@/leads/domain";
import type { Contact } from "@/contact/domain";
import type { ProjectType } from "@/projectType/domain";

export interface LeadsPageData {
  leads: Lead[];
  contacts: Contact[];
  projectTypes: ProjectType[];
}

export async function loadLeadsData(leadType: LeadType): Promise<LeadsPageData> {
  const apiClient = createServerApiClient(await headers());
  const leadsCtx = makeLeadsAppContext({
    clock: SystemClock,
    repos: {
      lead: new LeadHttpRepository(apiClient),
      contact: new ContactHttpRepository(apiClient),
      projectType: new ProjectTypeHttpRepository(apiClient),
    },
    services: {
      leadNumberAvailability: new LeadNumberAvailabilityHttpService(apiClient),
    },
  });

  const contactsCtx = makeContactsAppContext({
    repos: {
      contact: new ContactHttpRepository(apiClient),
    },
  });

  const projectTypesCtx: ProjectTypesAppContext = {
    repos: {
      projectType: new ProjectTypeHttpRepository(apiClient),
    },
  };

  const [leads, contacts, projectTypes] = await Promise.all([
    listLeadsByType(leadsCtx, leadType).catch(() => []),
    listContacts(contactsCtx).catch(() => []),
    listProjectTypes(projectTypesCtx).catch(() => []),
  ]);

  return {
    leads: leads ?? [],
    contacts: contacts ?? [],
    projectTypes: projectTypes ?? [],
  };
}
