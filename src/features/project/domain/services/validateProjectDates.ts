import type { ISODate } from "@/shared/domain";
import { BusinessRuleError } from "@/shared/domain";

export function validateDateWithinRange(
  date: string,
  fieldName: string,
  minYearsBack = 20,
  maxYearsForward = 5
): void {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new BusinessRuleError("VALIDATION_ERROR", `${fieldName} is not a valid date`);
  }
  const now = new Date();
  const minDate = new Date(now.getFullYear() - minYearsBack, 0, 1);
  const maxDate = new Date(now.getFullYear() + maxYearsForward, 11, 31);
  if (parsedDate < minDate) {
    throw new BusinessRuleError("VALIDATION_ERROR", `${fieldName} cannot be more than ${minYearsBack} years in the past`);
  }
  if (parsedDate > maxDate) {
    throw new BusinessRuleError("VALIDATION_ERROR", `${fieldName} cannot be more than ${maxYearsForward} years in the future`);
  }
}

export function normalizeDateISO(date: string): ISODate {
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) {
    throw new BusinessRuleError("FORMAT_ERROR", "Invalid date format");
  }
  return parsed.toISOString().split("T")[0] as ISODate;
}
