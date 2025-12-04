import type { ReactNode } from "react";
import { cx } from "../utils/cx";

export type BadgeVariant = 
  | "primary" 
  | "secondary" 
  | "success" 
  | "danger" 
  | "warning" 
  | "info"
  | "purple"
  | "indigo"
  | "gray";

export type BadgeSize = "sm" | "md" | "lg";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  dot?: boolean;
  dotColor?: string;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  customColor?: string;
}

const variants: Record<BadgeVariant, { bg: string; text: string; border?: string }> = {
  primary: {
    bg: "bg-blue-500/15",
    text: "text-blue-400",
    border: "border-blue-500/40",
  },
  secondary: {
    bg: "bg-gray-500/15",
    text: "text-gray-400",
    border: "border-gray-500/40",
  },
  success: {
    bg: "bg-green-500/15",
    text: "text-green-400",
    border: "border-green-500/40",
  },
  danger: {
    bg: "bg-red-500/15",
    text: "text-red-400",
    border: "border-red-500/40",
  },
  warning: {
    bg: "bg-yellow-500/15",
    text: "text-yellow-400",
    border: "border-yellow-500/40",
  },
  info: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/40",
  },
  purple: {
    bg: "bg-purple-500/15",
    text: "text-purple-400",
    border: "border-purple-500/40",
  },
  indigo: {
    bg: "bg-indigo-500/15",
    text: "text-indigo-400",
    border: "border-indigo-500/40",
  },
  gray: {
    bg: "bg-theme-gray-subtle",
    text: "text-gray-300",
    border: "border-gray-600/50",
  },
};

const sizes: Record<BadgeSize, { text: string; padding: string; gap: string }> = {
  sm: {
    text: "text-xs",
    padding: "px-2 py-0.5",
    gap: "gap-1",
  },
  md: {
    text: "text-sm",
    padding: "px-3 py-1",
    gap: "gap-1.5",
  },
  lg: {
    text: "text-base",
    padding: "px-4 py-1.5",
    gap: "gap-2",
  },
};

export function Badge({
  children,
  variant = "gray",
  size = "sm",
  icon,
  dot = false,
  dotColor,
  interactive = false,
  onClick,
  className = "",
  customColor,
}: BadgeProps) {
  const variantStyles = variants[variant];
  const sizeStyles = sizes[size];

  const baseClasses = cx(
    "inline-flex items-center rounded-full font-medium",
    sizeStyles.text,
    sizeStyles.padding,
    icon || dot ? sizeStyles.gap : "",
    interactive ? "transition-colors cursor-pointer" : "",
    className
  );

  // If customColor is provided, calculate all styles from it
  const customStyles = customColor
    ? {
        backgroundColor: `${customColor}20`,
        color: customColor,
        borderColor: `${customColor}40`,
        borderWidth: "1px",
      }
    : undefined;

  const defaultClasses = !customStyles
    ? `${variantStyles.bg} ${variantStyles.text} ${
        interactive ? `hover:${variantStyles.bg.replace("/15", "/25")}` : ""
      }`
    : "";

  const content = (
    <>
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={
            dotColor
              ? { backgroundColor: dotColor }
              : undefined
          }
        />
      )}
      {icon && <span className="shrink-0 inline-flex items-center justify-center">{icon}</span>}
      <span className="truncate">{children}</span>
    </>
  );

  if (interactive || onClick) {
    return (
      <button
        type="button"
        className={`${baseClasses} ${defaultClasses} group`}
        onClick={onClick}
        style={customStyles}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={`${baseClasses} ${defaultClasses}`} style={customStyles}>
      {content}
    </span>
  );
}
