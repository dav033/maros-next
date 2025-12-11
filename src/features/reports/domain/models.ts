export type ReportAttachment = {
  url?: string;
  name?: string;
};

export type ActivityRow = {
  activity: string;
  imageUrls?: string[];
  imageFiles?: File[];
};

export type AdditionalActivityRow = ActivityRow;

export type EvidenceImageRow = {
  description: string;
  imageUrls?: string[];
  imageFiles?: File[];
};

export type RestorationVisitReport = {
  leadNumber: string;
  projectNumber?: string;
  projectName: string;
  projectLocation: string;
  clientName: string;
  clientType: string;
  customerName: string;
  email: string;
  phone: string;
  dateStarted: string;
  overview: string;
  language: string;
  activities: ActivityRow[];
  additionalActivities: AdditionalActivityRow[];
  nextActivities: string[];
  observations: string[];
};

export type RestorationFinalReport = {
  leadNumber: string;
  projectName: string;
  projectLocation: string;
  clientName: string;
  clientType: string;
  customerName: string;
  email: string;
  phone: string;
  completionDate: string;
  overview: string;
  finalEvaluation: string;
  language: string;
  completedActivities: string[];
  evidenceImages: EvidenceImageRow[];
};





