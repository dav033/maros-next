import { BusinessRuleError } from "@/shared/domain";

export type LeadNumberRules = Readonly<{
  trim?: boolean;
  collapseWhitespace?: boolean;
  uppercase?: boolean;
  allowEmpty?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}>;

export const DEFAULT_LEAD_NUMBER_RULES: LeadNumberRules = {
  trim: true,
  collapseWhitespace: true,
  uppercase: false,
  allowEmpty: true,
  minLength: 0,
  maxLength: 0,
};

export function normalizeLeadNumber(
  raw: string,
  rules: LeadNumberRules = DEFAULT_LEAD_NUMBER_RULES
): string {
  const r = { ...DEFAULT_LEAD_NUMBER_RULES, ...rules };
  let v = String(raw ?? "");
  if (r.trim) v = v.trim();
  if (r.collapseWhitespace) v = v.replace(/\s+/g, " ");
  if (r.uppercase) v = v.toUpperCase();
  return v;
}

export function validateLeadNumberFormat(
  value: string,
  rules: LeadNumberRules = DEFAULT_LEAD_NUMBER_RULES
): void {
  const r = { ...DEFAULT_LEAD_NUMBER_RULES, ...rules };

  if (value === "") {
    if (!r.allowEmpty) {
      throw new BusinessRuleError(
        "VALIDATION_ERROR",
        "Lead number cannot be empty",
        { details: { field: "leadNumber" } }
      );
    }
    return;
  }

  if (r.minLength && r.minLength > 0 && value.length < r.minLength) {
    throw new BusinessRuleError(
      "FORMAT_ERROR",
      `Lead number must have at least ${r.minLength} characters`,
      { details: { field: "leadNumber", length: value.length } }
    );
  }
  if (r.maxLength && r.maxLength > 0 && value.length > r.maxLength) {
    throw new BusinessRuleError(
      "FORMAT_ERROR",
      `Lead number must have at most ${r.maxLength} characters`,
      { details: { field: "leadNumber", length: value.length } }
    );
  }
  if (r.pattern && !r.pattern.test(value)) {
    throw new BusinessRuleError(
      "FORMAT_ERROR",
      "Lead number format is invalid",
      { details: { field: "leadNumber", value } }
    );
  }
}

export function makeLeadNumber(
  input: string | null | undefined,
  rules: LeadNumberRules = DEFAULT_LEAD_NUMBER_RULES
): string | null {
  if (input == null) return null;
  const normalized = normalizeLeadNumber(input, rules);
  validateLeadNumberFormat(normalized, rules);
  return normalized;
}

export async function ensureLeadNumberAvailable(
  value: string,
  exists: (n: string) => Promise<boolean>
): Promise<void> {
  if (!value) return;
  const taken = await exists(value);
  if (taken) {
    throw new BusinessRuleError("CONFLICT", "Lead number already in use", {
      details: { field: "leadNumber", value },
    });
  }
}
