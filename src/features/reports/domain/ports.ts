import type { RestorationFinalReport, RestorationVisitReport } from "./models";

export type ReportSubmitResult = {
  redirectUrl?: string;
  message?: string;
};

export interface ReportsRepositoryPort {
  getRestorationVisit(projectId: number): Promise<RestorationVisitReport>;
  submitRestorationVisit(report: RestorationVisitReport): Promise<ReportSubmitResult>;

  getRestorationFinal(projectId: number): Promise<RestorationFinalReport>;
  submitRestorationFinal(report: RestorationFinalReport): Promise<ReportSubmitResult>;
}







