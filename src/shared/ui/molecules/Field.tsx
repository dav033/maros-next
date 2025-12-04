import type { ReactNode } from "react";

export interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  htmlFor?: string;
}

/**
 * Wrapper component that provides consistent label, error, and hint styling
 * for form controls. Reduces duplication across Input, Select, and other form components.
 */
export function Field({ label, error, hint, children, htmlFor }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label 
          htmlFor={htmlFor} 
          className="text-xs font-medium uppercase tracking-wide text-gray-300"
        >
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {!error && hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}