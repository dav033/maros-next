import type { InputHTMLAttributes, ReactNode } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;
  hint?: string;
};

export function Input({
  label,
  error,
  leftAddon,
  rightAddon,
  hint,
  id,
  className = "",
  value,
  ...props
}: InputProps) {
  const inputId =
    id ??
    (label ? `${String(label).toLowerCase().replace(/\s+/g, "-")}-input` : undefined);

  const baseInputClass = [
    "block w-full rounded-lg border bg-theme-dark text-theme-light placeholder:text-gray-400",
    "border-theme-gray focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none",
    leftAddon ? "pl-10" : "pl-3",
    rightAddon ? "pr-10" : "pr-3",
    "py-2 text-sm cursor-pointer",
    error ? "border-red-500 focus:ring-red-500" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const normalizedValue = value ?? "";

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium uppercase tracking-wide text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftAddon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            {leftAddon}
          </span>
        )}
        <input id={inputId} className={baseInputClass} value={normalizedValue} {...props} />
        {rightAddon && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
            {rightAddon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      {!error && hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
