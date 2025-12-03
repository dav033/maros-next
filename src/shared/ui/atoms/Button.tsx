import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
};

const base =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-dark)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-light)] hover:bg-[var(--color-primary-alt)]",
  secondary:
    "bg-[var(--color-gray-alt)] text-[var(--color-light)] hover:bg-[var(--color-gray)]",
  ghost:
    "bg-transparent text-[var(--color-light)] hover:bg-[var(--color-gray-subtle)]",
  danger:
    "bg-red-600 text-white hover:bg-red-500",
  subtle:
    "bg-[var(--color-gray-subtle)] text-[var(--color-light)] hover:bg-[var(--color-gray-alt)]",
};

const sizes: Record<Size, string> = {
  sm: "text-xs px-2 py-1 min-h-[32px]",
  md: "text-sm px-3 py-2 min-h-[40px]",
  lg: "text-base px-4 py-3 min-h-[48px]",
};

export function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className = "",
  loading = false,
  disabled,
  fullWidth = false,
  children,
  ...props
}: ButtonProps) {
  const widthClass = fullWidth ? "w-full sm:w-auto" : "";
  const classes = [base, variants[variant], sizes[size], widthClass, className]
    .filter(Boolean)
    .join(" ");

  const isDisabled = disabled || loading;

  return (
    <button className={classes} disabled={isDisabled} {...props}>
      {loading ? (
        <>
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
