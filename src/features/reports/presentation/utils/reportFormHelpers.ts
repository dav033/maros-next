import type { ActivityRow, RestorationVisitReport } from "@/reports/domain/models";

export const createEmptyActivity = (): ActivityRow => ({
  activity: "",
  imageFiles: [],
  imageUrls: [],
});

export const EMPTY_VISIT: RestorationVisitReport = {
  leadNumber: "",
  projectNumber: "",
  projectName: "",
  projectLocation: "",
  clientName: "",
  clientType: "",
  customerName: "",
  email: "",
  phone: "",
  dateStarted: "",
  overview: "",
  language: "",
  activities: [createEmptyActivity()],
  additionalActivities: [],
  nextActivities: [],
  observations: [],
};

export const mapLanguage = (lang: string): string => {
  const normalized = lang?.toLowerCase() || "";
  if (
    normalized.includes("spanish") ||
    normalized === "es" ||
    normalized === "español"
  ) {
    return "es";
  }
  if (
    normalized.includes("english") ||
    normalized === "en" ||
    normalized === "inglés"
  ) {
    return "en";
  }
  return normalized || "en";
};

export const extractProjectFormData = (project: any) => {
  const lead = project?.lead;
  const contact = lead?.contact;
  const company = contact?.company;
  const clientType = company ? "company" : "individual";
  const clientName =
    company?.name || (contact?.isClient ? contact.name : "");
  const customerName = contact?.isCustomer
    ? contact.name
    : contact?.name || "";

  return {
    leadNumber: lead?.leadNumber || "",
    projectNumber: lead?.leadNumber || "",
    projectName: lead?.name || project?.overview || "",
    projectLocation: lead?.location || "",
    clientName,
    clientType,
    customerName,
    email: contact?.email || "",
    phone: contact?.phone || "",
    dateStarted: lead?.startDate ?? null,
    overview: project?.overview || "",
  };
};


