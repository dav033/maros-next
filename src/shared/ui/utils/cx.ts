/**
 * Utility function to merge Tailwind CSS class names
 * Filters out falsy values and joins the rest with spaces
 * 
 * @example
 * cx('px-4', isActive && 'bg-blue-500', disabled ? 'opacity-50' : 'opacity-100')
 * // => 'px-4 bg-blue-500 opacity-100'
 */
export function cx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
