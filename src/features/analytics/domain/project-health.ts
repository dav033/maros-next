export type ProjectHealth = {
  projectId: number;
  projectNumber: string;
  projectName: string;
  status?: string;
  grossMarginPercent: number;
  backlogAmount: number;
  riskLevel: "low" | "medium" | "high";
  reasons: string[];
};
