"use client";

import type { HTMLAttributes, ReactNode } from "react";

export type AlertVariant = "info" | "success" | "warning" | "error";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  children: ReactNode;
}

const variantClasses: Record<AlertVariant, string> = {
  info: "bg-blue-50 text-blue-800 border border-blue-200",
  success: "bg-green-50 text-green-800 border border-green-200",
  warning: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  error: "bg-red-50 text-red-800 border border-red-200",
};

export function Alert({
  variant = "info",
  className = "",
  children,
  ...rest
}: AlertProps) {
  const classes = variantClasses[variant];

  return (
    <div
      className={`rounded-md px-3 py-2 text-sm ${classes} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}