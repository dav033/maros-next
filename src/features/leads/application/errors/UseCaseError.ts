export type UseCaseErrorKind = "INFRA_ERROR" | "UNEXPECTED";

export class UseCaseError extends Error {
  readonly kind: UseCaseErrorKind;
  readonly details?: Record<string, unknown> | undefined;

  constructor(
    kind: UseCaseErrorKind,
    message: string,
    options?: { details?: Record<string, unknown>; cause?: unknown }
  ) {
    super(message);
    this.name = "UseCaseError";
    this.kind = kind;
    this.details = options?.details;
    if (options?.cause !== undefined) {
      (this as unknown as { cause?: unknown }).cause = options.cause;
    }
  }
}
