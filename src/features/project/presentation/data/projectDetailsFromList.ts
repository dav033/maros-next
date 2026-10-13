import type { Project } from "@/project/domain";
import type { ProjectFinancial } from "@/project/domain/models/ProjectFinancial";
import type { ProjectDetails } from "../pages/ProjectDetailsPage";

type ProjectDetailsFromListOptions = {
  canReadFinance: boolean;
};

/** Builds the detail view from the project row already held by the list query. */
export function projectDetailsFromList(
  project: Project,
  financial: ProjectFinancial | null | undefined,
  options: ProjectDetailsFromListOptions,
): ProjectDetails {
  const lead = project.lead;
  const contact = lead.contact;
  const company = contact.company;

  return {
    id: project.id,
    projectProgressStatus: project.projectProgressStatus,
    invoiceStatus: options.canReadFinance ? project.invoiceStatus : undefined,
    qboCustomerId: project.qboCustomerId,
    attachments: project.attachments ?? lead.attachments,
    financial: options.canReadFinance ? financial ?? null : null,
    overview: project.overview,
    notes: project.notes,
    lead: {
      id: lead.id,
      leadNumber: lead.leadNumber,
      name: lead.name,
      startDate: lead.startDate ?? undefined,
      location: lead.location,
      addressLink: lead.addressLink,
      status: lead.status,
      notes: lead.notes,
      inReview: lead.inReview,
      estimate: lead.estimate,
      contact: contact
        ? {
            id: contact.id ?? 0,
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            occupation: contact.occupation,
            address: contact.address,
            addressLink: contact.addressLink,
            isCustomer: contact.isCustomer,
            isClient: contact.isClient,
            company: company
              ? {
                  id: company.id,
                  name: company.name,
                  address: company.address,
                  type: company.type,
                  serviceId: company.serviceId,
                  isCustomer: company.isCustomer,
                  isClient: company.isClient,
                }
              : null,
          }
        : null,
      projectType: lead.projectType
        ? { id: lead.projectType.id, name: lead.projectType.name }
        : null,
    },
  };
}
