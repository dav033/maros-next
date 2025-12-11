import type { RestorationFinalReport, RestorationVisitReport } from "./models";

export type ReportSubmitResult = {
  redirectUrl?: string;
  message?: string;
};

export interface ReportsRepositoryPort {
  getRestorationVisit(leadNumber: string): Promise<RestorationVisitReport>;
  submitRestorationVisit(report: RestorationVisitReport): Promise<ReportSubmitResult>;

  getRestorationFinal(leadNumber: string): Promise<RestorationFinalReport>;
  submitRestorationFinal(report: RestorationFinalReport): Promise<ReportSubmitResult>;
}







