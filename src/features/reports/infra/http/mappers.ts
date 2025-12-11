import type {
  ActivityRow,
  EvidenceImageRow,
  RestorationFinalReport,
  RestorationVisitReport,
} from "../../domain/models";
import type { ReportSubmitResult } from "../../domain/ports";

export type RestorationVisitDTO = {
  leadNumber?: string;
  projectNumber?: string;
  project_numer?: string;
  project_name?: string;
  project_location?: string;
  client_name?: string;
  client_type?: string;
  customer_name?: string;
  email?: string;
  phone?: string;
  date_started?: string;
  overview?: string;
  language?: string;
  activities?: Array<{ activity?: string; imageUrls?: string[]; images?: string[] }>;
  additional_activities?: Array<{ activity?: string; imageUrls?: string[]; images?: string[] }>;
  next_activities?: string[];
  observations?: string[];
};

export type RestorationFinalDTO = {
  leadNumber?: string;
  project_name?: string;
  project_location?: string;
  client_name?: string;
  client_type?: string;
  contact_name?: string;
  customer_name?: string;
  email?: string;
  phone?: string;
  completion_date?: string;
  overview?: string;
  final_evaluation?: string;
  language?: string;
  completed_activities?: string[];
  evidence_images?: Array<{
    description?: string;
    imageUrls?: string[];
    images?: string[];
  }>;
};

export type SubmitReportResponse = {
  redirectUrl?: string;
  message?: string;
  url?: string;
};

const ensureArray = <T>(value: T[] | null | undefined): T[] =>
  Array.isArray(value) ? value : [];

const safeStringArray = (value: string[] | null | undefined): string[] =>
  ensureArray(value).filter((item) => item != null) as string[];

const mapActivityList = (rows?: Array<{ activity?: string; imageUrls?: string[]; images?: string[] }>): ActivityRow[] =>
  ensureArray(rows).map((row) => ({
    activity: row?.activity ?? "",
    imageUrls: row?.imageUrls ?? row?.images ?? [],
    imageFiles: [],
  }));

const mapEvidenceImages = (
  rows?: Array<{ description?: string; imageUrls?: string[]; images?: string[] }>
): EvidenceImageRow[] =>
  ensureArray(rows).map((row) => ({
    description: row?.description ?? "",
    imageUrls: row?.imageUrls ?? row?.images ?? [],
    imageFiles: [],
  }));

export function mapRestorationVisitFromApi(dto: RestorationVisitDTO): RestorationVisitReport {
  return {
    leadNumber: dto.leadNumber ?? dto.projectNumber ?? dto.project_numer ?? "",
    projectNumber: dto.projectNumber ?? dto.project_numer ?? "",
    projectName: dto.project_name ?? "",
    projectLocation: dto.project_location ?? "",
    clientName: dto.client_name ?? "",
    clientType: dto.client_type ?? "",
    customerName: dto.customer_name ?? "",
    email: dto.email ?? "",
    phone: dto.phone ?? "",
    dateStarted: dto.date_started ?? "",
    overview: dto.overview ?? "",
    language: dto.language ?? "",
    activities: mapActivityList(dto.activities),
    additionalActivities: mapActivityList(dto.additional_activities),
    nextActivities: safeStringArray(dto.next_activities),
    observations: safeStringArray(dto.observations),
  };
}

export function mapRestorationFinalFromApi(dto: RestorationFinalDTO): RestorationFinalReport {
  return {
    leadNumber: dto.leadNumber ?? "",
    projectName: dto.project_name ?? "",
    projectLocation: dto.project_location ?? "",
    clientName: dto.client_name ?? dto.contact_name ?? "",
    clientType: dto.client_type ?? "",
    customerName: dto.customer_name ?? "",
    email: dto.email ?? "",
    phone: dto.phone ?? "",
    completionDate: dto.completion_date ?? "",
    overview: dto.overview ?? "",
    finalEvaluation: dto.final_evaluation ?? "",
    language: dto.language ?? "",
    completedActivities: safeStringArray(dto.completed_activities),
    evidenceImages: mapEvidenceImages(dto.evidence_images),
  };
}

const appendFileList = (formData: FormData, prefix: string, files?: File[]) => {
  if (!files?.length) return;
  files.forEach((file, index) => {
    formData.append(`${prefix}[${index}]`, file);
  });
};

const buildVisitPayload = (report: RestorationVisitReport) => ({
  leadNumber: report.leadNumber,
  projectNumber: report.projectNumber ?? "",
  projectName: report.projectName,
  projectLocation: report.projectLocation,
  clientName: report.clientName,
  clientType: report.clientType,
  customerName: report.customerName,
  email: report.email,
  phone: report.phone,
  dateStarted: report.dateStarted,
  overview: report.overview,
  language: report.language,
  activities: ensureArray(report.activities).map((row) => ({
    activity: row.activity ?? "",
    imageUrls: ensureArray(row.imageUrls),
  })),
  additionalActivities: ensureArray(report.additionalActivities).map((row) => ({
    activity: row.activity ?? "",
    imageUrls: ensureArray(row.imageUrls),
  })),
  nextActivities: safeStringArray(report.nextActivities),
  observations: safeStringArray(report.observations),
});

export function buildRestorationVisitFormData(report: RestorationVisitReport): FormData {
  const formData = new FormData();
  const payload = buildVisitPayload(report);

  formData.append("payload", JSON.stringify(payload));

  ensureArray(report.activities).forEach((row, index) => {
    appendFileList(formData, `activities[${index}].files`, row.imageFiles);
  });

  ensureArray(report.additionalActivities).forEach((row, index) => {
    appendFileList(formData, `additionalActivities[${index}].files`, row.imageFiles);
  });

  return formData;
}

const buildFinalPayload = (report: RestorationFinalReport) => ({
  leadNumber: report.leadNumber,
  projectName: report.projectName,
  projectLocation: report.projectLocation,
  clientName: report.clientName,
  clientType: report.clientType,
  customerName: report.customerName,
  email: report.email,
  phone: report.phone,
  completionDate: report.completionDate,
  overview: report.overview,
  finalEvaluation: report.finalEvaluation,
  language: report.language,
  completedActivities: safeStringArray(report.completedActivities),
  evidenceImages: ensureArray(report.evidenceImages).map((row) => ({
    description: row.description ?? "",
    imageUrls: ensureArray(row.imageUrls),
  })),
});

export function buildRestorationFinalFormData(report: RestorationFinalReport): FormData {
  const formData = new FormData();
  const payload = buildFinalPayload(report);

  formData.append("payload", JSON.stringify(payload));

  ensureArray(report.evidenceImages).forEach((row, index) => {
    appendFileList(formData, `evidenceImages[${index}].files`, row.imageFiles);
  });

  return formData;
}

export const normalizeSubmitResponse = (data: SubmitReportResponse | null | undefined): ReportSubmitResult => ({
  redirectUrl: data?.redirectUrl ?? data?.url,
  message: data?.message,
});





