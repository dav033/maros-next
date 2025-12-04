import { BusinessRuleError } from "@/shared/domain";
import {
  countDigits,
  isValidEmail,
  normalizeText,
} from "@/shared/validation";
import type { ContactField, ContactValidationPolicies, ValidationIssue } from "../models";

export function collectContactValidationIssues(
  input: {
    name?: unknown;
    email?: unknown;
    phone?: unknown;
    occupation?: unknown;
    address?: unknown;
  },
  policies: ContactValidationPolicies = {}
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const name = normalizeText(input.name);
  const email = normalizeText(input.email);
  const phone = normalizeText(input.phone);

  if (!name) {
    issues.push({
      field: "name",
      code: "REQUIRED",
      message: "Contact name is required",
    });
  } else if (policies.maxNameLength && name.length > policies.maxNameLength) {
    issues.push({
      field: "name",
      code: "TOO_LONG",
      message: `Contact name must not exceed ${policies.maxNameLength} characters`,
      details: { length: name.length },
    });
  }

  if (email && !isValidEmail(email)) {
    issues.push({
      field: "email",
      code: "INVALID_EMAIL",
      message: "Email format is invalid",
      details: { value: email },
    });
  }

  if (phone) {
    const digits = countDigits(phone);
    const minDigits = policies.minPhoneDigits ?? 0;
    if (minDigits > 0 && digits < minDigits) {
      issues.push({
        field: "phone",
        code: "PHONE_TOO_SHORT",
        message: `Phone must have at least ${minDigits} digits`,
        details: { digits },
      });
    }
  }

  if (policies.requireAtLeastOneReach && !email && !phone) {
    issues.push({
      field: "global",
      code: "NO_CONTACT_METHOD",
      message: "At least one contact method (email or phone) is required",
    });
  }

  return issues;
}

export function assertNoValidationIssues(issues: ValidationIssue[]): void {
  if (issues.length > 0) {
    throw new BusinessRuleError("VALIDATION_ERROR", "Contact validation failed", {
      details: { issues },
    });
  }
}

export function validateOrThrow(
  input: {
    name?: unknown;
    email?: unknown;
    phone?: unknown;
    occupation?: unknown;
    address?: unknown;
  },
  policies: ContactValidationPolicies = {}
): void {
  const issues = collectContactValidationIssues(input, policies);
  assertNoValidationIssues(issues);
}
