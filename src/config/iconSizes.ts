export const ICON_SIZES = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export type IconSize = keyof typeof ICON_SIZES;

export function getIconSize(size: IconSize): number {
  return ICON_SIZES[size];
}

export function getIconSizeClass(size: IconSize): string {
  const sizeClassMap: Record<IconSize, string> = {
    xs: "text-sm",
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl",
    "2xl": "text-6xl",
    "3xl": "text-8xl",
  };

  return sizeClassMap[size];
}


