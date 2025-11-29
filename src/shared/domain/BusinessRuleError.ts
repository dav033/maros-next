export type BusinessErrorKind =
  | "VALIDATION_ERROR"
  | "FORMAT_ERROR"
  | "POLICY_VIOLATION"
  | "INVALID_TRANSITION"
  | "INTEGRITY_VIOLATION"
  | "CONFLICT"
  | "NOT_FOUND";

export class BusinessRuleError extends Error {
  readonly kind: BusinessErrorKind;
  readonly details?: Record<string, unknown> | undefined;

  constructor(
    kind: BusinessErrorKind,
    message: string,
    options?: { details?: Record<string, unknown> }
  ) {
    super(message);
    this.name = "BusinessRuleError";
    this.kind = kind;
    this.details = options?.details;
  }
}

export const businessError = (
  kind: BusinessErrorKind,
  message: string,
  details?: Record<string, unknown>
) =>
  details !== undefined
    ? new BusinessRuleError(kind, message, { details })
    : new BusinessRuleError(kind, message);

export function assertBusiness(
  condition: unknown,
  kind: BusinessErrorKind,
  message: string,
  details?: Record<string, unknown>
): asserts condition {
  if (!condition) throw businessError(kind, message, details);
}
