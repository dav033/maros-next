import * as React from "react";

export type TypographyVariant = 
  | "h1" 
  | "h2" 
  | "h3" 
  | "h4" 
  | "body" 
  | "small" 
  | "caption";

export type TypographyColor = 
  | "light" 
  | "muted" 
  | "gray" 
  | "primary" 
  | "success" 
  | "warning" 
  | "error";

export interface TypographyProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}

const variantStyles: Record<TypographyVariant, string> = {
  h1: "text-2xl sm:text-3xl font-bold",
  h2: "text-xl sm:text-2xl font-semibold",
  h3: "text-lg sm:text-xl font-semibold",
  h4: "text-base sm:text-lg font-medium",
  body: "text-sm sm:text-base",
  small: "text-xs sm:text-sm",
  caption: "text-xs",
};

const colorStyles: Record<TypographyColor, string> = {
  light: "text-theme-light",
  muted: "text-theme-muted",
  gray: "text-gray-400",
  primary: "text-blue-400",
  success: "text-green-400",
  warning: "text-yellow-400",
  error: "text-red-400",
};

const defaultElements: Record<TypographyVariant, React.ElementType> = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  small: "p",
  caption: "span",
};

export function Typography({
  variant = "body",
  color = "light",
  className = "",
  children,
  as,
}: TypographyProps) {
  const Component = as || defaultElements[variant];
  const classes = `${variantStyles[variant]} ${colorStyles[color]} ${className}`.trim();

  return <Component className={classes}>{children}</Component>;
}
