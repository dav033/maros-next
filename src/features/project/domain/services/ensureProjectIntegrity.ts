import type { Project } from "@/project/domain";
import { BusinessRuleError } from "@/shared/domain";

export function ensureProjectIntegrity(project: Project): void {
  const { startDate, endDate, payments } = project;

  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime()) && s > e) {
      throw new BusinessRuleError("VALIDATION_ERROR", "startDate cannot be after endDate");
    }
  }

  if (Array.isArray(payments)) {
    for (const p of payments) {
      if (typeof p !== "number" || !isFinite(p) || p < 0) {
        throw new BusinessRuleError("VALIDATION_ERROR", "payments must be non-negative numbers");
      }
    }
  }
}
