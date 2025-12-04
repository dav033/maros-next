/**
 * Standardized icon sizes to ensure consistency across the application.
 * Use these predefined sizes instead of arbitrary numbers.
 */
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

/**
 * Maps icon size keys to their pixel values.
 * @param size - The size key (xs, sm, md, lg, xl, 2xl, 3xl)
 * @returns The pixel value for the given size
 */
export function getIconSize(size: IconSize): number {
  return ICON_SIZES[size];
}

/**
 * Converts icon size to Tailwind classes for text-based icon sizing.
 * Useful when using className instead of size prop.
 */
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